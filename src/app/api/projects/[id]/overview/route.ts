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

    // 2. Fetch real technical SEO audit records
    const [auditPages, auditIssues, competitors, backlinksCount] = await Promise.all([
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
      prisma.backlink.count({
        where: { projectId: project.id, deletedAt: null },
      }),
    ]);

    const pagesCrawled = auditPages.length;
    const passedPages = auditPages.filter((p) => p.statusCode === 200).length;
    const criticalIssues = auditIssues.filter((i) => i.severity === 'Error').length;
    const warnings = auditIssues.filter((i) => i.severity === 'Warning').length;
    const notices = auditIssues.filter((i) => i.severity === 'Notice').length;

    // Real SEO Health Score: null if never audited, otherwise calculated
    const healthScore = calculateSeoHealthScore(auditIssues, pagesCrawled, passedPages);

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
        top3: rankingSummary.summary.top3,
        top5: rankingSummary.summary.top5,
        top10: rankingSummary.summary.top10,
        top20: rankingSummary.summary.top20,
        top30: rankingSummary.summary.top30,
        top50: rankingSummary.summary.top50,
        top100: rankingSummary.summary.top100,
        unranked: rankingSummary.summary.unranked,
        improved: rankingSummary.summary.improved,
        declined: rankingSummary.summary.declined,
        unchanged: rankingSummary.summary.unchanged,
        averagePosition: rankingSummary.summary.averagePosition,
        visibility: rankingSummary.summary.visibilityScore,
        searchVolume: rankingSummary.summary.totalSearchVolume,
        estimatedTraffic: rankingSummary.summary.estimatedTraffic,
        backlinksCount,
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
