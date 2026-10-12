import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { EngineMetric, PromptItem, CitationItem, CompetitorItem, ScopeType, SearchType } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const domain = searchParams.get('domain');
    const projectId = searchParams.get('projectId');

    let analysis = null;

    if (id) {
      analysis = await prisma.analysis.findUnique({
        where: { id },
        include: {
          engines: true,
          prompts: true,
          citations: true,
          competitors: true,
        },
      });
    } else if (domain) {
      analysis = await prisma.analysis.findFirst({
        where: { domain },
        orderBy: { createdAt: 'desc' },
        include: {
          engines: true,
          prompts: true,
          citations: true,
          competitors: true,
        },
      });
    } else if (projectId) {
      analysis = await prisma.analysis.findFirst({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        include: {
          engines: true,
          prompts: true,
          citations: true,
          competitors: true,
        },
      });
    } else {
      analysis = await prisma.analysis.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
          engines: true,
          prompts: true,
          citations: true,
          competitors: true,
        },
      });
    }

    if (!analysis) {
      return NextResponse.json({ error: 'No analysis found.' }, { status: 404 });
    }

    const formatted = {
      id: analysis.id,
      projectId: analysis.projectId,
      domain: analysis.domain,
      scope: analysis.scope as ScopeType,
      brandName: analysis.brandName,
      country: analysis.country,
      countryCode: analysis.countryCode,
      searchType: analysis.searchType as SearchType,
      aiPresence: analysis.aiPresence,
      brandPresence: analysis.brandPresence,
      domainPresence: analysis.domainPresence,
      avgPosition: analysis.avgPosition,
      traffic: analysis.traffic,
      mentions: analysis.mentions,
      links: analysis.links,
      citationShare: analysis.citationShare,
      referringDomains: 41,
      status: analysis.status,
      createdAt: analysis.createdAt.toISOString(),
      engines: analysis.engines.map((e) => ({
        id: e.id,
        engineId: e.engineId,
        name: e.name,
        mentions: e.mentions,
        linkPresence: e.linkPresence,
        presence: e.presence,
        status: e.status,
      })) as EngineMetric[],
      prompts: analysis.prompts.map((p) => ({
        id: p.id,
        prompt: p.prompt,
        topic: p.topic,
        engine: p.engine,
        mention: p.mention,
        link: p.link,
        ads: p.ads,
        competitors: p.competitors ? JSON.parse(p.competitors) : [],
        fullAnswer: p.fullAnswer || undefined,
        answerDate: p.answerDate ? p.answerDate.toISOString().split('T')[0] : undefined,
        visibility: p.visibility as 'Visible' | 'Not Visible' | 'Partial',
      })) as PromptItem[],
      citations: analysis.citations.map((c) => ({
        id: c.id,
        domain: c.domain,
        url: c.url,
        citationShare: c.citationShare,
        visibility: c.visibility,
        topics: c.topics || '',
        domainTrust: c.domainTrust,
        pageTrust: c.pageTrust,
        organicTraffic: c.organicTraffic,
      })) as CitationItem[],
      competitors: analysis.competitors.map((cp) => ({
        id: cp.id,
        domain: cp.domain,
        brandName: cp.brandName || undefined,
        aiPresence: cp.aiPresence,
        domainPresence: cp.domainPresence,
        brandPresence: cp.brandPresence,
        avgPosition: cp.avgPosition,
        shareOfVoice: cp.shareOfVoice,
      })) as CompetitorItem[],
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve analysis.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
