import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminAuth } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error) {
      return NextResponse.json({ success: false, message: adminCheck.error }, { status: adminCheck.status });
    }

    const startPing = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startPing;

    const [
      usersCount,
      sessionsCount,
      projectsCount,
      keywordsCount,
      rankingHistoryCount,
      auditPagesCount,
      auditIssuesCount,
      backlinksCount,
      jobsCount,
      activityLogsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.session.count(),
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.keyword.count({ where: { deletedAt: null } }),
      prisma.rankingHistory.count(),
      prisma.auditPage.count(),
      prisma.auditIssue.count({ where: { deletedAt: null } }),
      prisma.backlink.count({ where: { deletedAt: null } }),
      prisma.job.count(),
      prisma.activityLog.count(),
    ]);

    const memoryUsage = process.memoryUsage();

    const healthData = {
      status: 'HEALTHY',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      uptimeSeconds: Math.round(process.uptime()),
      database: {
        engine: 'PostgreSQL / Prisma',
        status: 'CONNECTED',
        latencyMs: dbLatencyMs,
        tables: {
          User: usersCount,
          Session: sessionsCount,
          Project: projectsCount,
          Keyword: keywordsCount,
          RankingHistory: rankingHistoryCount,
          AuditPage: auditPagesCount,
          AuditIssue: auditIssuesCount,
          Backlink: backlinksCount,
          Job: jobsCount,
          ActivityLog: activityLogsCount,
        },
      },
      memory: {
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: healthData,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to check system health' }, { status: 500 });
  }
}
