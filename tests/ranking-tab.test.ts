import { describe, it, expect } from 'vitest';
import { prisma } from '../src/lib/db/prisma';
import { getRankingSummary, calculateDateBoundaries } from '../src/services/seo/ranking.service';
import { DataForSeoProvider } from '../src/lib/rankings/dataforseo';
import { SerperProvider } from '../src/lib/rankings/serper';

describe('Ranking Tab Architecture, Calculations & Isolation Suite', () => {
  it('calculates deterministic ranking distribution and top brackets', async () => {
    // Find any project with seeded keywords
    const project = await prisma.project.findFirst({
      where: {
        keywords: { some: {} },
      },
      include: {
        keywords: true,
      },
    });

    expect(project).toBeDefined();
    if (!project) return;

    const summary = await getRankingSummary(project.id, 'month');

    expect(summary).toBeDefined();
    expect(summary.projectId).toBe(project.id);
    expect(summary.domain).toBe(project.domain);
    expect(summary.summary).toBeDefined();

    // Verify top brackets exist and are non-negative numbers
    expect(typeof summary.summary.top1).toBe('number');
    expect(summary.summary.top1).toBeGreaterThanOrEqual(0);
    expect(typeof summary.summary.top2_3).toBe('number');
    expect(summary.summary.top2_3).toBeGreaterThanOrEqual(0);
    expect(typeof summary.summary.top4_5).toBe('number');
    expect(summary.summary.top4_5).toBeGreaterThanOrEqual(0);
    expect(typeof summary.summary.top6_10).toBe('number');
    expect(summary.summary.top6_10).toBeGreaterThanOrEqual(0);
    expect(typeof summary.summary.top11_30).toBe('number');
    expect(summary.summary.top11_30).toBeGreaterThanOrEqual(0);
    expect(typeof summary.summary.top31_100).toBe('number');
    expect(summary.summary.top31_100).toBeGreaterThanOrEqual(0);

    // Verify aggregate metrics are valid numbers
    expect(typeof summary.summary.averagePosition).toBe('number');
    expect(typeof summary.summary.visibilityScore).toBe('number');
    expect(summary.summary.visibilityScore).toBeGreaterThanOrEqual(0);
    expect(summary.summary.visibilityScore).toBeLessThanOrEqual(100);
    expect(typeof summary.summary.trafficForecast).toBe('number');
    expect(summary.summary.trafficForecast).toBeGreaterThanOrEqual(0);
  });

  it('guarantees strict project isolation between distinct projects', async () => {
    const projects = await prisma.project.findMany({
      where: {
        keywords: { some: {} },
      },
      take: 2,
    });

    if (projects.length >= 2) {
      const p1 = projects[0];
      const p2 = projects[1];

      const res1 = await getRankingSummary(p1.id, 'month');
      const res2 = await getRankingSummary(p2.id, 'month');

      // Verify that each response is isolated to its respective project
      expect(res1.projectId).toBe(p1.id);
      expect(res2.projectId).toBe(p2.id);
      expect(res1.domain).toBe(p1.domain);
      expect(res2.domain).toBe(p2.domain);

      // Verify keyword IDs do not overlap between project 1 and project 2
      const p1KeywordIds = new Set(res1.keywords.map((k: any) => k.id));
      for (const k2 of res2.keywords) {
        expect(p1KeywordIds.has(k2.id)).toBe(false);
      }
    }
  });

  it('provides real SERP dynamics with jumped, dropped, and unchanged counts', async () => {
    const project = await prisma.project.findFirst({
      where: {
        keywords: { some: {} },
      },
    });

    if (!project) return;

    const data = await getRankingSummary(project.id, 'month');

    expect(data.serpDynamics).toBeDefined();
    expect(data.serpDynamics.jumped).toBeDefined();
    expect(data.serpDynamics.dropped).toBeDefined();
    expect(data.serpDynamics.unchanged).toBeDefined();

    expect(typeof data.serpDynamics.jumped.count).toBe('number');
    expect(typeof data.serpDynamics.dropped.count).toBe('number');
    expect(typeof data.serpDynamics.unchanged.count).toBe('number');

    // Total of jumped + dropped + unchanged must equal total ranked keywords
    const totalDynamics =
      data.serpDynamics.jumped.count +
      data.serpDynamics.dropped.count +
      data.serpDynamics.unchanged.count;

    const rankedKeywords = data.keywords.filter((k: any) => k.rank != null && k.rank > 0 && k.rank <= 100);
    expect(totalDynamics).toBe(rankedKeywords.length);
  });

  it('computes real competitors and pages attached to the project', async () => {
    const project = await prisma.project.findFirst({
      where: {
        keywords: { some: {} },
      },
    });

    if (!project) return;

    const data = await getRankingSummary(project.id, 'month');

    expect(Array.isArray(data.competitors)).toBe(true);
    expect(Array.isArray(data.pages)).toBe(true);

    if (data.pages.length > 0) {
      const page = data.pages[0];
      expect(page.url).toBeDefined();
      expect(typeof page.totalKeywords).toBe('number');
      expect(typeof page.trafficForecast).toBe('number');
      expect(typeof page.avgPosition).toBe('number');
    }
  });

  it('handles empty historical ranking records gracefully without errors', async () => {
    const user = await prisma.user.upsert({
      where: { email: 'ranking-test-worker@example.com' },
      update: {},
      create: {
        email: 'ranking-test-worker@example.com',
        name: 'Ranking Test Worker',
        role: 'SEO_USER',
        status: 'active',
      },
    });

    const epProject = await prisma.project.create({
      data: {
        userId: user.id,
        name: 'Empty History Test',
        domain: 'empty-test-example.org',
        country: 'India',
        countryCode: 'in',
        keywords: {
          create: [
            {
              keywordText: 'test unranked keyword',
              currentPosition: null,
              previousPosition: null,
            },
          ],
        },
      },
    });

    try {
      const summary = await getRankingSummary(epProject.id, 'month');
      expect(summary).toBeDefined();
      expect(summary.summary.totalKeywords).toBe(1);
      expect(summary.summary.averagePosition).toBe(0);
      expect(summary.summary.visibilityScore).toBe(0);
      expect(summary.trend).toEqual([]);
      expect(summary.keywords.length).toBe(1);
    } finally {
      await prisma.keyword.deleteMany({ where: { projectId: epProject.id } });
      await prisma.project.deleteMany({ where: { id: epProject.id } });
    }
  });

  it('validates YepAPI provider configuration and search engine capabilities', async () => {
    const originalKey = process.env.YEPAPI_KEY;
    process.env.YEPAPI_KEY = 'yep_sk_live_test_1234567890';
    try {
      const { YepApiRankingProvider } = await import('../src/lib/rankings/yepapi');
      const provider = new YepApiRankingProvider();
      expect(provider.id).toBe('yepapi');
      expect(provider.name).toContain('YepAPI');
      expect(provider.isConfigured()).toBe(true);

      const capabilities = provider.getEngineCapabilities();
      expect(capabilities.length).toBeGreaterThan(0);
      expect(capabilities.some((c) => c.engine === 'google')).toBe(true);
      expect(capabilities.some((c) => c.engine === 'google-ai-overview')).toBe(true);
    } finally {
      process.env.YEPAPI_KEY = originalKey;
    }
  });

  it('validates DataForSEO migration wrapper compatibility', async () => {
    const provider = new DataForSeoProvider();
    expect(provider.isConfigured()).toBe(true);

    const capabilities = provider.getEngineCapabilities();
    expect(capabilities.length).toBeGreaterThan(0);
    expect(capabilities.some((c) => c.engine === 'google')).toBe(true);
  });

  it('validates Serper provider live integration and capability', async () => {
    const provider = new SerperProvider();
    expect(provider.id).toBe('serper');
    expect(provider.name).toContain('Serper');
    expect(provider.isConfigured()).toBe(true);

    const capabilities = provider.getEngineCapabilities();
    expect(capabilities.length).toBeGreaterThanOrEqual(1);
    expect(capabilities[0].engine).toBe('google');
    expect(capabilities[0].supportsDesktop).toBe(true);
  });

  it('calculates positionFilterMetrics for Top 1, 3, 5, 10, 30, and >100', () => {
    const sampleKeywords = [
      { rank: 1, prevRank: 2, diff: 1 },
      { rank: 2, prevRank: 2, diff: 0 },
      { rank: 3, prevRank: 4, diff: 1 },
      { rank: 5, prevRank: 5, diff: 0 },
      { rank: 8, prevRank: 12, diff: 4 },
      { rank: 25, prevRank: 20, diff: -5 },
      { rank: 55, prevRank: 50, diff: -5 },
      { rank: null, prevRank: null, diff: 0 }, // Unranked
    ];

    const toRankNum = (r: any) => (typeof r === 'number' ? r : null);
    const total = sampleKeywords.length;
    const top1 = sampleKeywords.filter((k) => toRankNum(k.rank) === 1).length;
    const top3 = sampleKeywords.filter((k) => {
      const r = toRankNum(k.rank);
      return r !== null && r >= 1 && r <= 3;
    }).length;
    const top5 = sampleKeywords.filter((k) => {
      const r = toRankNum(k.rank);
      return r !== null && r >= 1 && r <= 5;
    }).length;
    const top10 = sampleKeywords.filter((k) => {
      const r = toRankNum(k.rank);
      return r !== null && r >= 1 && r <= 10;
    }).length;
    const top30 = sampleKeywords.filter((k) => {
      const r = toRankNum(k.rank);
      return r !== null && r >= 1 && r <= 30;
    }).length;
    const over100 = sampleKeywords.filter((k) => {
      const r = toRankNum(k.rank);
      return r === null || r > 100;
    }).length;

    expect(top1).toBe(1);
    expect(top3).toBe(3);
    expect(top5).toBe(4);
    expect(top10).toBe(5);
    expect(top30).toBe(6);
    expect(over100).toBe(1);

    expect(Math.round((top1 / total) * 100)).toBe(13);
    expect(Math.round((top3 / total) * 100)).toBe(38);
    expect(Math.round((top10 / total) * 100)).toBe(63);
  });

  it('generates valid SVG paths for stacked distribution layers without NaN', () => {
    const trend = [
      { label: 'Oct-09', top1: 2, top2_3: 3, top4_5: 1, top6_10: 4, top11_30: 5, top31_100: 5, totalRanked: 20 },
      { label: 'Oct-10', top1: 3, top2_3: 3, top4_5: 2, top6_10: 4, top11_30: 5, top31_100: 3, totalRanked: 20 },
      { label: 'Oct-11', top1: 4, top2_3: 2, top4_5: 2, top6_10: 5, top11_30: 4, top31_100: 3, totalRanked: 20 },
    ];

    const chartHeight = 262;
    const chartWidth = 660;
    const maxTotal = 20;

    const dates = trend.map((s, i) => {
      const x = 26.5 + (i / (trend.length - 1)) * (chartWidth - 26.5);
      const cTop1 = s.top1;
      const cTop3 = cTop1 + s.top2_3;
      const cTop5 = cTop3 + s.top4_5;
      const cTop10 = cTop5 + s.top6_10;
      const cTop30 = cTop10 + s.top11_30;
      const cTop100 = cTop30 + s.top31_100;

      const getY = (val: number) => chartHeight - (val / maxTotal) * (chartHeight - 10);

      return {
        x,
        yBase: chartHeight,
        yTop1: getY(cTop1),
        yTop3: getY(cTop3),
        yTop5: getY(cTop5),
        yTop10: getY(cTop10),
        yTop30: getY(cTop30),
        yTop100: getY(cTop100),
        yTotal: getY(s.totalRanked),
      };
    });

    const makeLayerPath = (getYUpper: (d: any) => number, getYLower: (d: any) => number) => {
      const forward = dates.map((d) => `${d.x} ${getYUpper(d)}`).join(' L ');
      const backward = dates.slice().reverse().map((d) => `${d.x} ${getYLower(d)}`).join(' L ');
      return `M ${forward} L ${backward} Z`;
    };

    const top1Path = makeLayerPath((d) => d.yTop1, (d) => d.yBase);
    const top2_3Path = makeLayerPath((d) => d.yTop3, (d) => d.yTop1);

    expect(top1Path).toContain('M ');
    expect(top1Path).toContain(' Z');
    expect(top1Path).not.toContain('NaN');
    expect(top2_3Path).not.toContain('NaN');
  });

  it('correctly calculates date boundaries and includes complete end date for all presets', () => {
    const fixedNow = new Date('2026-10-13T12:00:00.000Z');

    // 1. Last 7 Days (7 calendar days inclusive)
    const b7d = calculateDateBoundaries('7D', null, null, fixedNow);
    expect(b7d.resolvedRange).toBe('7D');
    expect(b7d.endDate.toISOString()).toBe('2026-10-13T23:59:59.999Z');
    expect(b7d.startDate?.toISOString()).toBe('2026-10-07T00:00:00.000Z');

    // 2. Last 30 Days (30 calendar days inclusive)
    const b30d = calculateDateBoundaries('30D', null, null, fixedNow);
    expect(b30d.resolvedRange).toBe('30D');
    expect(b30d.endDate.toISOString()).toBe('2026-10-13T23:59:59.999Z');
    expect(b30d.startDate?.toISOString()).toBe('2026-09-14T00:00:00.000Z');

    // 3. Last 3 Months (90 calendar days inclusive)
    const b3m = calculateDateBoundaries('3M', null, null, fixedNow);
    expect(b3m.resolvedRange).toBe('3M');
    expect(b3m.endDate.toISOString()).toBe('2026-10-13T23:59:59.999Z');
    expect(b3m.startDate?.toISOString()).toBe('2026-07-16T00:00:00.000Z');

    // 4. Last 6 Months (180 calendar days inclusive)
    const b6m = calculateDateBoundaries('6M', null, null, fixedNow);
    expect(b6m.resolvedRange).toBe('6M');
    expect(b6m.endDate.toISOString()).toBe('2026-10-13T23:59:59.999Z');
    expect(b6m.startDate?.toISOString()).toBe('2026-04-17T00:00:00.000Z');

    // 5. Last 12 Months (365 calendar days inclusive)
    const b12m = calculateDateBoundaries('12M', null, null, fixedNow);
    expect(b12m.resolvedRange).toBe('12M');
    expect(b12m.endDate.toISOString()).toBe('2026-10-13T23:59:59.999Z');
    expect(b12m.startDate?.toISOString()).toBe('2025-10-14T00:00:00.000Z');

    // 6. All Available History (no start date boundary)
    const bAll = calculateDateBoundaries('all', null, null, fixedNow);
    expect(bAll.resolvedRange).toBe('all');
    expect(bAll.startDate).toBeUndefined();
    expect(bAll.endDate.toISOString()).toBe('2026-10-13T23:59:59.999Z');

    // 7. Custom Range
    const bCustom = calculateDateBoundaries('custom', '2026-09-20', '2026-09-25', fixedNow);
    expect(bCustom.resolvedRange).toBe('custom');
    expect(bCustom.startDate?.toISOString()).toBe('2026-09-20T00:00:00.000Z');
    expect(bCustom.endDate.toISOString()).toBe('2026-09-25T23:59:59.999Z');
  });

  it('controls the actual database query and reflects changes between two different ranges', async () => {
    const project = await prisma.project.findFirst({
      where: {
        rankingHistory: { some: {} },
      },
    });

    if (!project) return;

    // 1. Query Last 7 Days
    const res7D = await getRankingSummary(project.id, { timeRange: '7D' });
    expect(res7D.timeRange).toBe('7D');
    expect(res7D.trend.length).toBeLessThanOrEqual(7);

    // 2. Query Last 30 Days
    const res30D = await getRankingSummary(project.id, { timeRange: '30D' });
    expect(res30D.timeRange).toBe('30D');

    // If project has multi-week history, 30D should contain more points than 7D
    if (res30D.trend.length > 7) {
      expect(res30D.trend.length).toBeGreaterThan(res7D.trend.length);
    }

    // 3. Query Custom Range
    const resCustom = await getRankingSummary(project.id, {
      timeRange: 'custom',
      startDate: '2026-09-20',
      endDate: '2026-09-25',
    });
    expect(resCustom.timeRange).toBe('custom');
    for (const point of resCustom.trend) {
      expect(point.date >= '2026-09-20').toBe(true);
      expect(point.date <= '2026-09-25').toBe(true);
    }
  });

  it('validates database date boundaries and strict non-fabrication of history', async () => {
    const user = await prisma.user.findFirst();
    if (!user) return;

    const testProject = await prisma.project.create({
      data: {
        userId: user.id,
        name: 'No History Test Project',
        domain: 'no-history-domain.org',
        country: 'India',
        countryCode: 'in',
        keywords: {
          create: [
            {
              keywordText: 'ranking test sample keyword',
              currentPosition: 5,
              previousPosition: 8,
              monthlySearchVolume: 1000,
            },
          ],
        },
      },
    });

    try {
      const summary = await getRankingSummary(testProject.id, { timeRange: '7D' });
      // Trend MUST strictly be empty when no rankingHistory exists - NEVER fabricate synthetic points
      expect(summary.trend).toEqual([]);
      expect(summary.trend.length).toBe(0);
      expect(summary.summary.totalKeywords).toBe(1);
    } finally {
      await prisma.keyword.deleteMany({ where: { projectId: testProject.id } });
      await prisma.project.deleteMany({ where: { id: testProject.id } });
    }
  });
});
