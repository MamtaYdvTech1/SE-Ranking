import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { ActivityLogDto } from '@/lib/types';
import { prisma } from '@/lib/db/prisma';
import { getAuthSession, getSessionFromCookie } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = (await getAuthSession(req)) || (await getSessionFromCookie());
    if (!auth?.user) {
      return NextResponse.json(
        { success: false, statusCode: 401, timestamp: new Date().toISOString(), error: 'Authentication required.' },
        { status: 401 }
      );
    }
    const user = auth.user;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10) || 20));
    const entityType = searchParams.get('entityType');
    const projectId = searchParams.get('projectId');
    const search = searchParams.get('search')?.trim();

    // Users see their own activity; SUPERADMIN sees everyone's
    const where: Prisma.ActivityLogWhereInput = user.role === 'SUPERADMIN' ? {} : { userId: user.id };
    if (entityType && entityType !== 'All') {
      where.entityType = { equals: entityType, mode: 'insensitive' };
    }
    if (projectId && projectId !== 'All') {
      where.entityId = projectId;
    }
    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search } },
      ];
    }

    const [totalCount, logs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        include: { user: { select: { email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const items: ActivityLogDto[] = logs.map((l) => ({
      id: l.id,
      actorId: l.userId,
      actorEmail: l.user?.email || l.userName,
      actorRole: l.user?.role || null,
      actionType: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      projectId: l.entityType.toLowerCase() === 'project' ? l.entityId : null,
      projectName: null,
      payloadJson: l.details,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt.toISOString(),
    }));

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        items,
        pageNumber: page,
        pageSize,
        totalCount,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        error: error?.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
