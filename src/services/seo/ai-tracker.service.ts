import { prisma } from '@/lib/db/prisma';

/**
 * Storage for AI Results Tracker answers. Each check adds a Prompt row (answer text, mention/link
 * flags, competitor domains named in the answer) and a Citation row per source URL the answer links,
 * under one per-project Analysis with searchType "ai-tracker".
 */

export interface AnswerSource {
  url: string;
  domain: string;
}

const TRACKER_SEARCH_TYPE = 'ai-tracker';

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

/** Markdown links and bare URLs in an answer, de-duplicated, in order of appearance. */
export function extractSources(text: string): AnswerSource[] {
  const urls: string[] = [];
  for (const m of text.matchAll(/\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g)) urls.push(m[1]);
  for (const m of text.matchAll(/(?<![(\[])\bhttps?:\/\/[^\s)\]>"']+/g)) urls.push(m[0]);
  const seen = new Set<string>();
  const out: AnswerSource[] = [];
  for (const raw of urls) {
    const url = raw.replace(/[.,;:!?]+$/, '');
    const domain = hostOf(url);
    if (!domain || seen.has(url)) continue;
    seen.add(url);
    out.push({ url, domain });
  }
  return out;
}

async function trackerAnalysisId(projectId: string, domain: string): Promise<string> {
  const existing = await prisma.analysis.findFirst({
    where: { projectId, searchType: TRACKER_SEARCH_TYPE },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma.analysis.create({
    data: { projectId, domain, searchType: TRACKER_SEARCH_TYPE, scope: domain, status: 'tracking' },
  });
  return created.id;
}

export async function recordTrackerAnswer(input: {
  projectId: string;
  projectDomain: string;
  query: string;
  engine: string;
  answer: string;
  sources: AnswerSource[];
  mentioned: boolean;
  linked: boolean;
}) {
  const analysisId = await trackerAnalysisId(input.projectId, input.projectDomain);
  const isOwn = (d: string) => d === input.projectDomain || d.endsWith(`.${input.projectDomain}`);
  const competitorDomains = Array.from(new Set(input.sources.map((s) => s.domain).filter((d) => !isOwn(d))));

  await prisma.prompt.create({
    data: {
      analysisId,
      prompt: input.query,
      topic: 'Tracked',
      engine: input.engine,
      mention: input.mentioned,
      link: input.linked,
      competitors: JSON.stringify(competitorDomains),
      fullAnswer: input.answer.slice(0, 8000),
      answerDate: new Date(),
      visibility: input.linked ? 'Cited' : input.mentioned ? 'Mentioned' : 'Not Mentioned',
    },
  });

  if (input.sources.length > 0) {
    await prisma.citation.createMany({
      data: input.sources.map((s) => ({
        analysisId,
        domain: s.domain,
        url: s.url,
        topics: JSON.stringify({ prompt: input.query, engine: input.engine }),
      })),
    });
  }
}

export async function getTrackerInsights(projectId: string, projectDomain: string) {
  const analysis = await prisma.analysis.findFirst({
    where: { projectId, searchType: TRACKER_SEARCH_TYPE },
    include: {
      prompts: { orderBy: { createdAt: 'desc' } },
      citations: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!analysis) return { totalAnswers: 0, competitors: [], sources: [], answers: [] };

  const isOwn = (d: string) => d === projectDomain || d.endsWith(`.${projectDomain}`);
  const totalAnswers = analysis.prompts.length;

  // Domains named in answers (competitors) with how often they appear
  const comp = new Map<string, { answers: number; prompts: Set<string>; engines: Set<string> }>();
  for (const p of analysis.prompts) {
    let domains: string[] = [];
    try {
      domains = JSON.parse(p.competitors || '[]');
    } catch {}
    for (const d of domains) {
      const c = comp.get(d) || { answers: 0, prompts: new Set<string>(), engines: new Set<string>() };
      c.answers++;
      c.prompts.add(p.prompt);
      c.engines.add(p.engine);
      comp.set(d, c);
    }
  }
  const ownAnswers = analysis.prompts.filter((p) => p.mention || p.link).length;
  const totalMentions = [...comp.values()].reduce((a, c) => a + c.answers, 0) + ownAnswers;
  const pct = (n: number) => (totalMentions > 0 ? Number(((n / totalMentions) * 100).toFixed(1)) : 0);
  const competitors = [
    { domain: projectDomain, isOwn: true, answers: ownAnswers, prompts: new Set(analysis.prompts.filter((p) => p.mention || p.link).map((p) => p.prompt)).size, engines: [] as string[], shareOfVoice: pct(ownAnswers) },
    ...[...comp.entries()].map(([domain, c]) => ({
      domain,
      isOwn: false,
      answers: c.answers,
      prompts: c.prompts.size,
      engines: [...c.engines],
      shareOfVoice: pct(c.answers),
    })),
  ].sort((a, b) => b.answers - a.answers);

  // Cited source pages grouped by URL
  const pages = new Map<string, { domain: string; citations: number; prompts: Set<string>; engines: Set<string>; lastSeen: Date }>();
  for (const c of analysis.citations) {
    let meta: { prompt?: string; engine?: string } = {};
    try {
      meta = JSON.parse(c.topics || '{}');
    } catch {}
    const p = pages.get(c.url) || { domain: c.domain, citations: 0, prompts: new Set<string>(), engines: new Set<string>(), lastSeen: c.createdAt };
    p.citations++;
    if (meta.prompt) p.prompts.add(meta.prompt);
    if (meta.engine) p.engines.add(meta.engine);
    if (c.createdAt > p.lastSeen) p.lastSeen = c.createdAt;
    pages.set(c.url, p);
  }
  const sources = [...pages.entries()]
    .map(([url, p]) => ({
      url,
      domain: p.domain,
      isOwn: isOwn(p.domain),
      citations: p.citations,
      prompts: p.prompts.size,
      engines: [...p.engines],
      lastSeen: p.lastSeen.toISOString(),
    }))
    .sort((a, b) => b.citations - a.citations);

  return {
    totalAnswers,
    competitors,
    sources,
    answers: analysis.prompts.slice(0, 200).map((p) => {
      // Citations are written right after their prompt row
      const own = analysis.citations
        .filter((c) => {
          let meta: { prompt?: string; engine?: string } = {};
          try {
            meta = JSON.parse(c.topics || '{}');
          } catch {}
          return (
            meta.prompt === p.prompt &&
            meta.engine === p.engine &&
            Math.abs(c.createdAt.getTime() - p.createdAt.getTime()) < 60000
          );
        })
        .sort((a, b) => a.id.localeCompare(b.id));
      let competitorDomains: string[] = [];
      try {
        competitorDomains = JSON.parse(p.competitors || '[]');
      } catch {}
      return {
      id: p.id,
      sourcesCount: own.length,
      sources: own.map((c) => ({ url: c.url, domain: c.domain })),
      competitors: competitorDomains,
      prompt: p.prompt,
      engine: p.engine,
      mention: p.mention,
      link: p.link,
      status: p.visibility,
      answer: p.fullAnswer,
      answeredAt: (p.answerDate || p.createdAt).toISOString(),
      };
    }),
  };
}
