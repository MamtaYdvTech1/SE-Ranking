import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import {
  hashPassword,
  createSession,
  setSessionCookie,
  sanitizeUser,
  createAuditLog,
} from "@/lib/server/auth";

const AcceptInviteSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// GET: Validate invitation token
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Invitation token is required." },
        { status: 400 }
      );
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { invitedBy: { select: { name: true, email: true } } },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, message: "Invalid invitation token." },
        { status: 404 }
      );
    }

    if (invitation.status !== "pending") {
      return NextResponse.json(
        { success: false, message: `This invitation has already been ${invitation.status}.` },
        { status: 410 }
      );
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "expired" },
      });
      return NextResponse.json(
        { success: false, message: "This invitation token has expired. Please request a new invite." },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        email: invitation.email,
        role: invitation.role,
        canCreateProject: invitation.canCreateProject,
        invitedBy: invitation.invitedBy?.email || "Platform Administrator",
        expiresAt: invitation.expiresAt.toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to verify invitation token." },
      { status: 500 }
    );
  }
}

// POST: Accept invitation and register account
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = AcceptInviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || "Invalid payload." },
        { status: 400 }
      );
    }

    const { token, name, password } = parsed.data;

    // 1. Locate invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "Invitation is invalid or has already been used." },
        { status: 400 }
      );
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "expired" },
      });
      return NextResponse.json(
        { success: false, message: "Invitation has expired. Please request a new invitation." },
        { status: 400 }
      );
    }

    // 2. Hash password securely
    const passwordHash = hashPassword(password);
    const cleanEmail = invitation.email.toLowerCase().trim();

    // 3. Upsert User
    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name,
        passwordHash,
        role: invitation.role,
        status: "active",
        canCreateProject: invitation.canCreateProject,
        canCreateClient: invitation.role === "ADMIN",
        deletedAt: null,
      },
      create: {
        email: cleanEmail,
        name,
        passwordHash,
        role: invitation.role,
        status: "active",
        canCreateProject: invitation.canCreateProject,
        canCreateClient: invitation.role === "ADMIN",
      },
    });

    // 4. Assign projects if specified
    if (invitation.projectIds) {
      try {
        const projectIds: string[] = JSON.parse(invitation.projectIds);
        if (Array.isArray(projectIds) && projectIds.length > 0) {
          for (const pId of projectIds) {
            await (prisma as any).projectMember.upsert({
              where: {
                projectId_userId: { projectId: pId, userId: user.id },
              },
              update: {
                role: invitation.role === "ADMIN" ? "ADMIN" : "MEMBER",
                canEdit: true,
              },
              create: {
                projectId: pId,
                userId: user.id,
                role: invitation.role === "ADMIN" ? "ADMIN" : "MEMBER",
                canEdit: true,
              },
            });
          }
        }
      } catch (err) {
        console.error("Failed to parse assigned project IDs on invite accept:", err);
      }
    }

    // 5. Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: "accepted",
        acceptedAt: new Date(),
      },
    });

    // 6. Create Audit Log
    await createAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "INVITATION_ACCEPTED",
      entity: "Invitation",
      entityId: invitation.id,
      afterJson: {
        userId: user.id,
        email: user.email,
        role: invitation.role,
      },
      req,
    });

    // 7. Establish session
    const { sessionToken, expiresAt } = await createSession(user.id, req);
    const safeUser = sanitizeUser(user);

    const redirectUrl =
      invitation.role === "ADMIN" ? "/admin/dashboard" : "/projects";

    const response = NextResponse.json({
      success: true,
      message: `Welcome, ${name}! Your account has been initialized.`,
      user: safeUser,
      redirectUrl,
    });

    return await setSessionCookie(response, sessionToken, expiresAt);
  } catch (error: any) {
    console.error("Accept invitation error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process invitation registration." },
      { status: 500 }
    );
  }
}
