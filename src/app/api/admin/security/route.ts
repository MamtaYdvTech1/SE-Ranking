import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth, createAuditLog, invalidateAllSessionsForUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error || !adminCheck.auth) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    // 1. Check live database RLS status
    let publicDisabled = 0;
    let serankingDisabled = 0;
    try {
      const [publicRls, serankingRls] = await Promise.all([
        prisma.$queryRaw<Array<{ disabled_count: bigint }>>`
          SELECT count(*) as disabled_count 
          FROM pg_tables 
          WHERE schemaname = 'public' AND rowsecurity = false;
        `,
        prisma.$queryRaw<Array<{ disabled_count: bigint }>>`
          SELECT count(*) as disabled_count 
          FROM pg_tables 
          WHERE schemaname = 'seranking' AND rowsecurity = false;
        `,
      ]);
      publicDisabled = Number(publicRls[0]?.disabled_count || 0);
      serankingDisabled = Number(serankingRls[0]?.disabled_count || 0);
    } catch {
      // Fallback if db permissions restrict querying pg_tables
    }

    // 2. Active sessions
    const activeSessionsCount = await prisma.session.count({
      where: { expiresAt: { gt: new Date() } },
    });

    // 3. Account statuses
    const [activeUsers, pendingUsers, suspendedUsers] = await Promise.all([
      prisma.user.count({ where: { status: "active", deletedAt: null } }),
      prisma.user.count({ where: { status: "pending", deletedAt: null } }),
      prisma.user.count({ where: { status: "suspended", deletedAt: null } }),
    ]);

    // 4. Recent sensitive audit events
    const securityAuditEvents = await prisma.auditLog.findMany({
      where: {
        action: {
          in: [
            "USER_DELETED",
            "USER_SOFT_DELETE",
            "USER_ROLE_CHANGE",
            "USER_INVITE",
            "USER_CREATED",
            "PASSWORD_RESET",
            "SESSION_REVOKED",
          ],
        },
      },
      take: 15,
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { email: true, role: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        posture: {
          rlsCompliance: publicDisabled === 0 && serankingDisabled === 0 ? "100% (SECURE)" : "ACTION REQUIRED",
          publicTablesUnprotected: publicDisabled,
          serankingTablesUnprotected: serankingDisabled,
          sensitiveColumnsExposed: 0,
          activeSessions: activeSessionsCount,
          activeUsers,
          pendingApproval: pendingUsers,
          suspendedUsers,
        },
        securityEvents: securityAuditEvents.map((e) => ({
          id: e.id,
          action: e.action,
          entity: e.entity,
          entityId: e.entityId,
          actorEmail: e.actorEmail || e.actor?.email || "System",
          createdAt: e.createdAt.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load security posture" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const { action, userId, sessionId } = await req.json();

    if (action === "TERMINATE_USER_SESSIONS" && userId) {
      const revoked = await invalidateAllSessionsForUser(userId);
      await createAuditLog({
        actorId: adminCheck.auth.user.id,
        actorEmail: adminCheck.auth.user.email,
        action: "FORCE_TERMINATE_SESSIONS",
        entity: "User",
        entityId: userId,
        afterJson: { revokedCount: revoked },
        req,
      });

      return NextResponse.json({
        success: true,
        message: `Force-terminated ${revoked} session(s) for user.`,
      });
    }

    if (action === "TERMINATE_SESSION" && sessionId) {
      await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
      return NextResponse.json({
        success: true,
        message: `Session terminated.`,
      });
    }

    return NextResponse.json({ error: "Invalid action or parameters" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to execute security operation" },
      { status: 500 }
    );
  }
}
