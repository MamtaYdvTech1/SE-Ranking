import { NextRequest, NextResponse } from "next/server";
import type { Project, ProjectCompetitor } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  CompetitorDto,
  CompetitorGapItemDto,
  CompetitorKeywordRankingDto,
  CompetitorOverviewDto,
  CompetitorRankCellDto,
  CompetitorVisibilityPointDto,
  CompetitorVisibilitySummaryDto,
} from "@/lib/types";

/**
 * /api/v1/projects/:id/competitors/* — competitor tracking from stored rank checks.
 * Competitor positions come from CompetitorRanking rows written during each rank check.
 */

const STALE_AFTER_DAYS = 7;

function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, statusCode: status, timestamp: new Date().toISOString(), data }, { status });
}

function fail(message: string, status = 400) {
  return NextResponse.json(
    { success: false, statusCode: status, timestamp: new Date().toISOString(), message, error: message },
    { status }
  );
}

function cleanDomain(input: string): string {
  return (input || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .toLowerCase();
}

const DOMAIN_RE = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

// Organic click-through share by position, for traffic estimates
const CTR_BY_POSITION: Record<number, number> = {
  1: 0.317, 2: 0.247, 3: 0.187, 4: 0.136, 5: 0.095, 6: 0.062, 7: 0.041, 8: 0.031, 9: 0.024, 10: 0.019,
};
const ctrFor = (pos: number) => CTR_BY_POSITION[pos] ?? (pos <= 20 ? 0.008 : 0.001);

function visibilityWeight(pos: number): number {
  if (pos === 1) return 1.0;
  if (pos === 2) return 0.85;
  if (pos === 3) return 0.7;
  if (pos <= 5) return 0.5;
  if (pos <= 10) return 0.3;
  if (pos <= 20) return 0.1;
  return 0;
}

function toCompetitorDto(c: ProjectCompetitor, lastCheckedAt: Date | null): CompetitorDto {
  return {
    id: c.id,
    projectId: c.projectId,
    name: c.name,
    domain: c.domain,
    notes: c.notes,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    lastCheckedAt: lastCheckedAt?.toISOString() ?? null,
  };
}

function isStale(d: Date | null): boolean {
  return !d || Date.now() - d.getTime() > STALE_AFTER_DAYS * 86400000;
}

/** Latest position per keyword from rows ordered newest-first. */
function latestByKeyword<T extends { keywordId: string }>(rows: T[]): Map<string, T> {
  const out = new Map<string, T>();
  for (const r of rows) if (!out.has(r.keywordId)) out.set(r.keywordId, r);
  return out;
}

function summarize(
  positions: Array<number | null>,
  totalKeywords: number,
  targetTop20: Set<string> | null,
  keywordIds: string[],
  volumes: number[]
): Omit<CompetitorVisibilitySummaryDto, "competitorId" | "domain" | "name" | "isTargetDomain" | "history"> {
  const ranked = positions.filter((p): p is number => p != null && p > 0 && p <= 100);
  const estimatedTraffic = Math.round(
    positions.reduce((acc: number, p, i) => acc + (p != null && p > 0 && p <= 100 ? volumes[i] * ctrFor(p) : 0), 0)
  );
  const inTop20Ids = keywordIds.filter((_, i) => positions[i] != null && positions[i]! <= 20);
  const overlap = targetTop20 ? inTop20Ids.filter((id) => targetTop20.has(id)).length : inTop20Ids.length;
  return {
    currentVisibility: totalKeywords > 0 ? Number(((ranked.reduce((a, p) => a + visibilityWeight(p), 0) / totalKeywords) * 100).toFixed(2)) : 0,
    currentAveragePosition: ranked.length > 0 ? Number((ranked.reduce((a, p) => a + p, 0) / ranked.length).toFixed(1)) : null,
    currentRankedCount: ranked.length,
    top3Count: ranked.filter((p) => p <= 3).length,
    top10Count: ranked.filter((p) => p <= 10).length,
    top20Count: ranked.filter((p) => p <= 20).length,
    top30Count: ranked.filter((p) => p <= 30).length,
    top100Count: ranked.length,
    unrankedCount: Math.max(0, totalKeywords - ranked.length),
    top20OverlapCount: overlap,
    top20OverlapPercentage: totalKeywords > 0 ? Number(((overlap / totalKeywords) * 100).toFixed(1)) : 0,
    estimatedTraffic,
  };
}

/** Daily visibility points from history rows (latest check per keyword per day). */
function dailyHistory(
  rows: Array<{ keywordId: string; position: number | null; checkedAt: Date }>,
  totalKeywords: number,
  volumeById: Map<string, number>
): CompetitorVisibilityPointDto[] {
  const byDay = new Map<string, Map<string, number | null>>();
  for (const r of rows) {
    const day = r.checkedAt.toISOString().slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, new Map());
    byDay.get(day)!.set(r.keywordId, r.position);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, kw]) => {
      const entries = [...kw.entries()].filter((e): e is [string, number] => e[1] != null && e[1] > 0 && e[1] <= 100);
      const ranked = entries.map(([, p]) => p);
      return {
        date,
        top10Count: ranked.filter((p) => p <= 10).length,
        estimatedTraffic: Math.round(entries.reduce((acc, [id, p]) => acc + (volumeById.get(id) || 0) * ctrFor(p), 0)),
        visibility: totalKeywords > 0 ? Number(((ranked.reduce((a, p) => a + visibilityWeight(p), 0) / totalKeywords) * 100).toFixed(2)) : 0,
        averagePosition: ranked.length > 0 ? Number((ranked.reduce((a, p) => a + p, 0) / ranked.length).toFixed(1)) : null,
        rankedKeywordsCount: ranked.length,
      };
    });
}

