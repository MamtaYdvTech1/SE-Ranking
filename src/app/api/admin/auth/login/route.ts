import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import {
  verifyPassword,
  createSession,
  setSessionCookie,
  sanitizeUser,
  createAuditLog,
} from "@/lib/server/auth";
import { checkAuthRateLimit } from "@/lib/server/rate-limiter";

const AdminLoginSchema = z.object({
  email: z.string().email("Please provide a valid administrator email"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 1. Brute-force & rate-limiting protection
    const rateLimit = checkAuthRateLimit(
      "login",
      ip,
      typeof body?.email === "string" ? body.email : undefined
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many admin login attempts. Please wait 5 minutes.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.resetSeconds) },
        }
      );
    }

    // 2. Input validation
    const parsed = AdminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // 3. User lookup
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { success: false, message: "Invalid administrator credentials." },
        { status: 401 }
      );
    }

    // 4. Role validation - strictly Super Admin / Admin only
    const userRole = (user.role || "").toUpperCase();
    const isSuperAdmin =
      userRole === "ADMIN" ||
      userRole === "SUPERADMIN" ||
      user.userRoles?.some(
        (ur) =>
          ur.role?.name === "ADMIN" ||
          ur.role?.name === "SUPERADMIN"
      );

    if (!isSuperAdmin) {
      await createAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        action: "ADMIN_LOGIN_UNAUTHORIZED_ATTEMPT",
        entity: "User",
        entityId: user.id,
        afterJson: { ip, reason: "Insufficient role permissions" },
        req,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Access Denied: This account does not possess Super Admin privileges. Standard users must sign in via the client workspace.",
        },
        { status: 403 }
      );
    }

    // 5. Check if deactivated or suspended
    if (user.status === "deactivated" || user.status === "suspended") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Administrator account has been deactivated or suspended. Contact the primary platform owner.",
        },
        { status: 403 }
      );
    }

    // 6. Update last login timestamp
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    } catch {
      // non-blocking
    }

    // 7. Create database session
    const { sessionToken, expiresAt } = await createSession(user.id, req);

    // 8. Audit logging
    await createAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "ADMIN_LOGIN_SUCCESS",
      entity: "Session",
      entityId: user.id,
      afterJson: { ip, userAgent: req.headers.get("user-agent") },
      req,
    });

    const safeUser = sanitizeUser(user);

    const response = NextResponse.json({
      success: true,
      message: "Administrator session established.",
      user: safeUser,
      redirectUrl: "/admin/dashboard",
    });

    return await setSessionCookie(response, sessionToken, expiresAt);
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error during authentication." },
      { status: 500 }
    );
  }
}
