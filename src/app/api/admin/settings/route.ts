import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth, createAuditLog } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  // Load settings from SystemSetting table
  const settingsRecords = await prisma.systemSetting.findMany();
  const settingsMap: Record<string, any> = {};
  for (const s of settingsRecords) {
    try {
      settingsMap[s.key] = JSON.parse(s.value);
    } catch {
      settingsMap[s.key] = s.value;
    }
  }

  const defaults = {
    platformName: "SE Ranking Enterprise",
    whiteLabelBrand: "SE Ranking Research Studio",
    supportEmail: "support@seranking.internal",
    defaultCountry: "India",
    defaultCountryCode: "in",
    defaultLanguage: "English",
    defaultLanguageCode: "en",
    sessionTtlHours: 168, // 7 days
    rateLimitPerMinute: 120,
    allowPublicRegistration: true,
    requireAdminApproval: true,
    weeklyAuditAutoDispatch: true,
    ...settingsMap,
  };

  return NextResponse.json({
    success: true,
    data: defaults,
  });
}

export async function PATCH(req: NextRequest) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const updates = await req.json();

    for (const [key, val] of Object.entries(updates)) {
      const serialized = typeof val === "string" ? val : JSON.stringify(val);
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value: serialized },
        create: { key, value: serialized },
      });
    }

    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: "PLATFORM_SETTINGS_UPDATE",
      entity: "SystemSetting",
      entityId: "global",
      afterJson: updates,
      req,
    });

    return NextResponse.json({
      success: true,
      message: "Platform settings updated successfully.",
      data: updates,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update platform settings" },
      { status: 500 }
    );
  }
}
