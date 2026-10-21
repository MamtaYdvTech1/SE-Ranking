import { prisma } from '@/lib/db/prisma';
import { getRankingProvider } from '@/lib/rankings/provider';
import { KeywordCheckRequest, KeywordCheckResult, SearchEngineType } from '@/lib/rankings/types';

// Standard organic CTR distribution curve
const CTR_CURVE: Record<number, number> = {
  1: 0.317,
  2: 0.247,
  3: 0.187,
  4: 0.136,
  5: 0.095,
  6: 0.062,
  7: 0.041,
  8: 0.031,
  9: 0.024,
  10: 0.019,
};

function getVisibilityWeight(pos: number): number {
  if (pos === 1) return 1.0;
  if (pos === 2) return 0.85;
  if (pos === 3) return 0.7;
  if (pos <= 5) return 0.5;
  if (pos <= 10) return 0.3;
  if (pos <= 20) return 0.1;
  return 0;
}

export interface CollectRankingsResult {
  providerStatus: 'CONFIGURED' | 'UNCONFIGURED';
  message: string;
  checkedCount: number;
  rankedCount: number;
  unrankedCount: number;
}

/**
 * Checks and collects real organic rankings for the given project's keywords
 */
export async function collectRankingsForProject(
  projectId: string,
  options?: { timeoutMs?: number }
): Promise<CollectRankingsResult> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      keywords: {
        where: { deletedAt: null, isActive: true },
      },
      searchEngines: {
        where: { isActive: true },
      },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const keywords = project.keywords;
  if (keywords.length === 0) {
    return {
      providerStatus: 'CONFIGURED',
      message: 'No active keywords configured for this project.',
      checkedCount: 0,
      rankedCount: 0,
      unrankedCount: 0,
    };
  }

  const provider = getRankingProvider();
  if (!provider.isConfigured()) {
    return {
      providerStatus: 'UNCONFIGURED',
      message:
        'Ranking data provider is not configured. Connect a supported SEO data provider to start collecting rankings.',
      checkedCount: 0,
      rankedCount: 0,
      unrankedCount: 0,
    };
  }

  // Build requests for the active provider
  const requests: KeywordCheckRequest[] = keywords.map((k) => ({
    keywordId: k.id,
    keyword: k.keywordText,
    searchEngine: ((k.searchEngine || project.defaultSearchEngine || 'google').toLowerCase() as SearchEngineType),
    countryCode: k.countryCode || project.countryCode || 'in',
    languageCode: k.language || project.languageCode || 'en',
    device: (k.device as 'desktop' | 'mobile') || (project.defaultDevice as 'desktop' | 'mobile') || 'desktop',
    targetDomain: project.domain,
  }));

  const checkResponse = await provider.checkRankings(requests, {
    timeoutMs: options?.timeoutMs || 20000,
  });

  if (!checkResponse.success && checkResponse.error) {
    return {
      providerStatus: 'CONFIGURED',
      message: checkResponse.error.message || 'Provider failed to return rankings.',
      checkedCount: 0,
      rankedCount: 0,
      unrankedCount: 0,
    };
  }

  const now = new Date();
  let rankedCount = 0;
  let unrankedCount = 0;

  for (const res of checkResponse.results) {
    const existingKw = keywords.find((k) => k.id === res.keywordId);
    if (!existingKw) continue;

    const prevPos = existingKw.currentPosition;
    const newPos = res.position;

    let positionChange = 0;
    if (prevPos != null && newPos != null) {
      positionChange = prevPos - newPos; // positive means improved (e.g. #5 -> #2 = +3)
    }

    let bestPos = existingKw.bestPosition;
    let worstPos = existingKw.worstPosition;

    if (newPos != null) {
      rankedCount++;
      if (bestPos == null || newPos < bestPos) bestPos = newPos;
      if (worstPos == null || newPos > worstPos) worstPos = newPos;
    } else {
      unrankedCount++;
    }

    // Update keyword record in database
    try {
      await prisma.keyword.update({
        where: { id: res.keywordId },
        data: {
          previousPosition: prevPos,
          currentPosition: newPos,
          positionChange,
          bestPosition: bestPos,
          worstPosition: worstPos,
          rankedUrl: res.rankedUrl || existingKw.rankedUrl,
          serpFeatures: JSON.stringify(res.serpFeatures || []),
          updatedAt: now,
        },
      });

      // Store historical ranking snapshot
      await prisma.rankingHistory.create({
        data: {
          projectId: project.id,
          keywordId: res.keywordId,
          searchEngine: res.searchEngine || project.defaultSearchEngine,
          country: project.countryCode || 'in',
          language: project.languageCode || 'en',
          device: res.device || project.defaultDevice,
          position: newPos,
          previousPosition: prevPos,
          positionChange,
          searchVolume: existingKw.monthlySearchVolume || 0,
          url: res.rankedUrl || project.websiteUrl,
          serpFeatures: JSON.stringify(res.serpFeatures || []),
          checkedAt: now,
        },
      });
    } catch (dbErr: unknown) {
      const code = (dbErr as { code?: string })?.code;
      if (code === 'P2025' || code === 'P2003') {
        // Record was removed concurrently
        continue;
      }
      throw dbErr;
    }
  }

  try {
    await prisma.project.update({
      where: { id: project.id },
      data: { lastRankingCheckAt: now },
    });
  } catch (err: any) {
    if (err?.code !== 'P2025') throw err;
  }

  await recordSerpCompetitors(project.id, project.domain, checkResponse.results, now);

  return {
    providerStatus: 'CONFIGURED',
    message: `Collected rankings for ${checkResponse.results.length} keywords.`,
    checkedCount: checkResponse.results.length,
    rankedCount,
    unrankedCount,
  };
}

