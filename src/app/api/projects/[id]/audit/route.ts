import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { calculateSeoHealthScore } from '@/services/seo/audit.service';

export async function GET(
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

    // Calculate real audit metrics from SQLite DB
    const [pagesCount, issues, pages] = await Promise.all([
      prisma.auditPage.count({ where: { projectId: project.id } }),
      prisma.auditIssue.findMany({
        where: { projectId: project.id, deletedAt: null },
      }),
      prisma.auditPage.findMany({
        where: { projectId: project.id },
        select: { statusCode: true, isIndexable: true, loadTimeMs: true, crawledAt: true },
        orderBy: { crawledAt: 'desc' },
      }),
    ]);

    const errorCount = issues.filter((i) => i.severity === 'Error').length;
    const warningCount = issues.filter((i) => i.severity === 'Warning').length;
    const noticeCount = issues.filter((i) => i.severity === 'Notice').length;

    const passedPages = pages.filter((p) => p.statusCode === 200).length;
    const indexablePages = pages.filter((p) => p.isIndexable).length;

    const avgLoadTime =
      pages.length > 0
        ? Math.round(
            pages.reduce((acc, p) => acc + (p.loadTimeMs || 0), 0) / pages.length
          )
        : 0;

    const healthScore = calculateSeoHealthScore(issues, pagesCount, passedPages);

    return NextResponse.json({
      success: true,
      projectId: project.id,
      domain: project.domain,
      summary: {
        healthScore,
        pagesCrawled: pagesCount,
        passedPages,
        indexablePages,
        totalIssues: issues.length,
        errors: errorCount,
        warnings: warningCount,
        notices: noticeCount,
        avgLoadTimeMs: avgLoadTime,
        lastCrawledAt: pages[0]?.crawledAt ? new Date(pages[0].crawledAt).toISOString() : null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve audit overview.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
