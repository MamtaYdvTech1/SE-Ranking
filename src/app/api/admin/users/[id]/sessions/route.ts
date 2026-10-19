import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, invalidateAllSessionsForUser, createAuditLog } from "@/lib/server/auth";

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
    const revokedCount = await invalidateAllSessionsForUser(id);

    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: "USER_FORCE_LOGOUT",
      entity: "User",
      entityId: id,
      afterJson: { revokedSessionCount: revokedCount },
      req,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully terminated ${revokedCount} active session(s).`,
      revokedCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to terminate sessions." },
      { status: 500 }
    );
  }
}