function cleanHost(input: string): string {
  return (input || '')
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .toLowerCase();
}

function domainMatches(resultDomain: string, target: string): boolean {
  return resultDomain === target || resultDomain.endsWith(`.${target}`);
}

/**
 * From the SERP results of a rank check: stores each tracked competitor's position (CompetitorRanking),
 * refreshes competitor visibility/avg position/shared keywords, and keeps a SERP snapshot as a
 * completed RANK_CHECK job so SERP-competitor views can aggregate every domain seen.
 */
async function recordSerpCompetitors(
  projectId: string,
  projectDomain: string,
  results: KeywordCheckResult[],
  checkedAt: Date
) {
  const withSerp = results.filter((r) => Array.isArray(r.topResults) && r.topResults.length > 0);
  if (withSerp.length === 0) return;

  try {
    await prisma.job.create({
      data: {
        projectId,
        type: 'RANK_CHECK',
        status: 'completed',
        attempts: 1,
        startedAt: checkedAt,
        completedAt: new Date(),
        payload: JSON.stringify({
          targetDomain: cleanHost(projectDomain),
          checkedAt: checkedAt.toISOString(),
          serp: withSerp.map((r) => ({
            keywordId: r.keywordId,
            keyword: r.keyword,
            results: r.topResults,
          })),
        }),
      },
    });
  } catch (err) {
    console.warn('SERP snapshot save notice:', err);
  }

  const competitors = await prisma.projectCompetitor.findMany({
    where: { projectId, deletedAt: null, isActive: true },
  });
  if (competitors.length === 0) return;

  const previous = await prisma.competitorRanking.findMany({
    where: { projectId, competitorId: { in: competitors.map((c) => c.id) } },
    orderBy: { checkedAt: 'desc' },
    select: { competitorId: true, keywordId: true, position: true },
  });
  const lastPos = new Map<string, number | null>();
  for (const p of previous) {
    const key = `${p.competitorId}:${p.keywordId}`;
    if (!lastPos.has(key)) lastPos.set(key, p.position);
  }

  for (const comp of competitors) {
    const compDomain = cleanHost(comp.domain);
    const rows = withSerp.map((r) => {
      const hit = r.topResults!.find((t) => domainMatches(t.domain, compDomain));
      const prev = lastPos.get(`${comp.id}:${r.keywordId}`) ?? null;
      const position = hit ? hit.position : null;
      return {
        projectId,
        competitorId: comp.id,
        keywordId: r.keywordId,
        searchEngine: r.searchEngine,
        position,
        previousPosition: prev,
        positionChange: prev != null && position != null ? prev - position : 0,
        url: hit ? hit.url : null,
        checkedAt,
      };
    });

    try {
      await prisma.competitorRanking.createMany({ data: rows });
    } catch (err) {
      console.warn('Competitor ranking save notice:', err);
      continue;
    }

    const ranked = rows.filter((r) => r.position != null) as Array<(typeof rows)[number] & { position: number }>;
    const visibility =
      rows.length > 0 ? (ranked.reduce((acc, r) => acc + getVisibilityWeight(r.position), 0) / rows.length) * 100 : 0;
    await prisma.projectCompetitor.update({
      where: { id: comp.id },
      data: {
        visibilityScore: Number(visibility.toFixed(2)),
        avgPosition: ranked.length > 0 ? Number((ranked.reduce((a, r) => a + r.position, 0) / ranked.length).toFixed(1)) : null,
        commonKeywordsCount: ranked.length,
        totalKeywords: rows.length,
      },
    });
  }
}

