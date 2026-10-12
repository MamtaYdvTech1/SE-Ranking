import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { normalizeDomain, normalizeUrl } from '@/lib/validation/schemas';
import { getCountryInfo } from '@/lib/countryUtils';

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

    const fullProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        searchEngines: true,
        _count: {
          select: {
            keywords: { where: { deletedAt: null } },
            projectCompetitors: { where: { deletedAt: null } },
            auditIssues: { where: { deletedAt: null } },
            tasks: { where: { deletedAt: null } },
            locations: { where: { deletedAt: null } },
            reports: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!fullProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      project: {
        ...fullProject,
        primaryDomain: fullProject.domain,
        keywordsCount: fullProject._count.keywords,
        competitorsCount: fullProject._count.projectCompetitors,
        auditIssuesCount: fullProject._count.auditIssues,
        tasksCount: fullProject._count.tasks,
        locationsCount: fullProject._count.locations,
        reportsCount: fullProject._count.reports,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve project.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
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
    const updateData: Prisma.ProjectUpdateInput = {};

    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.brandName !== undefined) updateData.brandName = String(body.brandName).trim();
    if (body.isArchived !== undefined) updateData.isArchived = Boolean(body.isArchived);
    if (body.rankingFrequency !== undefined) updateData.rankingFrequency = body.rankingFrequency;
    if (body.projectColor !== undefined || body.color !== undefined) {
      updateData.projectColor = body.projectColor || body.color;
    }
    if (body.country !== undefined || body.countryCode !== undefined) {
      const cInfo = getCountryInfo(body.countryCode || body.country);
      if (cInfo) {
        updateData.country = cInfo.name;
        updateData.countryCode = cInfo.flagCode;
      }
    }
    if (body.websiteUrl !== undefined) {
      updateData.websiteUrl = normalizeUrl(body.websiteUrl);
      updateData.domain = normalizeDomain(body.websiteUrl);
    }
    if (body.weeklyReport !== undefined) updateData.weeklyReport = Boolean(body.weeklyReport);
    if (body.websiteAudit !== undefined) updateData.websiteAudit = Boolean(body.websiteAudit);
    if (body.backlinkReport !== undefined) updateData.backlinkReport = Boolean(body.backlinkReport);

    if (body.action === 'restore') {
      updateData.deletedAt = null;
      updateData.deletedBy = null;
    }

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update project.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { user, project } = authResult.data;

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      await prisma.project.delete({
        where: { id: project.id },
      });
      return NextResponse.json({ success: true, message: 'Project permanently deleted.' });
    }

    // Soft delete to Trash
    await prisma.project.update({
      where: { id: project.id },
      data: {
        deletedAt: new Date(),
        deletedBy: user.email,
      },
    });

    return NextResponse.json({ success: true, message: 'Project moved to trash.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete project.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
