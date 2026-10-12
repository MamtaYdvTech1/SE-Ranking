import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';

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

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status'); // 200, 404, 500
    const indexableFilter = searchParams.get('indexable'); // true, false

    const where: Prisma.AuditPageWhereInput = {
      projectId: project.id,
    };

    if (statusFilter) {
      where.statusCode = parseInt(statusFilter, 10);
    }
    if (indexableFilter !== null && indexableFilter !== undefined) {
      where.isIndexable = indexableFilter === 'true';
    }

    const pages = await prisma.auditPage.findMany({
      where,
      orderBy: { crawledAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      totalCount: pages.length,
      pages: pages.map((p) => ({
        id: p.id,
        url: p.url,
        statusCode: p.statusCode,
        loadTimeMs: p.loadTimeMs,
        title: p.title,
        titleLength: p.titleLength,
        metaDescription: p.metaDescription,
        descriptionLength: p.descriptionLength,
        h1Count: p.h1Count,
        h1Text: p.h1Text,
        h2Count: p.h2Count,
        canonicalUrl: p.canonicalUrl,
        isIndexable: p.isIndexable,
        robotsDirectives: p.robotsDirectives,
        depth: p.depth,
        internalLinksCount: p.internalLinksCount,
        externalLinksCount: p.externalLinksCount,
        imagesCount: p.imagesCount,
        imagesMissingAlt: p.imagesMissingAlt,
        issuesCount: p.issuesCount,
        crawledAt: p.crawledAt.toISOString(),
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve audited pages.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