export interface RankingSummaryOptions {
  timeRange?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  engineFilter?: string;
  groupFilter?: string;
}

/**
 * Calculates start and end date boundaries for ranking queries.
 * Validates complete end date inclusive through 23:59:59.999 UTC.
 */
export function calculateDateBoundaries(
  timeRange: string = '30D',
  customStartDate?: Date | string | null,
  customEndDate?: Date | string | null,
  referenceNow: Date = new Date()
): { startDate?: Date; endDate: Date; resolvedRange: string } {
  const tr = (timeRange || '30D').toLowerCase().trim();
  const now = referenceNow instanceof Date && !isNaN(referenceNow.getTime()) ? referenceNow : new Date();

  // Complete end date: end of day 23:59:59.999
  let endDate = new Date(now);
  endDate.setUTCHours(23, 59, 59, 999);

  let startDate: Date | undefined;

  if (tr === 'custom') {
    if (customEndDate) {
      const parsedEnd = new Date(customEndDate);
      if (!isNaN(parsedEnd.getTime())) {
        endDate = new Date(parsedEnd);
        endDate.setUTCHours(23, 59, 59, 999);
      }
    }
    if (customStartDate) {
      const parsedStart = new Date(customStartDate);
      if (!isNaN(parsedStart.getTime())) {
        startDate = new Date(parsedStart);
        startDate.setUTCHours(0, 0, 0, 0);
      }
    }
    return { startDate, endDate, resolvedRange: 'custom' };
  }

  if (tr === 'all' || tr === 'all_history' || tr === 'all_available_history') {
    return { startDate: undefined, endDate, resolvedRange: 'all' };
  }

  let days = 30;
  let resolved = '30D';
  if (tr === '7d' || tr === 'week' || tr === 'last_7_days') {
    days = 7;
    resolved = '7D';
  } else if (tr === '30d' || tr === '1m' || tr === 'month' || tr === 'last_30_days') {
    days = 30;
    resolved = '30D';
  } else if (tr === '3m' || tr === '3months' || tr === 'last_3_months') {
    days = 90;
    resolved = '3M';
  } else if (tr === '6m' || tr === '6months' || tr === 'last_6_months') {
    days = 180;
    resolved = '6M';
  } else if (tr === '12m' || tr === '1y' || tr === 'year' || tr === 'last_12_months') {
    days = 365;
    resolved = '12M';
  } else if (tr === '2y' || tr === '2years') {
    days = 730;
    resolved = '2Y';
  }

  startDate = new Date(now);
  startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
  startDate.setUTCHours(0, 0, 0, 0);

  return { startDate, endDate, resolvedRange: resolved };
}

