import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth, createAuditLog } from "@/lib/server/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BroadcastSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(5, "Message must be at least 5 characters"),
  type: z.enum(["info", "warning", "critical", "success"]).default("info"),
  targetRole: z.enum(["ALL", "ADMIN", "SEO_USER", "CLIENT"]).default("ALL"),
});

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const notifications = await prisma.notification.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, email: true, name: true, role: true },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: notifications.map((n) => ({
      id: String(n.id),
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.isRead,
      userEmail: n.user?.email || "System-Wide Broadcast",
      userName: n.user?.name || "System",
      createdAt: n.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const body = await req.json();
    const parsed = BroadcastSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, message, type, targetRole } = parsed.data;

    // Find users matching targetRole
    const where: any = { deletedAt: null, status: "active" };
    if (targetRole !== "ALL") {
      where.role = targetRole;
    }

    const targetUsers = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    if (targetUsers.length === 0) {
      return NextResponse.json({ error: "No active users match target criteria" }, { status: 400 });
    }

    // Create notifications for all target users
    await prisma.notification.createMany({
      data: targetUsers.map((u) => ({
        userId: u.id,
        title,
        message,
        type,
        isRead: false,
      })),
    });

    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: "NOTIFICATION_BROADCAST",
      entity: "Notification",
      entityId: "broadcast",
      afterJson: { title, targetRole, recipientCount: targetUsers.length },
      req,
    });

    return NextResponse.json({
      success: true,
      message: `Broadcast delivered to ${targetUsers.length} user(s).`,
      recipientCount: targetUsers.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to send notification" },
      { status: 500 }
    );
  }
}
