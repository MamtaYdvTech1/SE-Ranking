import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { getRankingSummary } from '@/services/seo/ranking.service';
import { calculateSeoHealthScore } from '@/services/seo/audit.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify authenticated user & project access
    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { project } = authResult.data;

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || 'month';

    // 1. Fetch ranking summary & distribution & history
    const rankingSummary = await getRankingSummary(project.id, timeRange);

    // 2. Fetch real technical SEO audit records, backlinks, competitors, and AI search records
    const [auditPages, auditIssues, competitors, backlinks, aiRecords] = await Promise.all([
      prisma.auditPage.findMany({
        where: { projectId: project.id },
        select: { statusCode: true, isIndexable: true, loadTimeMs: true, url: true },
      }),
      prisma.auditIssue.findMany({
        where: { projectId: project.id, deletedAt: null },
        orderBy: { foundAt: 'desc' },
      }),
      prisma.projectCompetitor.findMany({
        where: { projectId: project.id, deletedAt: null },
      }),
      prisma.backlink.findMany({
        where: { projectId: project.id, deletedAt: null },
        select: { sourceUrl: true, targetUrl: true, anchorText: true, domainTrust: true, pageTrust: true, isDoFollow: true },
      }),
      prisma.aiSearchRecord.findMany({
        where: { projectId: project.id },
        orderBy: { checkedAt: 'desc' },
      }),
    ]);

    const pagesCrawled = auditPages.length;
    const passedPages = auditPages.filter((p) => p.statusCode === 200).length;
    const criticalIssues = auditIssues.filter((i) => i.severity === 'Error').length;
    const warnings = auditIssues.filter((i) => i.severity === 'Warning').length;
    const notices = auditIssues.filter((i) => i.severity === 'Notice').length;

    // Real SEO Health Score: null if never audited, otherwise calculated
    const healthScore = calculateSeoHealthScore(auditIssues, pagesCrawled, passedPages);

    // Compute unique referring domains
    const uniqueDomains = new Set<string>();
    backlinks.forEach((b) => {
      try {
        uniqueDomains.add(new URL(b.sourceUrl).hostname);
      } catch {
        uniqueDomains.add(b.sourceUrl);
      }
    });
    const referringDomainsCount = uniqueDomains.size;
    const backlinksCount = backlinks.length;

    // Calculate dynamic AI Presence metrics
    const totalAiChecks = aiRecords.length;
    const aiMentionedCount = aiRecords.filter((r) => r.mentioned).length;
    const aiCitedCount = aiRecords.filter((r) => Boolean(r.citedUrl)).length;

    // Engine breakdown
    const engineBreakdown: Record<string, { mentions: number; links: number }> = {
      'google-ai-overview': { mentions: 0, links: 0 },
      'google-ai-mode': { mentions: 0, links: 0 },
      chatgpt: { mentions: 0, links: 0 },
      gemini: { mentions: 0, links: 0 },
      perplexity: { mentions: 0, links: 0 },
    };
    aiRecords.forEach((r) => {
      const eng = r.engine?.toLowerCase();
      if (engineBreakdown[eng]) {
        if (r.mentioned) engineBreakdown[eng].mentions++;
        if (r.citedUrl) engineBreakdown[eng].links++;
      }
    });

    const s = rankingSummary.summary;
    const trafficChange = s.trafficForecastChange || 0;

    // Bucket changes are per band (top1, 2-3, 4-5, ...); cumulative "Top N" changes sum the bands inside N
    const top3Change = (s.top1Change || 0) + (s.top2_3Change || 0);
    const top5Change = top3Change + (s.top4_5Change || 0);
    const top10Change = top5Change + (s.top6_10Change || 0);
    const top30Change = top10Change + (s.top11_30Change || 0);
    const top100Change = top30Change + (s.top31_100Change || 0);

    // Insight counts derived from stored rankings
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const [recentHistory, competitorJumps] = await Promise.all([
      prisma.rankingHistory.findMany({
        where: { projectId: project.id, checkedAt: { gte: thirtyDaysAgo }, url: { not: null } },
        select: { keywordId: true, url: true },
      }),
      prisma.competitorRanking.findMany({
        where: {
          projectId: project.id,
          checkedAt: { gte: thirtyDaysAgo },
          position: { lte: 10 },
          OR: [{ previousPosition: null }, { previousPosition: { gt: 10 } }],
        },
        select: { competitorId: true },
      }),
    ]);

    const urlsByKeyword = new Map<string, Set<string>>();
    for (const h of recentHistory) {
      if (!urlsByKeyword.has(h.keywordId)) urlsByKeyword.set(h.keywordId, new Set());
      urlsByKeyword.get(h.keywordId)!.add(h.url!);
    }
    const cannibalizedKeywords = [...urlsByKeyword.values()].filter((urls) => urls.size > 1).length;
    const easyToImprove = rankingSummary.keywords.filter((k) => k.rank != null && k.rank >= 4 && k.rank <= 20).length;
    const competitorsJumpedTop10 = new Set(competitorJumps.map((c) => c.competitorId)).size;

    // Low-trust links (Domain Trust under 20) stand in for toxicity; no spam-score source is wired up
    const LOW_TRUST_THRESHOLD = 20;
    const lowTrustBacklinks = backlinks.filter((b) => b.domainTrust != null && b.domainTrust < LOW_TRUST_THRESHOLD);

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        domain: project.domain,
        websiteUrl: project.websiteUrl || `https://${project.domain}`,
        country: project.country,
        countryCode: project.countryCode,
        languageCode: project.languageCode,
        defaultSearchEngine: project.defaultSearchEngine,
        defaultDevice: project.defaultDevice,
        status: project.status,
        createdAt: project.createdAt ? new Date(project.createdAt).toISOString() : new Date().toISOString(),
      },
      summary: {
        totalKeywords: rankingSummary.summary.totalKeywords,
        top1: rankingSummary.summary.top1,
        top1Change: rankingSummary.summary.top1Change || 0,
        top3: rankingSummary.summary.top3,
        top3Change,
        top5: rankingSummary.summary.top5,
        top5Change,
        top10: rankingSummary.summary.top10,
        top10Change,
        top20: rankingSummary.summary.top20,
        top30: rankingSummary.summary.top30,
        top30Change,
        top50: rankingSummary.summary.top50,
        top100: rankingSummary.summary.top100,
        top100Change,
        unranked: rankingSummary.summary.unranked,
        improved: rankingSummary.summary.improved,
        declined: rankingSummary.summary.declined,
        unchanged: rankingSummary.summary.unchanged,
        averagePosition: rankingSummary.summary.averagePosition,
        averagePositionChange: rankingSummary.summary.averagePositionChange || 0,
        visibility: rankingSummary.summary.visibilityScore,
        visibilityChange: rankingSummary.summary.visibilityScoreChange || 0,
        searchVolume: rankingSummary.summary.totalSearchVolume,
        estimatedTraffic: rankingSummary.summary.estimatedTraffic,
        trafficChange,
        backlinksCount,
        referringDomainsCount,
      },
      insights: {
        easyToImprove,
        cannibalizedKeywords,
        competitorsJumpedTop10,
      },
      backlinkQuality: {
        threshold: LOW_TRUST_THRESHOLD,
        lowTrustCount: lowTrustBacklinks.length,
        totalBacklinks: backlinksCount,
        lowTrustLinks: lowTrustBacklinks.slice(0, 200).map((b) => ({
          sourceUrl: b.sourceUrl,
          targetUrl: b.targetUrl,
          anchorText: b.anchorText || '',
          domainTrust: b.domainTrust,
          isDoFollow: b.isDoFollow,
        })),
      },
      aiSearch: {
        totalChecks: totalAiChecks,
        mentionedCount: aiMentionedCount,
        citedCount: aiCitedCount,
        engineBreakdown,
      },
      keywordDistribution: rankingSummary.keywordDistribution,
      rankingHistory: rankingSummary.trend,
      audit: {
        healthScore,
        pagesCrawled,
        passedPages,
        criticalIssues,
        warnings,
        notices,
        totalIssues: auditIssues.length,
        hasAudited: pagesCrawled > 0,
        recentIssues: auditIssues.slice(0, 5).map((i) => ({
          id: i.id,
          title: i.title,
          category: i.category,
          severity: i.severity,
          url: i.url,
          recommendation: i.recommendation,
        })),
      },
      competitors: competitors.map((c) => ({
        id: c.id,
        name: c.name,
        domain: c.domain,
        visibilityScore: c.visibilityScore || 0,
        avgPosition: c.avgPosition || 0,
      })),
      topKeywords: rankingSummary.keywords.slice(0, 10).map((k) => ({
        id: k.id,
        keyword: k.keyword,
        searchVolume: k.volume,
        currentPosition: k.rank,
        previousPosition: k.prevRank,
        positionChange: k.change,
        difficulty: k.difficulty,
        cpc: k.cpc,
        url: k.url,
        searchEngine: k.searchEngine,
      })),
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error('Error in GET /api/projects/[id]/overview:', err);
    const message = err instanceof Error ? err.message : 'Failed to retrieve overview';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
