import { NextRequest, NextResponse } from 'next/server';
import { GlobalDashboardDto, GlobalDashboardProjectSummaryDto } from '@/lib/types';
import { prisma } from '@/lib/db/prisma';
import { getAuthSession, getSessionFromCookie } from '@/lib/server/auth';

export async function GET(req?: NextRequest) {
  try {
    let session = req ? await getAuthSession(req) : null;
    if (!session) {
      session = await getSessionFromCookie();
    }
    if (!session || !session.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Please sign in.',
          },
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const isSuperAdmin = (session.user as any).role === 'SUPERADMIN';

    const whereClause: any = {
      isArchived: false,
      deletedAt: null,
    };

    if (!isSuperAdmin) {
      whereClause.userId = userId;
    }

    const dbProjects = await prisma.project.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            keywords: { where: { deletedAt: null } },
            tasks: { where: { deletedAt: null } },
            auditIssues: { where: { deletedAt: null } },
          },
        },
        integrations: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const projects: GlobalDashboardProjectSummaryDto[] = dbProjects.map((p) => {
      const gscIntegration = p.integrations?.find(
        (i) => (i.provider === 'google_search_console' || i.provider === 'gsc') && i.status === 'connected'
      );
      const calculatedHealth = Math.max(0, 100 - (p._count.auditIssues * 5));
      return {
        projectId: p.id,
        name: p.name || p.domain,
        primaryDomain: p.domain,
        healthScore: calculatedHealth,
        trackedKeywords: p._count.keywords,
        openTasks: p._count.tasks,
        overdueTasks: 0,
        gscSyncStatus: gscIntegration ? 'Active' : 'Not Connected',
      };
    });

    const totalProjects = projects.length;
    const totalTrackedKeywords = projects.reduce((acc, p) => acc + p.trackedKeywords, 0);
    const totalOpenTasks = projects.reduce((acc, p) => acc + p.openTasks, 0);
    const averageHealthScore = totalProjects > 0
      ? Math.round(projects.reduce((acc, p) => acc + (p.healthScore || 0), 0) / totalProjects)
      : 0;

    const data: GlobalDashboardDto = {
      totalProjects,
      totalTrackedKeywords,
      averageHealthScore,
      totalOpenTasks,
      totalOverdueTasks: 0,
      projects,
    };

    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        message: error?.message || 'Failed to fetch global dashboard',
      },
      { status: 500 }
    );
  }
}
