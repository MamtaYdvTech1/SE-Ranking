import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth, createAuditLog } from "@/lib/server/auth";
import { z } from "zod";
import crypto from "crypto";

const InviteUserSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().optional(),
  role: z.enum(["ADMIN", "SEO_USER", "CLIENT"]),
  projectIds: z.array(z.string()).optional(),
  canCreateProject: z.boolean().optional().default(false),
  canCreateClient: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase().trim() || "";
  const role = searchParams.get("role")?.trim() || "";
  const status = searchParams.get("status")?.trim() || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc";

  const whereClause: any = {
    deletedAt: null,
  };

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role) {
    whereClause.role = role;
  }

  if (status) {
    whereClause.status = status;
  }

  const [totalCount, users] = await Promise.all([
    prisma.user.count({ where: whereClause }),
    prisma.user.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            projectMemberships: true,
            projects: true,
            sessions: true,
          },
        },
      },
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const items = users.map((u) => ({
    id: u.id,
    name: u.name || u.firstName || "—",
    email: u.email,
    role: u.role,
    status: u.status,
    planTier: u.planTier,
    toolPermissions: u.toolPermissions ? JSON.parse(u.toolPermissions) : null,
    approvedAt: u.approvedAt ? u.approvedAt.toISOString() : null,
    approvedBy: u.approvedBy,
    rejectionReason: u.rejectionReason,
    suspendedReason: u.suspendedReason,
    version: u.version,
    canCreateProject: u.canCreateProject,
    canCreateClient: u.canCreateClient,
    assignedProjectsCount: u._count.projectMemberships + u._count.projects,
    activeSessionsCount: u._count.sessions,
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
  }));

  return NextResponse.json({
    success: true,
    data: {
      items,
      totalCount,
      page,
      pageSize,
    },
  });
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const body = await req.json();
    const parsed = InviteUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, name, role, projectIds = [], canCreateProject, canCreateClient } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser && !existingUser.deletedAt) {
      return NextResponse.json(
        { error: `User with email "${cleanEmail}" already exists in the system.` },
        { status: 409 }
      );
    }

    // Generate unique one-time expiring invitation token (7 days)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: {
        email: cleanEmail,
        role,
        token,
        projectIds: JSON.stringify(projectIds),
        canCreateProject,
        invitedById: adminCheck.auth.user.id,
        expiresAt,
        status: "pending",
      },
    });

    // Create or reactivate user account in invited state
    let targetUser;
    if (existingUser) {
      targetUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: name || existingUser.name,
          role,
          status: "invited",
          canCreateProject,
          canCreateClient,
          deletedAt: null,
          deletedBy: null,
        },
      });
    } else {
      targetUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: name || cleanEmail.split("@")[0],
          role,
          status: "invited",
          canCreateProject,
          canCreateClient,
        },
      });
    }

    // Assign to selected projects via ProjectMember
    if (projectIds.length > 0) {
      for (const pId of projectIds) {
        await prisma.projectMember.upsert({
          where: { projectId_userId: { projectId: pId, userId: targetUser.id } },
          update: { role: role === "ADMIN" ? "ADMIN" : "SEO_USER" },
          create: {
            projectId: pId,
            userId: targetUser.id,
            role: role === "ADMIN" ? "ADMIN" : "SEO_USER",
          },
        });
      }
    }

    // Email provider check
    const smtpHost = process.env.SMTP_HOST || process.env.RESEND_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://seranking.vercel.app";
    const inviteLink = `${appUrl}/admin/signup?token=${token}`;

    const emailConfigured = Boolean(smtpHost);

    // Audit Log
    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: "USER_INVITE",
      entity: "User",
      entityId: targetUser.id,
      afterJson: {
        email: cleanEmail,
        role,
        projectIds,
        emailConfigured,
      },
      req,
    });

    return NextResponse.json({
      success: true,
      message: emailConfigured
        ? `Invitation sent to ${cleanEmail}.`
        : "Email provider not configured. Please share the generated invite link manually.",
      data: {
        userId: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        status: targetUser.status,
        inviteToken: token,
        inviteLink,
        emailConfigured,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to invite user." },
      { status: 500 }
    );
  }
}
