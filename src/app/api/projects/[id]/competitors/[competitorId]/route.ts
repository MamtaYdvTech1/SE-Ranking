import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { normalizeDomain } from '@/lib/validation/schemas';
import { verifyProjectAccess } from '@/lib/server/projectAuth';

const UpdateCompetitorSchema = z.object({
  name: z.string().optional(),
  domain: z.string().min(3).max(255).optional(),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; competitorId: string }> }
) {
  try {
    const { id, competitorId } = await params;

    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { project } = authResult.data;

    const competitor = await prisma.projectCompetitor.findFirst({
      where: {
        id: competitorId,
        projectId: project.id,
        deletedAt: null,
      },
      include: {
        competitorRankings: {
          orderBy: { checkedAt: 'desc' },
          take: 50,
          include: {
            keyword: true,
          },
        },
      },
    });

    if (!competitor) {
      return NextResponse.json({ error: 'Competitor not found in this project.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: competitor,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch competitor.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; competitorId: string }> }
) {
  try {
    const { id, competitorId } = await params;

    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { project } = authResult.data;

    const competitor = await prisma.projectCompetitor.findFirst({
      where: {
        id: competitorId,
        projectId: project.id,
        deletedAt: null,
      },
    });

    if (!competitor) {
      return NextResponse.json({ error: 'Competitor not found.' }, { status: 404 });
    }

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = UpdateCompetitorSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, domain, notes, isActive } = parseResult.data;

    const updated = await prisma.projectCompetitor.update({
      where: { id: competitorId },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(domain !== undefined ? { domain: normalizeDomain(domain) } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Competitor updated successfully.',
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update competitor.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; competitorId: string }> }
) {
  try {
    const { id, competitorId } = await params;

    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { user, project } = authResult.data;

    const competitor = await prisma.projectCompetitor.findFirst({
      where: {
        id: competitorId,
        projectId: project.id,
        deletedAt: null,
      },
    });

    if (!competitor) {
      return NextResponse.json({ error: 'Competitor not found.' }, { status: 404 });
    }

    await prisma.projectCompetitor.update({
      where: { id: competitorId },
      data: {
        deletedAt: new Date(),
        deletedBy: user.email,
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Competitor "${competitor.domain}" removed successfully.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete competitor.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
