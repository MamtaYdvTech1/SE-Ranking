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

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const projectId = searchParams.get('projectId') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '25', 10)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (type && type !== 'all') {
      where.type = type;
    }
    if (projectId) {
      where.projectId = projectId;
    }

    const [totalCount, items] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          logs: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      }),
    ]);

    const enrichedItems = items.map((job) => {
      let durationMs: number | null = null;
      if (job.startedAt && job.completedAt) {
        durationMs = job.completedAt.getTime() - job.startedAt.getTime();
      } else if (job.startedAt && job.status === 'running') {
        durationMs = Date.now() - job.startedAt.getTime();
      }

      return {
        ...job,
        durationMs,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        items: enrichedItems,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to list jobs' }, { status: 500 });
  }
}
