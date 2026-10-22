import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth, createAuditLog, hashPassword } from "@/lib/server/auth";
import { z } from "zod";
import crypto from "crypto";

const CreateUserSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  role: z.enum([
    "SUPERADMIN",
    "SUPER_ADMIN",
    "ADMIN",
    "SEO_MANAGER",
    "SEO_USER",
    "CLIENT",
    "OWNER",
    "MEMBER",
  ]).default("SEO_USER"),
  status: z.enum([
    "active",
    "pending",
    "approved",
    "rejected",
    "suspended",
    "deactivated",
    "invited",
  ]).optional(),
  projectIds: z.array(z.string()).optional(),
  canCreateProject: z.boolean().optional().default(false),
  canCreateClient: z.boolean().optional().default(false),
  planTier: z.enum(["FREE_TRIAL", "STARTER", "PRO", "AGENCY", "ENTERPRISE"]).optional(),
  toolPermissions: z.record(z.string(), z.boolean()).optional(),
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

  const fakeUserFilter = [
    { email: { contains: "user.alpha" } },
    { email: { contains: "user.beta" } },
    { email: { contains: "sec-user" } },
    { email: { contains: "sec.test" } },
    { email: { contains: "ranking-test" } },
    { email: { endsWith: "@example.com" } },
    { email: { endsWith: "@example.org" } },
    { name: { in: ["User Alpha", "User Beta", "Security Test User", "Regular SEO User", "Ranking Test Worker"] } },
  ];

  const whereClause: any = {
    deletedAt: null,
    NOT: fakeUserFilter,
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
    const parsed = CreateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      email,
      name,
      password,
      role = "SEO_USER",
      status: requestedStatus,
      projectIds = [],
      canCreateProject = false,
      canCreateClient = false,
      planTier = "FREE_TRIAL",
      toolPermissions,
    } = parsed.data;
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

    // Determine status & passwordHash
    const hasPassword = Boolean(password && password.trim().length >= 8);
    const userStatus = requestedStatus || (hasPassword ? "active" : "invited");
    const passwordHash = hasPassword ? hashPassword(password!) : null;

    // Generate unique one-time expiring invitation token if password wasn't set
    let token = "";
    let inviteLink = "";
    if (!hasPassword) {
      token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await prisma.invitation.create({
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
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://seranking.vercel.app";
      inviteLink = `${appUrl}/admin/signup?token=${token}`;
    }

    // Create or reactivate user account
    let targetUser;
    const updateData: any = {
      name: name || (existingUser?.name ?? cleanEmail.split("@")[0]),
      role,
      status: userStatus,
      canCreateProject,
      canCreateClient,
      planTier,
      deletedAt: null,
      deletedBy: null,
    };
    if (passwordHash) {
      updateData.passwordHash = passwordHash;
    }
    if (toolPermissions) {
      updateData.toolPermissions = JSON.stringify(toolPermissions);
    }

    if (existingUser) {
      targetUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: updateData,
      });
    } else {
      targetUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: name || cleanEmail.split("@")[0],
          role,
          status: userStatus,
          canCreateProject,
          canCreateClient,
          planTier,
          passwordHash: passwordHash || undefined,
          toolPermissions: toolPermissions ? JSON.stringify(toolPermissions) : undefined,
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

    // Audit Log
    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: hasPassword ? "USER_CREATED" : "USER_INVITE",
      entity: "User",
      entityId: targetUser.id,
      afterJson: {
        email: cleanEmail,
        role,
        status: userStatus,
        projectIds,
        hasDirectPassword: hasPassword,
      },
      req,
    });

    return NextResponse.json({
      success: true,
      message: hasPassword
        ? `User ${cleanEmail} created successfully with direct credentials.`
        : `Invitation created for ${cleanEmail}.`,
      data: {
        userId: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
        status: targetUser.status,
        inviteToken: token || null,
        inviteLink: inviteLink || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to invite user." },
      { status: 500 }
    );
  }
}
