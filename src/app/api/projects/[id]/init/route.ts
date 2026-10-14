import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { crawlAndAuditProject } from '@/services/seo/audit.service';
import { collectRankingsForProject } from '@/services/seo/ranking.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify authenticated access
    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { project } = authResult.data;

    // 1. Fetch keywords belonging to this project
    const keywords = await prisma.keyword.findMany({
      where: { projectId: project.id, deletedAt: null },
    });

    const isRealSeoMode = process.env.SEO_PROVIDER_MODE === 'real' || process.env.NODE_ENV === 'production';
    const kwTexts = keywords.map((k: any) => k.keywordText);

    // 2. Fetch real search volume from YepAPI if configured
    try {
      const { yepApiClient } = await import('@/lib/yepapi');
      if (yepApiClient.isConfigured() && kwTexts.length > 0) {
        const kwRes = await yepApiClient.getKeywords({
          keywords: kwTexts,
          language: project.languageCode || 'en',
        });
        if (kwRes.ok && kwRes.data && Array.isArray(kwRes.data.keywords) && kwRes.data.keywords.length > 0) {
          for (const item of kwRes.data.keywords) {
            await prisma.keyword.updateMany({
              where: { projectId: project.id, keywordText: item.keyword },
              data: {
                monthlySearchVolume: item.volume ?? 0,
                cpcUsd: item.cpc ?? 0,
                keywordDifficulty: item.difficulty ?? 0,
              },
            });
          }
        }
      }
    } catch (err) {
      console.warn('Init live search volume fetch warning:', err);
    }

    // 3. Background technical SEO website audit and ranking collection
    let auditResult = null;
    let rankingResult = null;
    if (project.websiteAudit) {
      crawlAndAuditProject(project.id, project.domain, {
        maxPages: 4,
        maxDepth: 1,
        timeoutMs: 1500,
      }).catch((err) => console.warn('Background crawl notice:', err));
    }
    
    // Live ranking check via Serper.dev
    try {
      rankingResult = await collectRankingsForProject(project.id, { timeoutMs: 25000 });
    } catch (err) {
      console.warn('Live ranking collection notice:', err);
    }

    return NextResponse.json({
      success: true,
      status: 'READY',
      message: 'Automatic SEO initialization completed.',
      projectId: project.id,
      audit: auditResult,
      rankings: rankingResult,
    });
  } catch (err: unknown) {
    console.error('Error in POST /api/projects/[id]/init:', err);
    const message = err instanceof Error ? err.message : 'Initialization failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
