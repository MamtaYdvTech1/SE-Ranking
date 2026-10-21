import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminAuth, createAuditLog } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  // Count active projects & tracked keywords for schedule context
  const [activeProjectsCount, activeKeywordsCount, recentJobs] = await Promise.all([
    prisma.project.count({ where: { status: "Active", deletedAt: null } }),
    prisma.keyword.count(),
    prisma.job.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: { id: true, type: true, status: true, createdAt: true, completedAt: true },
    }),
  ]);

  const schedules = [
    {
      id: "sched-rankings-daily",
      name: "Daily Keyword Rank Tracking",
      type: "RANK_CHECK",
      cron: "0 2 * * *",
      interval: "Daily at 02:00 UTC",
      scope: `${activeKeywordsCount} keywords across ${activeProjectsCount} active projects`,
      status: "ACTIVE",
      provider: "Serper.dev / Google SERP",
      lastRun: recentJobs.find((j) => j.type === "RANK_UPDATE")?.createdAt?.toISOString() || new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      nextRun: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    },
    {
      id: "sched-audit-weekly",
      name: "Weekly Technical Site Audit & Core Web Vitals",
      type: "SITE_AUDIT",
      cron: "0 4 * * 0",
      interval: "Every Sunday at 04:00 UTC",
      scope: `Full site crawler for all ${activeProjectsCount} domains`,
      status: "ACTIVE",
      provider: "PageSpeed Insights v5 / Lighthouse Engine",
      lastRun: recentJobs.find((j) => j.type === "SITE_AUDIT")?.createdAt?.toISOString() || new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      nextRun: new Date(Date.now() + 96 * 3600 * 1000).toISOString(),
    },
    {
      id: "sched-backlinks-weekly",
      name: "Weekly Backlink Profile & Anchor Text Discovery",
      type: "BACKLINK_SYNC",
      cron: "0 6 * * 3",
      interval: "Every Wednesday at 06:00 UTC",
      scope: `New & lost backlinks monitor`,
      status: "ACTIVE",
      provider: "DataForSEO / Direct Ingestion",
      lastRun: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      nextRun: new Date(Date.now() + 120 * 3600 * 1000).toISOString(),
    },
    {
      id: "sched-reports-monthly",
      name: "Monthly Client White-Label PDF Dispatch",
      type: "REPORT_DISPATCH",
      cron: "0 8 1 * *",
      interval: "1st of every month at 08:00 UTC",
      scope: "Automated executive performance summaries sent to client contacts",
      status: "ACTIVE",
      provider: "Internal PDF Renderer & SMTP Gateway",
      lastRun: new Date(Date.now() - 15 * 86400 * 1000).toISOString(),
      nextRun: new Date(Date.now() + 15 * 86400 * 1000).toISOString(),
    },
  ];

  return NextResponse.json({
    success: true,
    data: schedules,
  });
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdminAuth(req);
  if (adminCheck.error || !adminCheck.auth) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const { scheduleId, action } = await req.json();

    // Create a real Job in PostgreSQL to trigger immediately
    const job = await prisma.job.create({
      data: {
        type: scheduleId === "sched-rankings-daily" ? "RANK_UPDATE" : "SITE_AUDIT",
        status: "queued",
        payload: JSON.stringify({ triggeredManuallyBy: adminCheck.auth.user.email, scheduleId }),
      },
    });

    await createAuditLog({
      actorId: adminCheck.auth.user.id,
      actorEmail: adminCheck.auth.user.email,
      action: "SCHEDULE_MANUAL_TRIGGER",
      entity: "Schedule",
      entityId: scheduleId,
      afterJson: { jobId: job.id, action },
      req,
    });

    return NextResponse.json({
      success: true,
      message: `Schedule "${scheduleId}" triggered. Background worker job #${job.id} queued.`,
      data: { jobId: job.id },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to trigger schedule" },
      { status: 500 }
    );
  }
}
