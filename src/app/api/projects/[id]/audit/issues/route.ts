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
    const category = searchParams.get('category'); // Crawlability, Performance, Content, Links, Security
    const severity = searchParams.get('severity'); // Error, Warning, Notice

    const where: Prisma.AuditIssueWhereInput = {
      projectId: project.id,
      deletedAt: null,
    };

    if (category) where.category = category;
    if (severity) where.severity = severity;

    const issues = await prisma.auditIssue.findMany({
      where,
      orderBy: [{ severity: 'asc' }, { foundAt: 'desc' }],
      take: 150,
    });

    return NextResponse.json({
      success: true,
      totalCount: issues.length,
      issues: issues.map((i) => ({
        id: i.id,
        ruleId: i.ruleId,
        title: i.title,
        category: i.category,
        severity: i.severity,
        url: i.url,
        description: i.description,
        recommendation: i.recommendation,
        status: i.status,
        foundAt: i.foundAt.toISOString(),
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve audit issues.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
