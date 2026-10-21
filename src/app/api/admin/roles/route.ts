import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth, createAuditLog } from "@/lib/server/auth";
import { ROLE_PERMISSIONS, EnterpriseRole } from "@/lib/server/rbac";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  // Count active users per role from PostgreSQL
  const userCounts = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
    where: { deletedAt: null },
  });

  const countMap: Record<string, number> = {};
  for (const item of userCounts) {
    countMap[item.role] = item._count.id;
  }

  const roleDefinitions = (Object.keys(ROLE_PERMISSIONS) as EnterpriseRole[]).map((role) => ({
    name: role,
    label: role.replace("_", " "),
    permissions: ROLE_PERMISSIONS[role],
    userCount:
      (countMap[role] || 0) +
      (role === "SUPER_ADMIN" ? (countMap["SUPERADMIN"] || 0) + (countMap["OWNER"] || 0) : 0),
    isSystem: role === "SUPER_ADMIN" || role === "ADMIN",
    description:
      role === "SUPER_ADMIN"
        ? "Full root system access to platform infrastructure, billing, and audit records."
        : role === "ADMIN"
        ? "Administrative control over users, projects, clients, and integrations."
        : role === "SEO_MANAGER"
        ? "Can manage team SEO campaigns, trigger audits, create projects, and export reports."
        : role === "SEO_USER"
        ? "Operator access restricted strictly to assigned projects."
        : "Read-only access for external clients on designated project dashboards.",
  }));

  const allAvailablePermissions = [
    { key: "users.create", label: "Create Users", category: "Users" },
    { key: "users.read", label: "View User Profiles", category: "Users" },
    { key: "users.update", label: "Edit Users & Roles", category: "Users" },
    { key: "users.delete", label: "Soft Delete Users", category: "Users" },
    { key: "projects.create", label: "Create Projects", category: "Projects" },
    { key: "projects.read", label: "View Projects", category: "Projects" },
    { key: "projects.update", label: "Update Projects", category: "Projects" },
    { key: "projects.delete", label: "Delete Projects", category: "Projects" },
    { key: "audit.run", label: "Trigger Technical Audits", category: "SEO Tools" },
    { key: "keywords.manage", label: "Manage Keyword Targets", category: "SEO Tools" },
    { key: "ranktracking.manage", label: "Configure Rank Tracking", category: "SEO Tools" },
    { key: "reports.create", label: "Build PDF/CSV Reports", category: "Reports" },
    { key: "reports.export", label: "Download Reports", category: "Reports" },
    { key: "integrations.manage", label: "Manage API Keys & Providers", category: "System" },
    { key: "settings.manage", label: "Modify Platform Settings", category: "System" },
  ];

  return NextResponse.json({
    success: true,
    data: {
      roles: roleDefinitions,
      permissions: allAvailablePermissions,
    },
  });
}
