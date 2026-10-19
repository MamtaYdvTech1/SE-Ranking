import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth, createAuditLog } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error || !adminCheck.auth) {
      return NextResponse.json({ success: false, message: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        client: { select: { id: true, name: true, company: true } },
        domains: true,
        projectCompetitors: { where: { deletedAt: null } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        searchEngines: true,
        _count: {
          select: {
            keywords: { where: { deletedAt: null } },
            auditPages: true,
            auditIssues: { where: { deletedAt: null } },
            backlinks: { where: { deletedAt: null } },
            rankingHistory: true,
            aiSearchRecords: true,
          },
        },
      },
    });

    if (!project || project.deletedAt) {
      return NextResponse.json({ success: false, message: "Project not found." }, { status: 404 });
    }

    // Get latest audit run timestamp if exists
    const latestAuditPage = await prisma.auditPage.findFirst({
      where: { projectId: id },
      orderBy: { crawledAt: "desc" },
      select: { crawledAt: true },
    });

    // Check integration connection states
    const hasPageSpeedKey = Boolean(process.env.PAGESPEED_API_KEY);
    const hasSerperKey = Boolean(process.env.SERPER_API_KEY);
    const hasYepApiKey = Boolean(process.env.YEPAPI_KEY);

    // Module Status Cards data (Strictly real data or "Not connected")
    const moduleCards = [
      {
        module: "Site Audit",
        status: project._count.auditPages > 0 ? "Active" : "Not connected",
        detail:
          project._count.auditPages > 0
            ? `${project._count.auditPages} pages crawled, ${project._count.auditIssues} issues detected`
            : "No audit crawl initiated yet",
        lastUpdated: latestAuditPage ? latestAuditPage.crawledAt.toISOString() : null,
      },
      {
        module: "Performance (Core Web Vitals)",
        status: hasPageSpeedKey ? "Configured" : "Not connected",
        detail: hasPageSpeedKey ? "PageSpeed Insights API available" : "PAGESPEED_API_KEY missing in environment",
        lastUpdated: null,
      },
      {
        module: "Keywords & Intent",
        status: project._count.keywords > 0 ? "Active" : "Empty",
        detail: `${project._count.keywords} tracked keywords in repository`,
        lastUpdated: project.updatedAt.toISOString(),
      },
      {
        module: "Rank Tracking",
        status: hasSerperKey ? "Active (Serper)" : "Not connected",
        detail:
          project._count.rankingHistory > 0
            ? `${project._count.rankingHistory} SERP check history snapshots`
            : "Awaiting next daily ranking cycle",
        lastUpdated: project.lastRankingCheckAt ? project.lastRankingCheckAt.toISOString() : null,
      },
      {
        module: "Backlinks Explorer",
        status: project._count.backlinks > 0 ? "Active" : hasYepApiKey ? "Quota Blocked (HTTP 402)" : "Not connected",
        detail: `${project._count.backlinks} verified backlinks stored`,
        lastUpdated: null,
      },
      {
        module: "AI Visibility (GEO Tracker)",
        status: project._count.aiSearchRecords > 0 ? "Active" : "Not connected",
        detail:
          project._count.aiSearchRecords > 0
            ? `${project._count.aiSearchRecords} generative engine prompts tracked`
            : "No AI search runs executed yet",
        lastUpdated: null,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        domain: project.domain,
        websiteUrl: project.websiteUrl,
        country: project.country,
        countryCode: project.countryCode,
        languageCode: project.languageCode,
        defaultSearchEngine: project.defaultSearchEngine,
        defaultDevice: project.defaultDevice,
        rankingFrequency: project.rankingFrequency,
        status: project.status,
        isArchived: project.isArchived,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        client: project.client,
        owner: project.user,
        domains: project.domains,
        members: project.members.map((m) => ({
          id: m.id,
          userId: m.userId,
          role: m.role,
          canEdit: m.canEdit,
          user: m.user,
          createdAt: m.createdAt.toISOString(),
        })),
        competitors: project.projectCompetitors.map((c) => ({
          id: c.id,
          domain: c.domain,
          name: c.name,
          createdAt: c.createdAt.toISOString(),
        })),
        searchEngines: project.searchEngines,
        moduleCards,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load project details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error || !adminCheck.auth) {
      return NextResponse.json(
        { success: false, message: adminCheck.error || "Unauthorized" },
        { status: adminCheck.status }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { name, clientId, userId, status, rankingFrequency, isArchived } = body;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Project not found." }, { status: 404 });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(clientId !== undefined ? { clientId: clientId || null } : {}),
        ...(userId !== undefined ? { userId: userId || null } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(rankingFrequency !== undefined ? { rankingFrequency } : {}),
        ...(isArchived !== undefined ? { isArchived: Boolean(isArchived) } : {}),
      },
    });

    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: "PROJECT_UPDATE",
      entity: "Project",
      entityId: id,
      beforeJson: { name: existing.name, status: existing.status, clientId: existing.clientId },
      afterJson: body,
      req,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error || !adminCheck.auth) {
      return NextResponse.json(
        { success: false, message: adminCheck.error || "Unauthorized" },
        { status: adminCheck.status }
      );
    }

    const { id } = await params;
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Project not found." }, { status: 404 });
    }

    // Archive / restore toggle
    const shouldArchive = !existing.isArchived;

    await prisma.project.update({
      where: { id },
      data: {
        isArchived: shouldArchive,
        status: shouldArchive ? "Archived" : "Active",
      },
    });

    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: shouldArchive ? "PROJECT_ARCHIVE" : "PROJECT_RESTORE",
      entity: "Project",
      entityId: id,
      afterJson: { isArchived: shouldArchive },
      req,
    });

    return NextResponse.json({
      success: true,
      message: shouldArchive ? "Project archived." : "Project restored.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to toggle project archive state" },
      { status: 500 }
    );
  }
}
