import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { getRankingProvider, KeywordCheckRequest, SearchEngineType, DeviceType } from '@/lib/rankings';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; competitorId: string }> }
) {
  try {
    const { id, competitorId } = await params;

    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { project } = authResult.data;

    const competitor = await prisma.projectCompetitor.findFirst({
      where: {
        id: competitorId,
        projectId: project.id,
        deletedAt: null,
      },
    });

    if (!competitor) {
      return NextResponse.json({ error: 'Competitor not found.' }, { status: 404 });
    }

    // Query project keywords and latest competitor rankings
    const keywords = await prisma.keyword.findMany({
      where: {
        projectId: project.id,
        deletedAt: null,
      },
      include: {
        competitorRankings: {
          where: { competitorId: competitor.id },
          orderBy: { checkedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { currentPosition: 'asc' },
    });

    const comparisons = keywords.map((k) => {
      const compRank = k.competitorRankings[0]?.position || null;
      const myRank = k.currentPosition || null;

      let comparisonResult = 'tied';
      if (myRank !== null && compRank === null) {
        comparisonResult = 'ahead';
      } else if (myRank === null && compRank !== null) {
        comparisonResult = 'behind';
      } else if (myRank !== null && compRank !== null) {
        if (myRank < compRank) comparisonResult = 'ahead'; // lower number is better rank
        else if (myRank > compRank) comparisonResult = 'behind';
        else comparisonResult = 'tied';
      }

      return {
        keywordId: k.id,
        keyword: k.keywordText,
        volume: k.monthlySearchVolume || 0,
        cpc: k.cpcUsd ? `$${k.cpcUsd.toFixed(2)}` : '$0.00',
        myPosition: myRank,
        competitorPosition: compRank,
        competitorUrl: k.competitorRankings[0]?.url || null,
        comparison: comparisonResult,
        lastChecked: k.competitorRankings[0]?.checkedAt || null,
      };
    });

    const aheadCount = comparisons.filter((c) => c.comparison === 'ahead').length;
    const behindCount = comparisons.filter((c) => c.comparison === 'behind').length;
    const tiedCount = comparisons.filter((c) => c.comparison === 'tied').length;

    return NextResponse.json({
      success: true,
      competitor: {
        id: competitor.id,
        name: competitor.name,
        domain: competitor.domain,
      },
      projectDomain: project.domain,
      summary: {
        totalKeywords: keywords.length,
        aheadCount,
        behindCount,
        tiedCount,
      },
      comparisons,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch competitor rankings.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; competitorId: string }> }
) {
  try {
    const { id, competitorId } = await params;

    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { project } = authResult.data;

    const competitor = await prisma.projectCompetitor.findFirst({
      where: {
        id: competitorId,
        projectId: project.id,
        deletedAt: null,
      },
    });

    if (!competitor) {
      return NextResponse.json({ error: 'Competitor not found.' }, { status: 404 });
    }

    const provider = getRankingProvider();
    if (!provider.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROVIDER_UNCONFIGURED',
            message: `Ranking provider "${provider.id}" is not configured. Set SERPAPI_API_KEY in environment variables to check live competitor rankings.`,
            provider: provider.id,
          },
        },
        { status: 400 }
      );
    }

    const keywords = await prisma.keyword.findMany({
      where: { projectId: project.id, deletedAt: null },
      take: 20, // safe batch for competitor check
    });

    const checkRequests: KeywordCheckRequest[] = keywords.map((k) => ({
      keywordId: k.id,
      keyword: k.keywordText,
      targetDomain: competitor.domain,
      searchEngine: (k.searchEngine || project.defaultSearchEngine || 'google') as SearchEngineType,
      countryCode: k.countryCode || project.countryCode || 'in',
      device: (k.device || project.defaultDevice || 'desktop') as DeviceType,
    }));

    const providerRes = await provider.checkRankings(checkRequests, { timeoutMs: 30000 });
    if (!providerRes.success) {
      return NextResponse.json(
        { success: false, error: providerRes.error },
        { status: providerRes.error?.statusCode || 500 }
      );
    }

    const checkTimestamp = new Date();
    for (const res of providerRes.results) {
      await prisma.competitorRanking.create({
        data: {
          projectId: project.id,
          competitorId: competitor.id,
          keywordId: res.keywordId,
          searchEngine: res.searchEngine,
          position: res.position,
          url: res.rankedUrl,
          checkedAt: checkTimestamp,
        },
      });
    }

    // Update competitor aggregate stats in DB
    const validPositions = providerRes.results
      .map((r) => r.position)
      .filter((p): p is number => p != null && p > 0 && p <= 100);

    const avgPos =
      validPositions.length > 0
        ? Number((validPositions.reduce((a, b) => a + b, 0) / validPositions.length).toFixed(1))
        : 0;

    const top10 = validPositions.filter((p) => p <= 10).length;
    const visibility = keywords.length > 0 ? Number(((top10 / keywords.length) * 100).toFixed(1)) : 0;

    await prisma.projectCompetitor.update({
      where: { id: competitor.id },
      data: {
        avgPosition: avgPos,
        visibilityScore: visibility,
        commonKeywordsCount: validPositions.length,
        totalKeywords: keywords.length,
        updatedAt: checkTimestamp,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Checked rankings for ${providerRes.checkedCount} keywords for competitor ${competitor.domain}.`,
      checkedCount: providerRes.checkedCount,
      rankedCount: providerRes.rankedCount,
      competitorDomain: competitor.domain,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to check competitor rankings.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
