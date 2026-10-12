import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { analyzeOnPageUrl } from '@/services/seo/onpage.service';

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

    const db = prisma as any;
    const pages = db.onpagePage
      ? await db.onpagePage.findMany({
          where: { projectId: id },
          orderBy: { createdAt: 'desc' },
          include: {
            issues: true,
          },
        })
      : [];

    return NextResponse.json({
      success: true,
      pages,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching on-page audits';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

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
    const targetUrl = body.url || project.websiteUrl || `https://${project.domain}`;
    const targetKeyword = body.targetKeyword || '';

    const analysis = await analyzeOnPageUrl({
      url: targetUrl,
      targetKeyword,
      projectId: project.id,
    });

    return NextResponse.json({
      success: true,
      message: 'On-Page SEO analysis completed successfully.',
      analysis,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error running on-page audit';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
