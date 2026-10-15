import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRankingProvider } from '@/lib/rankings/provider';
import type { KeywordCheckRequest } from '@/lib/rankings/types';
import { yepApiClient } from '@/lib/yepapi';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  keywords: z.array(z.string().trim().min(1).max(120)).min(1).max(100),
  accuracy: z.number().int().min(1).max(9).default(3),
  method: z.enum(['Soft', 'Hard']).default('Soft'),
  countryCode: z.string().trim().length(2).default('us'),
  languageCode: z.string().trim().min(2).max(5).default('en'),
  checkVolume: z.boolean().default(false),
});

const TOP_N = 10;

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./i, '')}${u.pathname.replace(/\/$/, '')}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * POST /api/seo/keyword-grouper
 * Clusters keywords by overlap of their live top-10 Google results (SERP similarity):
 * Soft = shares >= accuracy URLs with the cluster's main keyword; Hard = with every keyword in the cluster.
 */
export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || 'Invalid request' },
      { status: 400 }
    );
  }
  const { accuracy, method, countryCode, languageCode, checkVolume } = parsed.data;
  const keywords = Array.from(new Set(parsed.data.keywords.map((k) => k.trim())));

  const provider = getRankingProvider();
  if (!provider.isConfigured()) {
    return NextResponse.json({ success: false, error: 'SERP data provider is not configured.' }, { status: 503 });
  }

  const requests: KeywordCheckRequest[] = keywords.map((keyword, i) => ({
    keywordId: `g${i}`,
    keyword,
    searchEngine: 'google',
    countryCode: countryCode.toLowerCase(),
    languageCode,
    device: 'desktop',
    targetDomain: '',
  }));
  const serp = await provider.checkRankings(requests, { timeoutMs: 60000 });
  if (!serp.success && serp.error) {
    return NextResponse.json({ success: false, error: serp.error.message }, { status: 502 });
  }
  const urlSets = new Map<string, Set<string>>();
  for (const r of serp.results) {
    if (!r.topResults) continue;
    urlSets.set(r.keyword, new Set(r.topResults.slice(0, TOP_N).map((t) => normalizeUrl(t.url))));
  }
  if (urlSets.size === 0) {
    return NextResponse.json(
      { success: false, error: `The ${provider.name} provider did not return SERP results needed for grouping.` },
      { status: 502 }
    );
  }

  // Optional volumes (keyword order for cluster heads prefers higher volume)
  const volumes = new Map<string, number>();
  let volumeError: string | null = null;
  if (checkVolume) {
    if (!yepApiClient.isConfigured()) {
      volumeError = 'Search volume provider is not configured.';
    } else {
      const kw = await yepApiClient.getKeywords({ keywords, language: languageCode });
      if (kw.ok && kw.data) {
        for (const m of kw.data.keywords) volumes.set(m.keyword.toLowerCase(), m.volume ?? 0);
      } else {
        volumeError = kw.error?.message || 'Search volume lookup failed.';
      }
    }
  }
  const volumeOf = (k: string) => volumes.get(k.toLowerCase()) ?? 0;

  const shared = (a: string, b: string) => {
    const sa = urlSets.get(a);
    const sb = urlSets.get(b);
    if (!sa || !sb) return 0;
    let n = 0;
    for (const u of sa) if (sb.has(u)) n++;
    return n;
  };

  const ordered = keywords.filter((k) => urlSets.has(k)).sort((a, b) => volumeOf(b) - volumeOf(a));
  const clusters: Array<{ head: string; members: string[] }> = [];
  for (const kw of ordered) {
    const target = clusters.find((c) =>
      method === 'Hard' ? c.members.every((m) => shared(m, kw) >= accuracy) : shared(c.head, kw) >= accuracy
    );
    if (target) target.members.push(kw);
    else clusters.push({ head: kw, members: [kw] });
  }

  const result = clusters
    .map((c, idx) => {
      const items = c.members.map((m) => ({
        text: m,
        volume: volumeOf(m),
        // Share of the main keyword's top-10 URLs this keyword also ranks with
        similarity: m === c.head ? 100 : Math.round((shared(c.head, m) / TOP_N) * 100),
      }));
      return {
        id: `cluster_${idx + 1}`,
        name: c.head,
        keywords: items,
        totalVolume: items.reduce((acc, k) => acc + k.volume, 0),
      };
    })
    .sort((a, b) => b.keywords.length - a.keywords.length || b.totalVolume - a.totalVolume);

  return NextResponse.json({
    success: true,
    clusters: result,
    ungrouped: keywords.filter((k) => !urlSets.has(k)),
    volumeError,
  });
}
