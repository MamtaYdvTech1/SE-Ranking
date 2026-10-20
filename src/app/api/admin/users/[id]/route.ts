import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  requireAdminAuth,
  assertAdminCanModifyUser,
  invalidateAllSessionsForUser,
  createAuditLog,
} from "@/lib/server/auth";
import { z } from "zod";

const UpdateUserSchema = z.object({
  role: z.enum(["SUPERADMIN", "ADMIN", "SEO_USER", "CLIENT", "MEMBER", "OWNER"]).optional(),
  status: z.enum(["active", "pending", "approved", "rejected", "suspended", "deactivated"]).optional(),
  rejectionReason: z.string().optional(),
  suspendedReason: z.string().optional(),
  planTier: z.enum(["FREE_TRIAL", "STARTER", "PRO", "AGENCY", "ENTERPRISE"]).optional(),
  toolPermissions: z.record(z.string(), z.boolean()).optional(),
  usageLimits: z.record(z.string(), z.number()).optional(),
  canCreateProject: z.boolean().optional(),
  canCreateClient: z.boolean().optional(),
  version: z.number().int().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      projects: {
        where: { deletedAt: null },
        select: { id: true, name: true, domain: true, status: true },
      },
      projectMemberships: {
        include: {
          project: {
            select: { id: true, name: true, domain: true, status: true },
          },
        },
      },
      sessions: {
        select: {
          id: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          expiresAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      auditLogs: {
        take: 30,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user || user.deletedAt) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Deduplicate direct-owned projects and member-assigned projects
  const assignedProjects = [
    ...user.projects.map((p) => ({ ...p, assignmentType: "Owner" })),
    ...user.projectMemberships
      .filter((pm) => !user.projects.some((p) => p.id === pm.projectId))
      .map((pm) => ({ ...pm.project, assignmentType: pm.role })),
  ];

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      name: user.name || user.firstName || "—",
      email: user.email,
      role: user.role,
      status: user.status,
      version: user.version,
      canCreateProject: user.canCreateProject,
      canCreateClient: user.canCreateClient,
      planTier: user.planTier,
      toolPermissions: user.toolPermissions ? JSON.parse(user.toolPermissions) : null,
      usageLimits: user.usageLimits ? JSON.parse(user.usageLimits) : null,
      usageCurrent: user.usageCurrent ? JSON.parse(user.usageCurrent) : null,
      approvedAt: user.approvedAt ? user.approvedAt.toISOString() : null,
      approvedBy: user.approvedBy,
      rejectedAt: user.rejectedAt ? user.rejectedAt.toISOString() : null,
      rejectionReason: user.rejectionReason,
      suspendedAt: user.suspendedAt ? user.suspendedAt.toISOString() : null,
      suspendedReason: user.suspendedReason,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      projects: assignedProjects,
      activeSessions: user.sessions.map((s) => ({
        id: s.id,
        ipAddress: s.ipAddress || "127.0.0.1",
        userAgent: s.userAgent || "Unknown",
        createdAt: s.createdAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
        isCurrent: false,
      })),
      activityTimeline: user.auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        details: log.afterJson || log.beforeJson || null,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt.toISOString(),
      })),
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = UpdateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      role,
      status,
      rejectionReason,
      suspendedReason,
      planTier,
      toolPermissions,
      usageLimits,
      canCreateProject,
      canCreateClient,
      version: clientVersion,
    } = parsed.data;

    // Check existing user and optimistic lock
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser || existingUser.deletedAt) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Optimistic locking check: If client passed version, verify it matches
    if (clientVersion !== undefined && existingUser.version !== clientVersion) {
      return NextResponse.json(
        {
          error:
            "Conflict detected: This user was modified by another administrator. Please refresh the page to view current state.",
          currentVersion: existingUser.version,
        },
        { status: 409 }
      );
    }

    // Safeguards: check self-modification and last-admin demotion
    await assertAdminCanModifyUser(adminCheck.auth.user.id, id, {
      newRole: role,
      newStatus: status,
    });

    const beforeState = {
      role: existingUser.role,
      status: existingUser.status,
      planTier: existingUser.planTier,
      toolPermissions: existingUser.toolPermissions,
      usageLimits: existingUser.usageLimits,
      canCreateProject: existingUser.canCreateProject,
      canCreateClient: existingUser.canCreateClient,
    };

    // Calculate status transitions
    let finalStatus = status || existingUser.status;
    let approvedAt = existingUser.approvedAt;
    let approvedBy = existingUser.approvedBy;
    let rejectedAt = existingUser.rejectedAt;
    let finalRejectionReason = existingUser.rejectionReason;
    let suspendedAt = existingUser.suspendedAt;
    let finalSuspendedReason = existingUser.suspendedReason;

    let auditAction = "USER_UPDATE";

    if (status === "active" || status === "approved") {
      finalStatus = "active";
      approvedAt = new Date();
      approvedBy = adminCheck.auth.user.id;
      finalRejectionReason = null;
      finalSuspendedReason = null;
      auditAction = existingUser.status === "pending" ? "USER_APPROVE" : "USER_STATUS_ACTIVE";
    } else if (status === "rejected") {
      finalStatus = "rejected";
      rejectedAt = new Date();
      finalRejectionReason = rejectionReason || "Rejected by administrator";
      auditAction = "USER_REJECT";
    } else if (status === "suspended") {
      finalStatus = "suspended";
      suspendedAt = new Date();
      finalSuspendedReason = suspendedReason || "Suspended by administrator";
      auditAction = "USER_SUSPEND";
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role ? { role } : {}),
        status: finalStatus,
        approvedAt,
        approvedBy,
        rejectedAt,
        rejectionReason: finalRejectionReason,
        suspendedAt,
        suspendedReason: finalSuspendedReason,
        ...(planTier ? { planTier } : {}),
        ...(toolPermissions !== undefined ? { toolPermissions: JSON.stringify(toolPermissions) } : {}),
        ...(usageLimits !== undefined ? { usageLimits: JSON.stringify(usageLimits) } : {}),
        ...(canCreateProject !== undefined ? { canCreateProject } : {}),
        ...(canCreateClient !== undefined ? { canCreateClient } : {}),
        version: { increment: 1 },
      },
    });

    // If role changed or user was deactivated, invalidated, rejected or suspended, revoke all sessions
    const shouldRevokeSessions =
      finalStatus !== "active" || (role && role !== existingUser.role);

    if (shouldRevokeSessions) {
      await invalidateAllSessionsForUser(id);
    }

    // Audit Log
    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: auditAction,
      entity: "User",
      entityId: id,
      beforeJson: beforeState,
      afterJson: {
        role: updatedUser.role,
        status: updatedUser.status,
        planTier: updatedUser.planTier,
        toolPermissions: updatedUser.toolPermissions,
        usageLimits: updatedUser.usageLimits,
        canCreateProject: updatedUser.canCreateProject,
        canCreateClient: updatedUser.canCreateClient,
      },
      req,
    });

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.email} updated successfully (${auditAction}).`,
      data: {
        id: updatedUser.id,
        role: updatedUser.role,
        status: updatedUser.status,
        planTier: updatedUser.planTier,
        toolPermissions: updatedUser.toolPermissions ? JSON.parse(updatedUser.toolPermissions) : null,
        usageLimits: updatedUser.usageLimits ? JSON.parse(updatedUser.usageLimits) : null,
        version: updatedUser.version,
        canCreateProject: updatedUser.canCreateProject,
        canCreateClient: updatedUser.canCreateClient,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update user." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { id } = await params;

  try {
    // Safeguards: admin cannot delete self, cannot delete last admin
    await assertAdminCanModifyUser(adminCheck.auth.user.id, id, { isDelete: true });

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: "User not found or already deleted." }, { status: 404 });
    }

    // Soft delete
    await prisma.user.update({
      where: { id },
      data: {
        status: "deactivated",
        deletedAt: new Date(),
        deletedBy: adminCheck.auth.user.id,
      },
    });

    // Invalidate sessions immediately
    await invalidateAllSessionsForUser(id);

    // Audit Log
    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: "USER_SOFT_DELETE",
      entity: "User",
      entityId: id,
      beforeJson: { email: existing.email, role: existing.role },
      afterJson: { deletedAt: new Date().toISOString() },
      req,
    });

    return NextResponse.json({
      success: true,
      message: `User ${existing.email} soft-deleted successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to delete user." },
      { status: 400 }
    );
  }
}
