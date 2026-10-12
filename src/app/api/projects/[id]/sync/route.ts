import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { crawlAndAuditProject } from '@/services/seo/audit.service';
import { collectRankingsForProject } from '@/services/seo/ranking.service';
import { logAuditAction } from '@/services/audit-log.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { project } = authResult.data;

    // 1. Re-crawl website for audit updates
    let auditResult = null;
    if (project.websiteAudit) {
      try {
        auditResult = await crawlAndAuditProject(project.id, project.domain, {
          maxPages: 12,
          maxDepth: 2,
          timeoutMs: 7000,
        });
      } catch (err) {
        console.warn('Sync audit crawl warning:', err);
      }
    }

    // 2. Refresh keyword rankings if provider available
    let rankingResult = null;
    try {
      rankingResult = await collectRankingsForProject(project.id, { timeoutMs: 15000 });
    } catch (err) {
      console.warn('Sync ranking collection warning:', err);
    }

    // Update project lastRankingCheckAt
    await prisma.project.update({
      where: { id: project.id },
      data: { lastRankingCheckAt: new Date() },
    });

    await logAuditAction({
      userId: authResult.data.user?.id,
      userName: authResult.data.user?.name || 'Administrator',
      action: 'ranking.checked',
      entityType: 'project',
      entityId: project.id,
      details: {
        auditUpdated: Boolean(auditResult),
        rankingsChecked: rankingResult?.checkedCount || 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Project synchronized successfully.',
      syncedAt: new Date().toISOString(),
      audit: auditResult,
      rankings: rankingResult,
    });
  } catch (err: unknown) {
    console.error('Error in POST /api/projects/[id]/sync:', err);
    const message = err instanceof Error ? err.message : 'Sync failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