async function buildOverview(project: Project, days: number): Promise<CompetitorOverviewDto> {
  const since = new Date(Date.now() - days * 86400000);
  const [keywords, competitors, compRows, targetRows] = await Promise.all([
    prisma.keyword.findMany({
      where: { projectId: project.id, deletedAt: null, isActive: true },
      select: { id: true, currentPosition: true, monthlySearchVolume: true },
    }),
    prisma.projectCompetitor.findMany({ where: { projectId: project.id, deletedAt: null } }),
    prisma.competitorRanking.findMany({
      where: { projectId: project.id, checkedAt: { gte: since } },
      orderBy: { checkedAt: "desc" },
      select: { competitorId: true, keywordId: true, position: true, checkedAt: true },
    }),
    prisma.rankingHistory.findMany({
      where: { projectId: project.id, checkedAt: { gte: since } },
      orderBy: { checkedAt: "asc" },
      select: { keywordId: true, position: true, checkedAt: true },
    }),
  ]);

  const keywordIds = keywords.map((k) => k.id);
  const total = keywordIds.length;
  const volumes = keywords.map((k) => k.monthlySearchVolume || 0);
  const volumeById = new Map(keywords.map((k) => [k.id, k.monthlySearchVolume || 0]));
  const targetPositions = keywords.map((k) => k.currentPosition);
  const targetTop20 = new Set(keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 20).map((k) => k.id));

  const summaries: CompetitorVisibilitySummaryDto[] = [
    {
      competitorId: null,
      domain: project.domain,
      name: project.name,
      isTargetDomain: true,
      ...summarize(targetPositions, total, null, keywordIds, volumes),
      history: dailyHistory(targetRows, total, volumeById),
    },
  ];

  for (const comp of competitors) {
    const rows = compRows.filter((r) => r.competitorId === comp.id);
    const latest = latestByKeyword(rows);
    const positions = keywordIds.map((id) => latest.get(id)?.position ?? null);
    summaries.push({
      competitorId: comp.id,
      domain: comp.domain,
      name: comp.name,
      isTargetDomain: false,
      ...summarize(positions, total, targetTop20, keywordIds, volumes),
      history: dailyHistory([...rows].reverse(), total, volumeById),
    });
  }

  const lastChecked = compRows[0]?.checkedAt ?? project.lastRankingCheckAt ?? null;
  return {
    projectId: project.id,
    targetDomain: project.domain,
    totalKeywordsCount: total,
    lastCheckedAt: lastChecked?.toISOString() ?? null,
    latestCheckDate: lastChecked?.toISOString() ?? null,
    isStale: isStale(lastChecked),
    summaries,
  };
}

function opportunityScore(volume: number, targetPos: number | null, bestCompPos: number): number {
  // Volume contributes up to 60 (log scale, 100k+ searches = max); ranking gap up to 40
  const volumePart = Math.min(1, Math.log10(volume + 1) / 5) * 60;
  const gapPart = targetPos == null ? 40 : Math.min(40, Math.max(0, targetPos - bestCompPos) * 4);
  return Math.round(volumePart + gapPart);
}

