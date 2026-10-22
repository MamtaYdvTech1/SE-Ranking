import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth, createAuditLog } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function executePurge() {
  // 1. Identify all fake/synthetic/test users
  const fakeUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: "user.alpha", mode: "insensitive" } },
        { email: { contains: "user.beta", mode: "insensitive" } },
        { email: { contains: "sec-user", mode: "insensitive" } },
        { email: { contains: "sec.test", mode: "insensitive" } },
        { email: { contains: "ranking-test", mode: "insensitive" } },
        { email: { endsWith: "@example.com", mode: "insensitive" } },
        { email: { endsWith: "@example.org", mode: "insensitive" } },
        { name: { in: ["User Alpha", "User Beta", "Security Test User", "Regular SEO User", "Ranking Test Worker"] } },
      ],
    },
    select: { id: true, email: true },
  });

  const fakeUserIds = fakeUsers.map((u) => u.id);

  // 2. Identify all fake/synthetic/test projects
  const fakeProjects = await prisma.project.findMany({
    where: {
      OR: [
        { domain: { in: ["alpha-marketing.com", "beta-tech.com", "fresh-domain.com", "project-alpha-assigned.org", "project-beta-unassigned.org"] } },
        { name: { in: ["Alpha Project", "Beta Project", "Fresh New Project"] } },
        { domain: { contains: "example.com", mode: "insensitive" } },
        { domain: { contains: "example.org", mode: "insensitive" } },
        ...(fakeUserIds.length > 0 ? [{ userId: { in: fakeUserIds } }] : []),
      ],
    },
    select: { id: true, domain: true, name: true },
  });

  const fakeProjectIds = fakeProjects.map((p) => p.id);

  let deletedKeywords = 0;
  let deletedAuditPages = 0;
  let deletedAuditIssues = 0;
  let deletedBacklinks = 0;
  let deletedAiRecords = 0;
  let deletedReports = 0;
  let deletedProjects = 0;
  let deletedUsers = 0;

  // 3. Cascade delete projects and dependent entities
  if (fakeProjectIds.length > 0) {
    if (fakeUserIds.length > 0) {
      await prisma.activityLog.deleteMany({
        where: { userId: { in: fakeUserIds } },
      }).catch(() => null);
    }

    await prisma.rankingHistory.deleteMany({
      where: { keyword: { projectId: { in: fakeProjectIds } } },
    }).catch(() => null);

    const kwRes = await prisma.keyword.deleteMany({
      where: { projectId: { in: fakeProjectIds } },
    }).catch(() => ({ count: 0 }));
    deletedKeywords = kwRes.count;

    const issRes = await prisma.auditIssue.deleteMany({
      where: { projectId: { in: fakeProjectIds } },
    }).catch(() => ({ count: 0 }));
    deletedAuditIssues = issRes.count;

    const pageRes = await prisma.auditPage.deleteMany({
      where: { projectId: { in: fakeProjectIds } },
    }).catch(() => ({ count: 0 }));
    deletedAuditPages = pageRes.count;

    const blRes = await prisma.backlink.deleteMany({
      where: { projectId: { in: fakeProjectIds } },
    }).catch(() => ({ count: 0 }));
    deletedBacklinks = blRes.count;

    const aiRes = await prisma.aiSearchRecord.deleteMany({
      where: { projectId: { in: fakeProjectIds } },
    }).catch(() => ({ count: 0 }));
    deletedAiRecords = aiRes.count;

    const repRes = await prisma.report.deleteMany({
      where: { projectId: { in: fakeProjectIds } },
    }).catch(() => ({ count: 0 }));
    deletedReports = repRes.count;

    await prisma.searchEngineConfig.deleteMany({
      where: { projectId: { in: fakeProjectIds } },
    }).catch(() => null);

    await prisma.projectIntegration.deleteMany({
      where: { projectId: { in: fakeProjectIds } },
    }).catch(() => null);

    await prisma.projectDomain.deleteMany({
      where: { projectId: { in: fakeProjectIds } },
    }).catch(() => null);

    await prisma.projectMember.deleteMany({
      where: { projectId: { in: fakeProjectIds } },
    }).catch(() => null);

    await prisma.projectCompetitor.deleteMany({
      where: { projectId: { in: fakeProjectIds } },
    }).catch(() => null);

    await prisma.job.deleteMany({
      where: { projectId: { in: fakeProjectIds } },
    }).catch(() => null);

    const pRes = await prisma.project.deleteMany({
      where: { id: { in: fakeProjectIds } },
    });
    deletedProjects = pRes.count;
  }

  // 4. Cascade delete fake users
  if (fakeUserIds.length > 0) {
    await prisma.session.deleteMany({
      where: { userId: { in: fakeUserIds } },
    }).catch(() => null);

    await prisma.userRole.deleteMany({
      where: { userId: { in: fakeUserIds } },
    }).catch(() => null);

    await prisma.projectMember.deleteMany({
      where: { userId: { in: fakeUserIds } },
    }).catch(() => null);

    const uRes = await prisma.user.deleteMany({
      where: { id: { in: fakeUserIds } },
    });
    deletedUsers = uRes.count;
  }

  const remainingUsers = await prisma.user.count({ where: { deletedAt: null } });
  const remainingProjects = await prisma.project.count({ where: { deletedAt: null } });

  return {
    deletedUsers,
    deletedProjects,
    deletedKeywords,
    deletedAuditPages,
    deletedAuditIssues,
    deletedBacklinks,
    deletedAiRecords,
    deletedReports,
    remainingUsers,
    remainingProjects,
    purgedUserSample: fakeUsers.slice(0, 10).map((u) => u.email),
    purgedProjectSample: fakeProjects.slice(0, 10).map((p) => p.domain),
  };
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const stats = await executePurge();

    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: "MAINTENANCE_PURGE_FAKE_DATA",
      entity: "DATABASE_CLEANUP",
      entityId: "system",
      afterJson: {
        deletedUsers: stats.deletedUsers,
        deletedProjects: stats.deletedProjects,
        remainingUsers: stats.remainingUsers,
        remainingProjects: stats.remainingProjects,
      },
      req,
    });

    return NextResponse.json({
      success: true,
      data: stats,
      message: `Database cleaned: Purged ${stats.deletedProjects} test projects and ${stats.deletedUsers} synthetic users. Total live projects: ${stats.remainingProjects}, Total live users: ${stats.remainingUsers}.`,
    });
  } catch (err: any) {
    console.error("[Purge Fake Data Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to purge synthetic data" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
