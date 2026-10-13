import { prisma } from '@/lib/db/prisma';
import { getRankingProvider } from '@/lib/rankings/provider';
import { KeywordCheckRequest, SearchEngineType } from '@/lib/rankings/types';

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
  }

  await prisma.project.update({
    where: { id: project.id },
    data: { lastRankingCheckAt: now },
  });

  return {
    providerStatus: 'CONFIGURED',
    message: `Collected rankings for ${checkResponse.results.length} keywords.`,
    checkedCount: checkResponse.results.length,
    rankedCount,
    unrankedCount,
  };
}

/**
 * Calculates deterministic project ranking summary and historical trends from SQLite DB
 */
export async function getRankingSummary(
  projectId: string,
  timeRange: string = 'month',
  engineFilter?: string,
  groupFilter?: string
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  let keywords = await prisma.keyword.findMany({
    where: {
      projectId: project.id,
      deletedAt: null,
      ...(engineFilter ? { searchEngine: engineFilter } : {}),
      ...(groupFilter && groupFilter !== 'All groups' ? { groupName: groupFilter } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  if (keywords.length === 0) {
    try {
      const { seedProjectData } = await import('@/services/seo/seed-project-data.service');
      await seedProjectData(project.id, project.domain, project.brandName || project.name);
      keywords = await prisma.keyword.findMany({
        where: {
          projectId: project.id,
          deletedAt: null,
          ...(engineFilter ? { searchEngine: engineFilter } : {}),
          ...(groupFilter && groupFilter !== 'All groups' ? { groupName: groupFilter } : {}),
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (seedErr) {
      console.warn('Auto-seed project keywords notice:', seedErr);
    }
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
      : null;

  // Bracket counts
  const top1 = keywords.filter((k) => k.currentPosition === 1).length;
  const top3 = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 3).length;
  const top5 = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 5).length;
  const top10 = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 10).length;
  const top20 = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 20).length;
  const top30 = keywords.filter((k) => k.currentPosition != null && k.currentPosition <= 30).length;
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

  // Historical records for the chosen time range
  const days = timeRange === 'week' ? 7 : timeRange === '3months' ? 90 : timeRange === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const historyRecords = await prisma.rankingHistory.findMany({
    where: {
      projectId: project.id,
      checkedAt: { gte: startDate },
      ...(engineFilter ? { searchEngine: engineFilter } : {}),
    },
    orderBy: { checkedAt: 'asc' },
  });

  const historyByDate: Record<string, { totalRank: number; count: number; dateStr: string }> = {};
  for (const h of historyRecords) {
    const dStr = h.checkedAt.toISOString().split('T')[0];
    if (!historyByDate[dStr]) {
      historyByDate[dStr] = { totalRank: 0, count: 0, dateStr: dStr };
    }
    if (h.position && h.position > 0 && h.position <= 100) {
      historyByDate[dStr].totalRank += h.position;
      historyByDate[dStr].count += 1;
    }
  }

  const realTrend = Object.values(historyByDate).map((entry) => {
    const d = new Date(entry.dateStr);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const avg = entry.count > 0 ? Number((entry.totalRank / entry.count).toFixed(1)) : 0;
    return {
      date: entry.dateStr,
      label,
      value: avg,
      checkedCount: entry.count,
    };
  });

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
    summary: {
      totalKeywords,
      averagePosition,
      visibilityScore: visibility,
      estimatedTraffic,
      totalSearchVolume,
      top1,
      top3,
      top5,
      top10,
      top20,
      top30,
      top50,
      top100,
      unranked,
      improved,
      declined,
      unchanged,
      lastRankingCheckAt: project.lastRankingCheckAt?.toISOString() || null,
      rankingFrequency: project.rankingFrequency || 'Daily',
    },
    trend: realTrend,
    keywordDistribution,
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
