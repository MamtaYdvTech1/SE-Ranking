import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { generateContentBrief, generateContentDraftWithAI } from '@/services/seo/content.service';

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
    const briefs = db.contentBrief
      ? await db.contentBrief.findMany({
          where: { projectId: id },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    return NextResponse.json({
      success: true,
      briefs,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching content briefs';
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

    const body = await req.json().catch(() => ({}));
    const targetKeyword = (body.targetKeyword || '').trim();

    if (!targetKeyword) {
      return NextResponse.json({ error: 'Target keyword is required' }, { status: 400 });
    }

    // Action 1: Draft generation with AI
    if (body.action === 'generateDraft' && body.briefId) {
      const draft = await generateContentDraftWithAI(body.briefId);
      return NextResponse.json({
        success: true,
        message: 'Content draft generated successfully.',
        draft,
      });
    }

    // Action 2: Content brief generation
    const brief = await generateContentBrief({
      targetKeyword,
      projectId: id,
      targetAudience: body.targetAudience,
    });

    return NextResponse.json({
      success: true,
      message: 'Content brief generated successfully.',
      brief,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error generating content brief';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
