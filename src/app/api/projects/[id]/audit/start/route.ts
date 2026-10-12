import { NextRequest, NextResponse } from 'next/server';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { crawlAndAuditProject } from '@/services/seo/audit.service';
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

    // Execute real technical SEO crawl
    const crawlResult = await crawlAndAuditProject(project.id, project.domain, {
      maxPages,
      maxDepth: 2,
      timeoutMs: 7000,
    });

    // Record audit event
    await logAuditAction({
      userId: authResult.data.user?.id,
      userName: authResult.data.user?.name || 'Administrator',
      action: 'audit.started',
      entityType: 'project',
      entityId: project.id,
      details: {
        pagesCrawled: crawlResult.pagesCrawled,
        healthScore: crawlResult.healthScore,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Audit completed: crawled ${crawlResult.pagesCrawled} pages in ${(crawlResult.durationMs / 1000).toFixed(1)}s.`,
      result: crawlResult,
    });
  } catch (err: unknown) {
    console.error('Audit crawl error:', err);
    const message = err instanceof Error ? err.message : 'Audit crawler execution failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
