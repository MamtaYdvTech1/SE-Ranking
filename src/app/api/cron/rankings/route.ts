import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getRankingProvider, KeywordCheckRequest, SearchEngineType, DeviceType } from '@/lib/rankings';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify CRON_SECRET security
    const configuredSecret = process.env.CRON_SECRET;
    if (!configuredSecret || configuredSecret.trim() === '') {
      return NextResponse.json(
        {
          error: 'Cron execution is disabled. CRON_SECRET is not configured on the server.',
          code: 'CRON_SECRET_UNSET',
        },
        { status: 401 }
      );
    }

    const authHeader = req.headers.get('authorization');
    const headerSecret = req.headers.get('x-cron-secret');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
    const providedSecret = bearerToken || headerSecret;

    if (providedSecret !== configuredSecret) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid cron secret.', code: 'INVALID_CRON_SECRET' },
        { status: 401 }
      );
    }

    // 2. Check Ranking Provider Configuration
    const provider = getRankingProvider();
    if (!provider.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: `Automated rank tracking skipped: provider "${provider.id}" is not configured. Set SERPAPI_API_KEY in environment variables.`,
          code: 'PROVIDER_UNCONFIGURED',
        },
        { status: 400 }
      );
    }

    // 3. Find active projects scheduled for tracking
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday
    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
        isArchived: false,
        OR: [
          { rankingFrequency: 'Daily' },
          // Run Weekly tracking on Mondays (1)
          today === 1 ? { rankingFrequency: 'Weekly' } : {},
        ],
      },
      include: {
        keywords: {
          where: { deletedAt: null, isActive: true },
          take: 50, // safe batch limit per cron run
        },
      },
    });

    let totalChecked = 0;
    const resultsSummary: Array<Record<string, unknown>> = [];

    for (const project of projects) {
      if (project.keywords.length === 0) continue;

      const checkRequests: KeywordCheckRequest[] = project.keywords.map((kw) => ({
        keywordId: kw.id,
        keyword: kw.keywordText,
        targetDomain: project.domain,
        searchEngine: (kw.searchEngine || project.defaultSearchEngine || 'google') as SearchEngineType,
        countryCode: kw.countryCode || project.countryCode || 'in',
        languageCode: kw.language || project.languageCode || 'en',
        device: (kw.device || project.defaultDevice || 'desktop') as DeviceType,
      }));

      const providerRes = await provider.checkRankings(checkRequests, { timeoutMs: 30000 });
      if (providerRes.success) {
        const checkTimestamp = new Date();
        for (const res of providerRes.results) {
          const kw = project.keywords.find((k) => k.id === res.keywordId);
          if (!kw) continue;

          const prevPos = kw.currentPosition;
          const newPos = res.position;
          let posChange: number | null = null;
          if (prevPos !== null && newPos !== null) {
            posChange = prevPos - newPos;
          }

          let bestPos = kw.bestPosition;
          let worstPos = kw.worstPosition;
          if (newPos !== null) {
            bestPos = bestPos ? Math.min(bestPos, newPos) : newPos;
            worstPos = worstPos ? Math.max(worstPos, newPos) : newPos;
          }

          await prisma.keyword.update({
            where: { id: kw.id },
            data: {
              previousPosition: prevPos,
              currentPosition: newPos,
              positionChange: posChange,
              bestPosition: bestPos,
              worstPosition: worstPos,
              rankedUrl: res.rankedUrl || kw.rankedUrl,
              updatedAt: checkTimestamp,
            },
          });

          await prisma.rankingHistory.create({
            data: {
              projectId: project.id,
              keywordId: kw.id,
              searchEngine: res.searchEngine,
              country: res.countryCode,
              language: kw.language || 'en',
              device: res.device,
              position: newPos,
              previousPosition: prevPos,
              positionChange: posChange || 0,
              searchVolume: kw.monthlySearchVolume || 0,
              url: res.rankedUrl,
              checkedAt: checkTimestamp,
            },
          });
        }

        await prisma.project.update({
          where: { id: project.id },
          data: { lastRankingCheckAt: checkTimestamp },
        });

        totalChecked += providerRes.checkedCount;
        resultsSummary.push({
          projectId: project.id,
          domain: project.domain,
          checkedCount: providerRes.checkedCount,
          rankedCount: providerRes.rankedCount,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Automated ranking cron check completed. Processed ${totalChecked} keywords across ${projects.length} projects.`,
      executedAt: new Date().toISOString(),
      projectsProcessed: projects.length,
      totalKeywordsChecked: totalChecked,
      summary: resultsSummary,
    });
  } catch (err: unknown) {
    console.error('Cron rankings check error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Cron job failed.', code: 'CRON_ERROR' },
      { status: 500 }
    );
  }
}
