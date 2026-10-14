import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id || '').trim();

    // 1. Locate project
    let project = await prisma.project.findFirst({
      where: {
        OR: [{ id: cleanId }, { domain: cleanId }],
        deletedAt: null,
      },
      include: {
        keywords: true,
      },
    });

    if (!project) {
      // Check if domain match
      const cleanDomain = cleanId.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
      project = await prisma.project.findFirst({
        where: {
          domain: { contains: cleanDomain },
          deletedAt: null,
        },
        include: {
          keywords: true,
        },
      });
    }

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found.' },
        { status: 404 }
      );
    }

    // 2. Perform real live ranking recheck via SEO provider (YepAPI)
    const { collectRankingsForProject } = await import('@/services/seo/ranking.service');
    const result = await collectRankingsForProject(project.id, { timeoutMs: 25000 });

    // Ensure keywords without volume metrics are enriched via YepAPI
    const keywords = await prisma.keyword.findMany({
      where: { projectId: project.id, deletedAt: null },
    });

    const unmeasuredKeywords = keywords.filter((k) => !k.monthlySearchVolume || k.monthlySearchVolume === 0);
    if (unmeasuredKeywords.length > 0) {
      try {
        const { yepApiClient } = await import('@/lib/yepapi');
        if (yepApiClient.isConfigured()) {
          const kwRes = await yepApiClient.getKeywords({
            keywords: unmeasuredKeywords.map((k) => k.keywordText),
            language: project.languageCode || 'en',
          });
          if (kwRes.ok && kwRes.data?.keywords) {
            for (const item of kwRes.data.keywords) {
              await prisma.keyword.updateMany({
                where: { projectId: project.id, keywordText: item.keyword },
                data: {
                  monthlySearchVolume: item.volume ?? 0,
                  keywordDifficulty: item.difficulty ?? 0,
                  cpcUsd: item.cpc ?? 0,
                },
              });
            }
          }
        }
      } catch (err) {
        console.warn('Keyword metric enrichment warning:', err);
      }
    }

    // Update project lastRankingCheckAt
    await prisma.project.update({
      where: { id: project.id },
      data: {
        lastRankingCheckAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const updatedCount = result.checkedCount || keywords.length;

    return NextResponse.json({
      success: true,
      message: `Live search rankings and volumes rechecked for ${project.domain} (${updatedCount} keywords checked, ${result.rankedCount} ranked)!`,
      checkedAt: new Date().toISOString(),
      projectId: project.id,
      keywordsUpdated: updatedCount,
      rankedCount: result.rankedCount,
      unrankedCount: result.unrankedCount,
    });
  } catch (error: any) {
    console.error('Rankings check error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to recheck rankings.' },
      { status: 500 }
    );
  }
}
