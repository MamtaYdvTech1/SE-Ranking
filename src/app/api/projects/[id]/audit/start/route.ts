import { NextRequest, NextResponse } from 'next/server';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import * as auditService from '@/services/seo/audit.service';
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

    const body = await req.json().catch(() => ({}));
    const maxPages = Math.min(30, Math.max(3, body.maxPages || 10));

    // 1. Create Job record in Database
    const { prisma } = await import('@/lib/db/prisma');
    const job = await prisma.job.create({
      data: {
        projectId: project.id,
        type: 'SITE_AUDIT',
        status: 'running',
        startedAt: new Date(),
        attempts: 1,
        payload: JSON.stringify({ trigger: 'manual', maxPages, domain: project.domain }),
      },
    });

    try {
      // Execute real technical SEO crawl
      const crawlResult = await auditService.crawlAndAuditProject(project.id, project.domain, {
        maxPages,
        maxDepth: 2,
        timeoutMs: 7000,
      });

      // Update Job status to completed
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          payload: JSON.stringify({
            trigger: 'manual',
            pagesCrawled: crawlResult.pagesCrawled,
            healthScore: crawlResult.healthScore,
            criticalIssues: crawlResult.criticalIssues,
            warnings: crawlResult.warnings,
            notices: crawlResult.notices,
            durationMs: crawlResult.durationMs,
          }),
        },
      });

      // Record JobLog
      await prisma.jobLog.create({
        data: {
          jobId: job.id,
          level: 'info',
          message: `Site audit completed: crawled ${crawlResult.pagesCrawled} pages in ${(crawlResult.durationMs / 1000).toFixed(1)}s.`,
          metadata: JSON.stringify({ healthScore: crawlResult.healthScore }),
        },
      }).catch(() => null);

      // Record audit event in activity log
      await logAuditAction({
        userId: authResult.data.user?.id,
        userName: authResult.data.user?.name || 'Administrator',
        action: 'audit.started',
        entityType: 'project',
        entityId: project.id,
        details: {
          jobId: job.id,
          pagesCrawled: crawlResult.pagesCrawled,
          healthScore: crawlResult.healthScore,
        },
      });

      return NextResponse.json({
        success: true,
        jobId: job.id,
        message: `Audit completed: crawled ${crawlResult.pagesCrawled} pages in ${(crawlResult.durationMs / 1000).toFixed(1)}s.`,
        result: crawlResult,
      });
    } catch (crawlErr: unknown) {
      const errMsg = crawlErr instanceof Error ? crawlErr.message : 'Audit crawl failed';
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          error: errMsg,
        },
      }).catch(() => null);

      throw crawlErr;
    }
  } catch (err: unknown) {
    console.error('Audit crawl error:', err);
    const message = err instanceof Error ? err.message : 'Audit crawler execution failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
