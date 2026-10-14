import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthSession, getSessionFromCookie } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

type TimeRange = 'WEEK' | 'MONTH' | '3 MONTHS' | '6 MONTHS';
type GroupBy = 'DAYS' | 'WEEKS' | 'MONTHS';

const RANGE_DAYS: Record<TimeRange, number> = {
  WEEK: 7,
  MONTH: 30,
  '3 MONTHS': 90,
  '6 MONTHS': 180,
};

export interface ProjectHistoryMetrics {
  avg_pos: number | null;
  traffic: number | null;
  visibility: number | null;
  top10: number | null; // % of tracked keywords in the top 10
  mention: number | null;
  link: number | null;
}

interface Bucket {
  key: string;
  label: string;
  start: Date;
  end: Date;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function buildBuckets(range: TimeRange, groupBy: GroupBy, now: Date): Bucket[] {
  const rangeStart = startOfDay(new Date(now.getTime() - (RANGE_DAYS[range] - 1) * 86400000));
  const buckets: Bucket[] = [];

  if (groupBy === 'MONTHS') {
    let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    while (cursor <= now) {
      const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      buckets.push({
        key: cursor.toISOString(),
        label: cursor.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        start: cursor < rangeStart ? rangeStart : cursor,
        end: new Date(Math.min(next.getTime() - 1, now.getTime())),
      });
      cursor = next;
    }
    return buckets;
  }

  const stepDays = groupBy === 'WEEKS' ? 7 : 1;
  let cursor = rangeStart;
  while (cursor <= now) {
    const next = new Date(cursor.getTime() + stepDays * 86400000);
    buckets.push({
      key: cursor.toISOString(),
      label: cursor.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      start: cursor,
      end: new Date(Math.min(next.getTime() - 1, now.getTime())),
    });
    cursor = next;
  }
  return buckets;
}

/**
 * GET /api/projects/history?ids=a,b&range=MONTH&groupBy=DAYS
 * Per-project metric series bucketed from stored RankingHistory and AiSearchRecord rows.
 * Uses the same position weights as the projects list so the chart matches the table.
 * Buckets with no ranking check return null so the chart shows a gap instead of invented values.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = (await getAuthSession(req)) || (await getSessionFromCookie());
    if (!auth?.user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ids = (searchParams.get('ids') || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20);
    const rangeParam = (searchParams.get('range') || 'WEEK').toUpperCase() as TimeRange;
    const groupParam = (searchParams.get('groupBy') || 'DAYS').toUpperCase() as GroupBy;
    const range: TimeRange = rangeParam in RANGE_DAYS ? rangeParam : 'WEEK';
    const groupBy: GroupBy = ['DAYS', 'WEEKS', 'MONTHS'].includes(groupParam) ? groupParam : 'DAYS';

    if (ids.length === 0) {
      return NextResponse.json({ success: true, points: [] });
    }

    const projects = await prisma.project.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
        ...(auth.user.role === 'SUPERADMIN' ? {} : { userId: auth.user.id }),
      },
      select: { id: true },
    });
    const projectIds = projects.map((p) => p.id);

    const now = new Date();
    const buckets = buildBuckets(range, groupBy, now);
    const rangeStart = buckets[0]?.start ?? now;

    const [keywordCounts, history, aiRecords] = await Promise.all([
      prisma.keyword.groupBy({
        by: ['projectId'],
        where: { projectId: { in: projectIds }, deletedAt: null },
        _count: { id: true },
      }),
      prisma.rankingHistory.findMany({
        where: { projectId: { in: projectIds }, checkedAt: { gte: rangeStart, lte: now } },
        select: { projectId: true, keywordId: true, position: true, searchVolume: true, checkedAt: true },
        orderBy: { checkedAt: 'asc' },
      }),
      prisma.aiSearchRecord.findMany({
        where: { projectId: { in: projectIds }, checkedAt: { gte: rangeStart, lte: now } },
        select: { projectId: true, mentioned: true, citedUrl: true, checkedAt: true },
      }),
    ]);

    const kwTotal = new Map(keywordCounts.map((k) => [k.projectId, k._count.id]));

    const points = buckets.map((bucket) => {
      const point: Record<string, string | ProjectHistoryMetrics> = { date: bucket.label };

      for (const projectId of projectIds) {
        // Latest snapshot per keyword within this bucket
        const latestByKeyword = new Map<string, { position: number | null; searchVolume: number | null }>();
        for (const h of history) {
          if (h.projectId !== projectId || h.checkedAt < bucket.start || h.checkedAt > bucket.end) continue;
          latestByKeyword.set(h.keywordId, { position: h.position, searchVolume: h.searchVolume });
        }

        const aiInBucket = aiRecords.filter(
          (r) => r.projectId === projectId && r.checkedAt >= bucket.start && r.checkedAt <= bucket.end
        );

        const metrics: ProjectHistoryMetrics = {
          avg_pos: null,
          traffic: null,
          visibility: null,
          top10: null,
          mention: aiInBucket.length > 0 ? aiInBucket.filter((r) => r.mentioned).length : null,
          link: aiInBucket.length > 0 ? aiInBucket.filter((r) => Boolean(r.citedUrl)).length : null,
        };

        if (latestByKeyword.size > 0) {
          const snapshots = [...latestByKeyword.values()];
          const ranked = snapshots.filter((s) => s.position != null && s.position > 0 && s.position <= 100);
          const denominator = kwTotal.get(projectId) || snapshots.length;

          metrics.top10 = Number(((ranked.filter((s) => s.position! <= 10).length / denominator) * 100).toFixed(1));
          metrics.avg_pos = ranked.length > 0
            ? Number((ranked.reduce((acc, s) => acc + s.position!, 0) / ranked.length).toFixed(1))
            : null;
          metrics.traffic = Math.round(
            ranked.reduce(
              (acc, s) => acc + (s.searchVolume || 0) * (s.position! <= 3 ? 0.35 : s.position! <= 10 ? 0.15 : 0.03),
              0
            )
          );
          metrics.visibility = Number(
            (
              (ranked.reduce((acc, s) => acc + (s.position! <= 3 ? 1 : s.position! <= 10 ? 0.5 : 0.1), 0) /
                denominator) *
              100
            ).toFixed(2)
          );
        }

        point[projectId] = metrics;
      }

      return point;
    });

    return NextResponse.json({ success: true, range, groupBy, points });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load project history.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
