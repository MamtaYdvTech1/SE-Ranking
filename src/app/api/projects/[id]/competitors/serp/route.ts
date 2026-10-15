import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import type { SerpTopResult } from '@/lib/rankings/types';

export const dynamic = 'force-dynamic';

// Organic click-through share by position, used to weight share of voice
const CTR_BY_POSITION: Record<number, number> = {
  1: 0.317, 2: 0.247, 3: 0.187, 4: 0.136, 5: 0.095, 6: 0.062, 7: 0.041, 8: 0.031, 9: 0.024, 10: 0.019,
};

interface SnapshotPayload {
  targetDomain: string;
  checkedAt: string;
  serp: Array<{ keywordId: string; keyword: string; results: SerpTopResult[] }>;
}

export interface SerpDomainRow {
  domain: string;
  isTarget: boolean;
  keywordsInTop10: number;
  keywordsInTop20: number;
  averagePosition: number | null;
  visibility: number; // % of tracked queries' CTR captured
  shareOfVoice: number; // % of all top-10 CTR captured across tracked queries
  estimatedTraffic: number;
  bestPosition: number | null;
  sharedKeywords: number; // queries where the project also ranks in the top 20
}

/**
 * GET /api/projects/[id]/competitors/serp?days=30
 * Aggregates the SERP snapshots saved by rank checks into a domain landscape for the project's keywords.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await verifyProjectAccess(req, id);
    if (!access.success) return access.error;
    const project = access.data.project;

    const days = Math.min(365, Math.max(1, parseInt(new URL(req.url).searchParams.get('days') || '30', 10) || 30));
    const since = new Date(Date.now() - days * 86400000);

    const [jobs, keywords] = await Promise.all([
      prisma.job.findMany({
        where: { projectId: project.id, type: 'RANK_CHECK', status: 'completed', createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        select: { payload: true, createdAt: true },
      }),
      prisma.keyword.findMany({
        where: { projectId: project.id, deletedAt: null },
        select: { id: true, keywordText: true, monthlySearchVolume: true, groupName: true, tags: true },
      }),
    ]);

    // Latest SERP per keyword across snapshots in the window
    const latestSerp = new Map<string, { keyword: string; results: SerpTopResult[]; checkedAt: string }>();
    let targetDomain = '';
    let lastCheckedAt: string | null = null;
    for (const job of jobs) {
      let payload: SnapshotPayload | null = null;
      try {
        payload = job.payload ? JSON.parse(job.payload) : null;
      } catch {}
      if (!payload?.serp) continue;
      targetDomain = targetDomain || payload.targetDomain;
      lastCheckedAt = lastCheckedAt || payload.checkedAt;
      for (const entry of payload.serp) {
        if (!latestSerp.has(entry.keywordId)) {
          latestSerp.set(entry.keywordId, { keyword: entry.keyword, results: entry.results, checkedAt: payload.checkedAt });
        }
      }
    }

    const volumeById = new Map(keywords.map((k) => [k.id, k.monthlySearchVolume || 0]));
    const metaById = new Map(
      keywords.map((k) => {
        let tags: string[] = [];
        try {
          const parsed = k.tags ? JSON.parse(k.tags) : [];
          if (Array.isArray(parsed)) tags = parsed.map(String);
        } catch {}
        return [k.id, { group: k.groupName || 'General', tags }];
      })
    );
    const activeIds = new Set(keywords.map((k) => k.id));
    const serpEntries = [...latestSerp.entries()].filter(([kwId]) => activeIds.has(kwId));
    const queries = serpEntries.length;
    targetDomain = targetDomain || project.domain.replace(/^www\./i, '').toLowerCase();

    const matchesTarget = (d: string) => d === targetDomain || d.endsWith(`.${targetDomain}`);
    const targetTop20 = new Set(
      serpEntries.filter(([, s]) => s.results.some((r) => r.position <= 20 && matchesTarget(r.domain))).map(([kwId]) => kwId)
    );

    const agg = new Map<string, { positions: number[]; ctr: number; traffic: number; shared: number }>();
    let totalCtr = 0;
    for (const [kwId, serp] of serpEntries) {
      const seen = new Set<string>();
      for (const r of serp.results) {
        // Group subdomains of the project under the project domain
        const domain = matchesTarget(r.domain) ? targetDomain : r.domain;
        if (seen.has(domain)) continue; // best position per domain per query
        seen.add(domain);
        const a = agg.get(domain) || { positions: [], ctr: 0, traffic: 0, shared: 0 };
        a.positions.push(r.position);
        const ctr = CTR_BY_POSITION[r.position] || 0;
        a.ctr += ctr;
        a.traffic += Math.round((volumeById.get(kwId) || 0) * ctr);
        if (r.position <= 20 && targetTop20.has(kwId)) a.shared++;
        totalCtr += ctr;
        agg.set(domain, a);
      }
    }

    const maxCtrPerQuery = CTR_BY_POSITION[1];
    const domains: SerpDomainRow[] = [...agg.entries()]
      .map(([domain, a]) => ({
        domain,
        isTarget: domain === targetDomain,
        keywordsInTop10: a.positions.filter((p) => p <= 10).length,
        keywordsInTop20: a.positions.filter((p) => p <= 20).length,
        averagePosition: a.positions.length > 0 ? Number((a.positions.reduce((x, y) => x + y, 0) / a.positions.length).toFixed(1)) : null,
        visibility: queries > 0 ? Number(((a.ctr / (queries * maxCtrPerQuery)) * 100).toFixed(2)) : 0,
        shareOfVoice: totalCtr > 0 ? Number(((a.ctr / totalCtr) * 100).toFixed(2)) : 0,
        estimatedTraffic: a.traffic,
        bestPosition: a.positions.length > 0 ? Math.min(...a.positions) : null,
        sharedKeywords: domain === targetDomain ? targetTop20.size : a.shared,
      }))
      .sort((x, y) => y.shareOfVoice - x.shareOfVoice || y.keywordsInTop10 - x.keywordsInTop10);

    // One entry per check day (latest check that day), oldest first, keyed by keyword text
    const byDay = new Map<string, { date: string; checkedAt: string; keywords: Record<string, SerpTopResult[]> }>();
    for (const job of [...jobs].reverse()) {
      let payload: SnapshotPayload | null = null;
      try {
        payload = job.payload ? JSON.parse(job.payload) : null;
      } catch {}
      if (!payload?.serp) continue;
      const date = payload.checkedAt.slice(0, 10);
      const day = byDay.get(date) || { date, checkedAt: payload.checkedAt, keywords: {} };
      day.checkedAt = payload.checkedAt;
      for (const entry of payload.serp) day.keywords[entry.keyword] = entry.results;
      byDay.set(date, day);
    }

    return NextResponse.json({
      success: true,
      snapshots: [...byDay.values()],
      targetDomain,
      queriesAnalyzed: queries,
      lastCheckedAt,
      domains,
      keywords: serpEntries.map(([keywordId, s]) => ({
        keywordId,
        keyword: s.keyword,
        searchVolume: volumeById.get(keywordId) || 0,
        group: metaById.get(keywordId)?.group || 'General',
        tags: metaById.get(keywordId)?.tags || [],
        checkedAt: s.checkedAt,
        results: s.results.slice(0, 10),
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load SERP competitors.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
