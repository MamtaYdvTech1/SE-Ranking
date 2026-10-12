import { NextRequest, NextResponse } from 'next/server';
import { ActivityLogDto } from '@/lib/types';

export const dynamic = 'force-dynamic';

const DEFAULT_ACTIVITY_LOGS: ActivityLogDto[] = [
  {
    id: 101,
    actorId: 'user-1',
    actorEmail: 'admin@internal.local',
    actorRole: 'SuperAdmin',
    actionType: 'Project.Created',
    entityType: 'Project',
    entityId: 'proj-1',
    projectId: 'proj-1',
    projectName: 'Test Project',
    payloadJson: JSON.stringify({ name: 'Test Project', domain: 'example.com' }),
    ipAddress: '127.0.0.1',
    createdAt: '2026-09-08T10:00:00.000Z',
  },
  {
    id: 102,
    actorId: 'user-2',
    actorEmail: 'manager@internal.local',
    actorRole: 'ProjectManager',
    actionType: 'Keyword.Added',
    entityType: 'Keyword',
    entityId: 'kw-101',
    projectId: 'proj-1',
    projectName: 'Test Project',
    payloadJson: JSON.stringify({ keyword: 'seo rank tracker', volume: 18200 }),
    ipAddress: '192.168.1.45',
    createdAt: '2026-09-08T11:15:00.000Z',
  },
  {
    id: 103,
    actorId: 'user-1',
    actorEmail: 'admin@internal.local',
    actorRole: 'SuperAdmin',
    actionType: 'Report.Generated',
    entityType: 'Report',
    entityId: 'rep-501',
    projectId: 'proj-1',
    projectName: 'Test Project',
    payloadJson: JSON.stringify({ format: 'PDF', recipients: ['client@corp.com'] }),
    ipAddress: '127.0.0.1',
    createdAt: '2026-09-08T14:30:00.000Z',
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const entityType = searchParams.get('entityType');
    const projectId = searchParams.get('projectId');
    const search = searchParams.get('search')?.toLowerCase();

    let filtered = [...DEFAULT_ACTIVITY_LOGS];

    if (entityType && entityType !== 'All') {
      filtered = filtered.filter((l) => l.entityType.toLowerCase() === entityType.toLowerCase());
    }

    if (projectId && projectId !== 'All') {
      filtered = filtered.filter((l) => l.projectId === projectId);
    }

    if (search) {
      filtered = filtered.filter(
        (l) =>
          l.actionType.toLowerCase().includes(search) ||
          (l.actorEmail && l.actorEmail.toLowerCase().includes(search)) ||
          (l.projectName && l.projectName.toLowerCase().includes(search)) ||
          (l.ipAddress && l.ipAddress.includes(search))
      );
    }

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize) || (totalCount > 0 ? 1 : 0);
    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

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
