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

    const groups = await prisma.projectGroup.findMany({
      include: {
        projects: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            domain: true,
            status: true,
            country: true,
            userId: true,
            user: { select: { id: true, name: true, email: true } },
            _count: { select: { keywords: true, auditIssues: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: groups,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to list workspaces' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error || !adminCheck.auth) {
      return NextResponse.json({ success: false, message: adminCheck.error || 'Unauthorized' }, { status: adminCheck.status });
    }

    const body = await req.json();
    const { name, color } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Workspace name is required.' }, { status: 400 });
    }

    const newGroup = await prisma.projectGroup.create({
      data: {
        name: name.trim(),
        color: color || '#3B82F6',
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: adminCheck.auth.user.id,
        userName: adminCheck.auth.user.name || adminCheck.auth.user.email,
        action: 'CREATE_WORKSPACE',
        entityType: 'ProjectGroup',
        entityId: newGroup.id,
        details: JSON.stringify({ name: newGroup.name }),
      },
    });

    return NextResponse.json({
      success: true,
      data: newGroup,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to create workspace' }, { status: 500 });
  }
}
