import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth, createAuditLog } from "@/lib/server/auth";
import { z } from "zod";

const MemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
  canEdit: z.boolean().default(true),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error || !adminCheck.auth) {
      return NextResponse.json({ success: false, message: adminCheck.error }, { status: adminCheck.status });
    }

    const { id: projectId } = await params;
    const body = await req.json();
    const parsed = MemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }

    const { userId, role, canEdit } = parsed.data;

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.deletedAt) {
      return NextResponse.json({ success: false, message: "Project not found." }, { status: 404 });
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser || (targetUser as any)?.deletedAt) {
      return NextResponse.json({ success: false, message: "Target user not found." }, { status: 404 });
    }

    // Upsert project member (Enforces unique constraint on [projectId, userId])
    const member = await (prisma as any).projectMember.upsert({
      where: {
        projectId_userId: { projectId, userId },
      },
      update: {
        role,
        canEdit,
      },
      create: {
        projectId,
        userId,
        role,
        canEdit,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: "PROJECT_MEMBER_ASSIGN",
      entity: "ProjectMember",
      entityId: `${projectId}:${userId}`,
      afterJson: { projectId, userId, role, canEdit, userEmail: targetUser.email },
      req,
    });

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.email} assigned to project.`,
      data: member,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Failed to assign member." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error || !adminCheck.auth) {
      return NextResponse.json({ success: false, message: adminCheck.error }, { status: adminCheck.status });
    }

    const { id: projectId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId query parameter is required." }, { status: 400 });
    }

    // Unassign member
    await (prisma as any).projectMember.deleteMany({
      where: { projectId, userId },
    });

    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: "PROJECT_MEMBER_UNASSIGN",
      entity: "ProjectMember",
      entityId: `${projectId}:${userId}`,
      afterJson: { projectId, unassignedUserId: userId },
      req,
    });

    return NextResponse.json({
      success: true,
      message: "Member unassigned. Project access revoked immediately.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Failed to unassign member." }, { status: 500 });
  }
}