export async function handleCompetitorsV1(
  request: NextRequest,
  method: string,
  subPath: string,
  project: Project
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const rest = subPath.replace(/^competitors\/?/, "");

  const lastCheckFor = async (competitorIds: string[]) => {
    const rows = await prisma.competitorRanking.groupBy({
      by: ["competitorId"],
      where: { projectId: project.id, competitorId: { in: competitorIds } },
      _max: { checkedAt: true },
    });
    return new Map(rows.map((r) => [r.competitorId, r._max.checkedAt]));
  };

  // GET/POST competitors
  if (rest === "") {
    if (method === "GET") {
      const comps = await prisma.projectCompetitor.findMany({
        where: { projectId: project.id, deletedAt: null },
        orderBy: { createdAt: "asc" },
      });
      const last = await lastCheckFor(comps.map((c) => c.id));
      return ok(comps.map((c) => toCompetitorDto(c, last.get(c.id) ?? null)));
    }
    if (method === "POST") {
      const body = await request.json().catch(() => ({}));
      const domain = cleanDomain(body.domain || "");
      if (!DOMAIN_RE.test(domain)) return fail("Enter a valid competitor domain, e.g. example.com.");
      if (domain === cleanDomain(project.domain)) return fail("A competitor cannot be the project's own domain.");
      const existing = await prisma.projectCompetitor.findFirst({ where: { projectId: project.id, domain, deletedAt: null } });
      if (existing) return fail("This competitor is already tracked.", 409);
      const created = await prisma.projectCompetitor.create({
        data: {
          projectId: project.id,
          name: (body.name || domain).toString().slice(0, 120),
          domain,
          notes: body.notes ? String(body.notes).slice(0, 1000) : null,
          visibilityScore: 0,
          avgPosition: null,
          commonKeywordsCount: 0,
        },
      });
      return ok(toCompetitorDto(created, null), 201);
    }
  }

  // GET overview / visibility
  if ((rest === "overview" || rest === "visibility") && method === "GET") {
    const days = Math.min(365, Math.max(1, parseInt(searchParams.get("days") || "30", 10) || 30));
    return ok(await buildOverview(project, days));
  }

  // GET keywords — keyword x competitor position matrix
  if (rest === "keywords" && method === "GET") {
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get("pageSize") || "50", 10) || 50));
    const search = searchParams.get("search")?.trim();
    const where = {
      projectId: project.id,
      deletedAt: null,
      ...(search ? { keywordText: { contains: search, mode: "insensitive" as const } } : {}),
    };
    const [totalCount, keywords, comps] = await Promise.all([
      prisma.keyword.count({ where }),
      prisma.keyword.findMany({ where, orderBy: { keywordText: "asc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.projectCompetitor.findMany({ where: { projectId: project.id, deletedAt: null } }),
    ]);
    const rows = await prisma.competitorRanking.findMany({
      where: { projectId: project.id, keywordId: { in: keywords.map((k) => k.id) } },
      orderBy: { checkedAt: "desc" },
    });
    const latest = new Map<string, (typeof rows)[number]>();
    for (const r of rows) {
      const key = `${r.competitorId}:${r.keywordId}`;
      if (!latest.has(key)) latest.set(key, r);
    }
    const items: CompetitorKeywordRankingDto[] = keywords.map((k) => {
      const competitorRanks: Record<string, CompetitorRankCellDto> = {};
      for (const c of comps) {
        const r = latest.get(`${c.id}:${k.id}`);
        competitorRanks[c.id] = {
          competitorId: c.id,
          position: r?.position ?? null,
          previousPosition: r?.previousPosition ?? null,
          positionChange: r?.positionChange ?? null,
          rankedUrl: r?.url ?? null,
        };
      }
      return {
        keywordId: k.id,
        keywordText: k.keywordText,
        searchVolume: k.monthlySearchVolume,
        targetPosition: k.currentPosition,
        targetPreviousPosition: k.previousPosition,
        targetPositionChange: k.positionChange,
        targetRankedUrl: k.rankedUrl,
        competitorRanks,
      };
    });
    const lastChecked = rows[0]?.checkedAt ?? null;
    const last = await lastCheckFor(comps.map((c) => c.id));
    return ok({
      items,
      totalCount,
      pageNumber: page,
      pageSize,
      competitors: comps.map((c) => toCompetitorDto(c, last.get(c.id) ?? null)),
      lastCheckedAt: lastChecked?.toISOString() ?? null,
      isStale: isStale(lastChecked),
    });
  }

  // POST gap/:keywordId/track — start tracking a gap keyword
  const trackMatch = rest.match(/^gap\/([^/]+)\/track$/);
  if (trackMatch && method === "POST") {
    const updated = await prisma.keyword.updateMany({
      where: { id: trackMatch[1], projectId: project.id, deletedAt: null },
      data: { isActive: true },
    });
    if (updated.count === 0) return fail("Keyword not found", 404);
    return ok(true);
  }

  // GET gap — keywords where a competitor outranks the project
  if (rest === "gap" && method === "GET") {
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10) || 25));
    const search = searchParams.get("search")?.trim().toLowerCase();
    const onlyCompetitor = searchParams.get("competitorId");
    const sort = searchParams.get("sort") || "opportunity";

    const [keywords, comps, rows] = await Promise.all([
      prisma.keyword.findMany({ where: { projectId: project.id, deletedAt: null } }),
      prisma.projectCompetitor.findMany({ where: { projectId: project.id, deletedAt: null } }),
      prisma.competitorRanking.findMany({ where: { projectId: project.id }, orderBy: { checkedAt: "desc" } }),
    ]);
    const compById = new Map(comps.map((c) => [c.id, c]));
    const latest = new Map<string, (typeof rows)[number]>();
    for (const r of rows) {
      const key = `${r.competitorId}:${r.keywordId}`;
      if (!latest.has(key) && compById.has(r.competitorId)) latest.set(key, r);
    }

    let items: CompetitorGapItemDto[] = [];
    for (const k of keywords) {
      if (search && !k.keywordText.toLowerCase().includes(search)) continue;
      const ranks = comps
        .map((c) => ({ c, r: latest.get(`${c.id}:${k.id}`) }))
        .filter((x) => x.r && x.r.position != null && (!onlyCompetitor || x.c.id === onlyCompetitor));
      if (ranks.length === 0) continue;
      const best = ranks.reduce((a, b) => (b.r!.position! < a.r!.position! ? b : a));
      const bestPos = best.r!.position!;
      if (k.currentPosition != null && k.currentPosition <= bestPos) continue;
      items.push({
        keywordId: k.id,
        keywordText: k.keywordText,
        isActive: k.isActive,
        searchVolume: k.monthlySearchVolume,
        keywordDifficulty: k.keywordDifficulty,
        cpcUsd: k.cpcUsd,
        targetPosition: k.currentPosition,
        targetRankedUrl: k.rankedUrl,
        bestCompetitorId: best.c.id,
        bestCompetitorName: best.c.name,
        bestCompetitorDomain: best.c.domain,
        bestCompetitorPosition: bestPos,
        bestCompetitorRankedUrl: best.r!.url,
        opportunityScore: opportunityScore(k.monthlySearchVolume || 0, k.currentPosition, bestPos),
        competitorRanks: ranks.map(({ c, r }) => ({
          competitorId: c.id,
          competitorName: c.name,
          competitorDomain: c.domain,
          position: r!.position,
          rankedUrl: r!.url,
        })),
        checkDate: best.r!.checkedAt.toISOString(),
      });
    }

    items.sort((a, b) =>
      sort === "volume"
        ? (b.searchVolume || 0) - (a.searchVolume || 0)
        : sort === "position"
        ? a.bestCompetitorPosition - b.bestCompetitorPosition
        : b.opportunityScore - a.opportunityScore
    );
    const totalCount = items.length;
    items = items.slice((page - 1) * pageSize, page * pageSize);
    const lastChecked = rows[0]?.checkedAt ?? null;
    const last = await lastCheckFor(comps.map((c) => c.id));
    return ok({
      items,
      totalCount,
      pageNumber: page,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      competitors: comps.map((c) => toCompetitorDto(c, last.get(c.id) ?? null)),
      latestCheckDate: lastChecked?.toISOString() ?? null,
      lastCheckedAt: lastChecked?.toISOString() ?? null,
      isStale: isStale(lastChecked),
    });
  }

  // PUT/DELETE competitors/:competitorId
  const idMatch = rest.match(/^([^/]+)$/);
  if (idMatch) {
    const comp = await prisma.projectCompetitor.findFirst({
      where: { id: idMatch[1], projectId: project.id, deletedAt: null },
    });
    if (!comp) return fail("Competitor not found", 404);

    if (method === "PUT") {
      const body = await request.json().catch(() => ({}));
      const domain = body.domain ? cleanDomain(body.domain) : comp.domain;
      if (!DOMAIN_RE.test(domain)) return fail("Enter a valid competitor domain, e.g. example.com.");
      const updated = await prisma.projectCompetitor.update({
        where: { id: comp.id },
        data: {
          name: body.name ? String(body.name).slice(0, 120) : comp.name,
          domain,
          notes: body.notes !== undefined ? (body.notes ? String(body.notes).slice(0, 1000) : null) : comp.notes,
        },
      });
      const last = await lastCheckFor([comp.id]);
      return ok(toCompetitorDto(updated, last.get(comp.id) ?? null));
    }
    if (method === "DELETE") {
      await prisma.projectCompetitor.update({ where: { id: comp.id }, data: { deletedAt: new Date() } });
      return ok(true);
    }
  }

  return fail(`Unsupported competitors endpoint: ${method} ${subPath}`, 404);
}