/**
 * Calculates deterministic project ranking summary and historical trends from SQLite DB
 */
export async function getRankingSummary(
  projectId: string,
  timeRangeOrOptions: string | RankingSummaryOptions = 'month',
  engineFilterParam?: string,
  groupFilterParam?: string
) {
  let timeRange = '30D';
  let customStartDate: Date | string | undefined;
  let customEndDate: Date | string | undefined;
  let engineFilter: string | undefined = engineFilterParam;
  let groupFilter: string | undefined = groupFilterParam;

  if (typeof timeRangeOrOptions === 'object' && timeRangeOrOptions !== null) {
    timeRange = timeRangeOrOptions.timeRange || '30D';
    customStartDate = timeRangeOrOptions.startDate;
    customEndDate = timeRangeOrOptions.endDate;
    if (timeRangeOrOptions.engineFilter) {
      engineFilter = timeRangeOrOptions.engineFilter;
    }
    if (timeRangeOrOptions.groupFilter) {
      groupFilter = timeRangeOrOptions.groupFilter;
    }
  } else if (typeof timeRangeOrOptions === 'string') {
    timeRange = timeRangeOrOptions;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const keywords = await prisma.keyword.findMany({
    where: {
      projectId: project.id,
      deletedAt: null,
      ...(engineFilter ? { searchEngine: engineFilter } : {}),
      ...(groupFilter && groupFilter !== 'All groups' ? { groupName: groupFilter } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  if (keywords.length === 0) {
    return {
      projectId: project.id,
      domain: project.domain,
      summary: {
        totalKeywords: 0,
        top1: 0,
        top1Change: 0,
        top2_3: 0,
        top2_3Change: 0,
        top3: 0,
        top4_5: 0,
        top4_5Change: 0,
        top5: 0,
        top6_10: 0,
        top6_10Change: 0,
        top10: 0,
        top11_30: 0,
        top11_30Change: 0,
        top20: 0,
        top30: 0,
        top31_100: 0,
        top31_100Change: 0,
        top50: 0,
        top100: 0,
        unranked: 0,
        improved: 0,
        declined: 0,
        unchanged: 0,
        averagePosition: 0,
        averagePositionChange: 0,
        visibilityScore: 0,
        visibilityScoreChange: 0,
        totalSearchVolume: 0,
        estimatedTraffic: 0,
        trafficForecast: 0,
        trafficForecastChange: 0,
      },
      keywordDistribution: [
        { range: 'Top 1', count: 0, percentage: 0 },
        { range: 'Top 2-3', count: 0, percentage: 0 },
        { range: 'Top 4-10', count: 0, percentage: 0 },
        { range: 'Top 11-20', count: 0, percentage: 0 },
        { range: 'Top 21-50', count: 0, percentage: 0 },
        { range: 'Top 51-100', count: 0, percentage: 0 },
        { range: '100+', count: 0, percentage: 0 },
      ],
      trend: [],
      serpDynamics: {
        jumpedCount: 0,
        droppedCount: 0,
        unchangedCount: 0,
        jumpedList: [],
        droppedList: [],
        unchangedList: [],
      },
      competitors: [],
      pages: [],
      keywords: [],
    };
  }

  const totalKeywords = keywords.length;

  const rankedKeywords = keywords.filter(
    (k) => k.currentPosition != null && k.currentPosition > 0 && k.currentPosition <= 100
  );

  const averagePosition =
    rankedKeywords.length > 0
      ? Number(
          (
            rankedKeywords.reduce((sum, k) => sum + (k.currentPosition || 0), 0) /
            rankedKeywords.length
          ).toFixed(1)
        )
      : 0;

  // Bracket counts
  const top1 = keywords.filter((k) => k.currentPosition === 1).length;
  const top2_3 = keywords.filter((k) => k.currentPosition != null && k.currentPosition >= 2 && k.currentPosition <= 3).length;
  const top3 = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 3).length;
  const top4_5 = keywords.filter((k) => k.currentPosition != null && k.currentPosition >= 4 && k.currentPosition <= 5).length;
  const top5 = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 5).length;
  const top6_10 = keywords.filter((k) => k.currentPosition != null && k.currentPosition >= 6 && k.currentPosition <= 10).length;
  const top10 = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 10).length;
  const top11_30 = keywords.filter((k) => k.currentPosition != null && k.currentPosition >= 11 && k.currentPosition <= 30).length;
  const top20 = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 20).length;
  const top30 = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 30).length;
  const top31_100 = keywords.filter((k) => k.currentPosition != null && k.currentPosition >= 31 && k.currentPosition <= 100).length;
  const top50 = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 50).length;
  const top100 = rankedKeywords.length;
  const unranked = keywords.filter(
    (k) => k.currentPosition == null || k.currentPosition > 100
  ).length;

  // Changes
  const improved = keywords.filter((k) => (k.positionChange || 0) > 0).length;
  const declined = keywords.filter((k) => (k.positionChange || 0) < 0).length;
  const unchanged = keywords.filter(
    (k) => (k.positionChange || 0) === 0 && k.currentPosition != null
  ).length;

  // Search Visibility Score
  let visibility = 0;
  if (totalKeywords > 0) {
    const totalWeight = rankedKeywords.reduce((acc, k) => acc + getVisibilityWeight(k.currentPosition!), 0);
    visibility = Number(((totalWeight / totalKeywords) * 100).toFixed(1));
  }

  // Estimated Organic Traffic
  const estimatedTraffic = Math.round(
    rankedKeywords.reduce((acc, k) => {
      const pos = k.currentPosition!;
      const ctr = CTR_CURVE[pos] || (pos <= 20 ? 0.008 : 0.001);
      const vol = k.monthlySearchVolume || 0;
      return acc + vol * ctr;
    }, 0)
  );

  const totalSearchVolume = keywords.reduce((sum, k) => sum + (k.monthlySearchVolume || 0), 0);

  // Historical records for the chosen time range with validated boundaries
  const boundaries = calculateDateBoundaries(timeRange, customStartDate, customEndDate);

  const checkedAtFilter: { gte?: Date; lte?: Date } = {};
  if (boundaries.startDate) {
    checkedAtFilter.gte = boundaries.startDate;
  }
  if (boundaries.endDate) {
    checkedAtFilter.lte = boundaries.endDate;
  }

  const historyRecords = await prisma.rankingHistory.findMany({
    where: {
      projectId: project.id,
      ...(Object.keys(checkedAtFilter).length > 0 ? { checkedAt: checkedAtFilter } : {}),
      ...(engineFilter ? { searchEngine: engineFilter } : {}),
    },
    orderBy: { checkedAt: 'asc' },
  });

  interface HistoryDateBucket {
    dateStr: string;
    totalRank: number;
    count: number;
    top1: number;
    top2_3: number;
    top4_5: number;
    top6_10: number;
    top11_30: number;
    top31_100: number;
    unranked: number;
    visibilityWeightSum: number;
    trafficEstSum: number;
  }

  const historyByDate: Record<string, HistoryDateBucket> = {};
  for (const h of historyRecords) {
    const dStr = h.checkedAt.toISOString().split('T')[0];
    if (!historyByDate[dStr]) {
      historyByDate[dStr] = {
        dateStr: dStr,
        totalRank: 0,
        count: 0,
        top1: 0,
        top2_3: 0,
        top4_5: 0,
        top6_10: 0,
        top11_30: 0,
        top31_100: 0,
        unranked: 0,
        visibilityWeightSum: 0,
        trafficEstSum: 0,
      };
    }
    const bucket = historyByDate[dStr];
    const pos = h.position;
    if (pos && pos > 0 && pos <= 100) {
      bucket.totalRank += pos;
      bucket.count += 1;
      if (pos === 1) bucket.top1 += 1;
      else if (pos <= 3) bucket.top2_3 += 1;
      else if (pos <= 5) bucket.top4_5 += 1;
      else if (pos <= 10) bucket.top6_10 += 1;
      else if (pos <= 30) bucket.top11_30 += 1;
      else bucket.top31_100 += 1;

      bucket.visibilityWeightSum += getVisibilityWeight(pos);
      const ctr = CTR_CURVE[pos] || (pos <= 20 ? 0.008 : 0.001);
      bucket.trafficEstSum += (h.searchVolume || 0) * ctr;
    } else {
      bucket.unranked += 1;
    }
  }

  const sortedDateKeys = Object.keys(historyByDate).sort();
  const realTrend = sortedDateKeys.map((dateStr) => {
    const entry = historyByDate[dateStr];
    const d = new Date(entry.dateStr);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const avg = entry.count > 0 ? Number((entry.totalRank / entry.count).toFixed(1)) : 0;
    const vis = totalKeywords > 0 ? Number(((entry.visibilityWeightSum / totalKeywords) * 100).toFixed(1)) : 0;
    const traffic = Math.round(entry.trafficEstSum);
    const top10Count = entry.top1 + entry.top2_3 + entry.top4_5 + entry.top6_10;
    const top10Percent = totalKeywords > 0 ? Math.round((top10Count / totalKeywords) * 100) : 0;
    return {
      date: entry.dateStr,
      label,
      value: avg,
      checkedCount: entry.count,
      visibility: vis,
      traffic,
      top1: entry.top1,
      top2_3: entry.top2_3,
      top4_5: entry.top4_5,
      top6_10: entry.top6_10,
      top11_30: entry.top11_30,
      top31_100: entry.top31_100,
      top10Count,
      top10Percent,
      totalRanked: entry.count,
    };
  });

  const finalTrend = realTrend;

  // Calculate bracket changes comparing the latest trend record with previous
  let top1Change = 0;
  let top2_3Change = 0;
  let top4_5Change = 0;
  let top6_10Change = 0;
  let top11_30Change = 0;
  let top31_100Change = 0;
  let averagePositionChange = 0;
  let visibilityScoreChange = 0;
  let trafficForecastChange = 0;

  if (finalTrend.length >= 2) {
    const latest = finalTrend[finalTrend.length - 1];
    const prev = finalTrend[finalTrend.length - 2];
    top1Change = latest.top1 - prev.top1;
    top2_3Change = latest.top2_3 - prev.top2_3;
    top4_5Change = latest.top4_5 - prev.top4_5;
    top6_10Change = latest.top6_10 - prev.top6_10;
    top11_30Change = latest.top11_30 - prev.top11_30;
    top31_100Change = latest.top31_100 - prev.top31_100;
    if (prev.value > 0 && latest.value > 0) {
      averagePositionChange = Number((prev.value - latest.value).toFixed(1));
    }
    visibilityScoreChange = Number((latest.visibility - prev.visibility).toFixed(1));
    trafficForecastChange = latest.traffic - prev.traffic;
  }

  // Bracket breakdown for Improved / Declined / Unchanged keywords
  const improvedKeywords = keywords.filter((k) => (k.positionChange || 0) > 0);
  const declinedKeywords = keywords.filter((k) => (k.positionChange || 0) < 0);
  const unchangedKeywords = keywords.filter((k) => (k.positionChange || 0) === 0 && k.currentPosition != null);

  const getBracketCounts = (list: typeof keywords) => ({
    top1: list.filter((k) => k.currentPosition === 1).length,
    top2_3: list.filter((k) => k.currentPosition != null && k.currentPosition >= 2 && k.currentPosition <= 3).length,
    top4_5: list.filter((k) => k.currentPosition != null && k.currentPosition >= 4 && k.currentPosition <= 5).length,
    top6_10: list.filter((k) => k.currentPosition != null && k.currentPosition >= 6 && k.currentPosition <= 10).length,
    top11_30: list.filter((k) => k.currentPosition != null && k.currentPosition >= 11 && k.currentPosition <= 30).length,
    top31_100: list.filter((k) => k.currentPosition != null && k.currentPosition >= 31 && k.currentPosition <= 100).length,
    over100: list.filter((k) => k.currentPosition == null || k.currentPosition > 100).length,
  });

  const improvedBrackets = getBracketCounts(improvedKeywords);
  const declinedBrackets = getBracketCounts(declinedKeywords);
  const unchangedBrackets = getBracketCounts(unchangedKeywords);

  const serpDynamics = {
    totalInSerp: rankedKeywords.length,
    improvedCount: improvedKeywords.length,
    declinedCount: declinedKeywords.length,
    unchangedCount: unchangedKeywords.length,
    improvedBrackets,
    declinedBrackets,
    unchangedBrackets,
    jumped: {
      count: improvedKeywords.length,
      percentage: rankedKeywords.length > 0 ? Math.round((improvedKeywords.length / rankedKeywords.length) * 100) : 0,
      ...improvedBrackets,
    },
    dropped: {
      count: declinedKeywords.length,
      percentage: rankedKeywords.length > 0 ? Math.round((declinedKeywords.length / rankedKeywords.length) * 100) : 0,
      ...declinedBrackets,
    },
    unchanged: {
      count: unchangedKeywords.length,
      percentage: rankedKeywords.length > 0 ? Math.round((unchangedKeywords.length / rankedKeywords.length) * 100) : 0,
      ...unchangedBrackets,
    },
  };

  // Real Competitors from DB
  const dbCompetitors = await prisma.projectCompetitor.findMany({
    where: {
      projectId: project.id,
      deletedAt: null,
    },
    include: {
      competitorRankings: {
        take: 50,
        orderBy: { checkedAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const competitors = dbCompetitors.map((comp) => {
    const rankedPositions = comp.competitorRankings
      .map((r) => r.position)
      .filter((p): p is number => p != null && p > 0 && p <= 100);

    const avgPosition =
      rankedPositions.length > 0
        ? Number((rankedPositions.reduce((a, b) => a + b, 0) / rankedPositions.length).toFixed(1))
        : comp.avgPosition || 0;

    const top10Kws = rankedPositions.filter((p) => p <= 10).length;
    const visibilityScore =
      totalKeywords > 0
        ? Number(((top10Kws / totalKeywords) * 100).toFixed(1))
        : comp.visibilityScore || 0;

    return {
      id: comp.id,
      name: comp.name,
      domain: comp.domain,
      url: `https://${comp.domain}`,
      visibility: `${visibilityScore}%`,
      visibilityScore,
      avgPos: avgPosition,
      top10Kws,
      totalKeywords: comp.totalKeywords || 0,
      organicTraffic: comp.organicTraffic || '0',
    };
  });

  // Real Pages from keywords
  const pagesMap: Record<string, { url: string; count: number; totalRank: number; traffic: number }> = {};
  for (const k of keywords) {
    const pageUrl = k.rankedUrl || k.targetUrl || `https://${project.domain}/`;
    if (!pagesMap[pageUrl]) {
      pagesMap[pageUrl] = { url: pageUrl, count: 0, totalRank: 0, traffic: 0 };
    }
    pagesMap[pageUrl].count++;
    if (k.currentPosition != null && k.currentPosition > 0 && k.currentPosition <= 100) {
      pagesMap[pageUrl].totalRank += k.currentPosition;
      const ctr = CTR_CURVE[k.currentPosition] || (k.currentPosition <= 20 ? 0.008 : 0.001);
      pagesMap[pageUrl].traffic += (k.monthlySearchVolume || 0) * ctr;
    }
  }

  const pages = Object.values(pagesMap)
    .map((p) => ({
      url: p.url,
      totalKeywords: p.count,
      trafficForecast: Math.round(p.traffic),
      avgPosition: p.count > 0 && p.totalRank > 0 ? Number((p.totalRank / p.count).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.totalKeywords - a.totalKeywords);

  const keywordDistribution = [
    { name: 'Top 1-3', count: top3, percentage: totalKeywords > 0 ? Math.round((top3 / totalKeywords) * 100) : 0, color: '#10B981' },
    { name: 'Top 4-10', count: Math.max(0, top10 - top3), percentage: totalKeywords > 0 ? Math.round(((top10 - top3) / totalKeywords) * 100) : 0, color: '#7C3AED' },
    { name: 'Top 11-20', count: Math.max(0, top20 - top10), percentage: totalKeywords > 0 ? Math.round(((top20 - top10) / totalKeywords) * 100) : 0, color: '#A78BFA' },
    { name: 'Top 21-50', count: Math.max(0, top50 - top20), percentage: totalKeywords > 0 ? Math.round(((top50 - top20) / totalKeywords) * 100) : 0, color: '#F59E0B' },
    { name: 'Top 51-100', count: Math.max(0, top100 - top50), percentage: totalKeywords > 0 ? Math.round(((top100 - top50) / totalKeywords) * 100) : 0, color: '#EF4444' },
    { name: '> 100 / Unranked', count: unranked, percentage: totalKeywords > 0 ? Math.round((unranked / totalKeywords) * 100) : 0, color: '#94A3B8' },
  ];

  return {
    projectId: project.id,
    domain: project.domain,
    timeRange: boundaries.resolvedRange,
    startDate: boundaries.startDate ? boundaries.startDate.toISOString() : null,
    endDate: boundaries.endDate.toISOString(),
    summary: {
      totalKeywords,
      averagePosition,
      averagePositionChange,
      visibilityScore: visibility,
      visibilityScoreChange,
      estimatedTraffic,
      trafficForecast: estimatedTraffic,
      trafficForecastChange,
      totalSearchVolume,
      top1,
      top1Change,
      top2_3,
      top2_3Change,
      top3,
      top4_5,
      top4_5Change,
      top5,
      top6_10,
      top6_10Change,
      top10,
      top11_30,
      top11_30Change,
      top20,
      top30,
      top31_100,
      top31_100Change,
      top50,
      top100,
      unranked,
      improved,
      declined,
      unchanged,
      lastRankingCheckAt: project.lastRankingCheckAt?.toISOString() || null,
      rankingFrequency: project.rankingFrequency || 'Daily',
    },
    trend: finalTrend,
    keywordDistribution,
    serpDynamics,
    competitors,
    pages,
    keywords: keywords.map((k) => ({
      id: k.id,
      keyword: k.keywordText,
      rank: k.currentPosition,
      prevRank: k.previousPosition,
      change: k.positionChange || 0,
      bestRank: k.bestPosition,
      worstRank: k.worstPosition,
      volume: k.monthlySearchVolume || 0,
      cpc: k.cpcUsd ? `$${k.cpcUsd.toFixed(2)}` : '$0.00',
      difficulty: k.keywordDifficulty || 0,
      searchEngine: k.searchEngine || project.defaultSearchEngine || 'google',
      countryCode: k.countryCode || project.countryCode || 'in',
      device: k.device || project.defaultDevice || 'desktop',
      url: k.rankedUrl || k.targetUrl || `https://${project.domain}`,
      rankingStatus: k.currentPosition != null ? 'Ranked' : 'Not tracked yet',
      dateChecked: k.updatedAt
        ? new Date(k.updatedAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '—',
      group: k.groupName || 'General',
      isActive: k.isActive,
    })),
  };
}
