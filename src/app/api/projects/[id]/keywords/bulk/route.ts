import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';

const BulkKeywordsSchema = z.object({
  action: z.enum(['delete', 'assignGroup', 'activate', 'deactivate']),
  keywordIds: z.array(z.string()).min(1),
  groupName: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }
    const { user, project } = authResult.data;

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = BulkKeywordsSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid bulk action payload', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { action, keywordIds, groupName } = parseResult.data;

    if (action === 'delete') {
      const res = await prisma.keyword.updateMany({
        where: {
          id: { in: keywordIds },
          projectId: project.id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          deletedBy: user.email,
        },
      });
      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${res.count} keywords.`,
        affectedCount: res.count,
      });
    }

    if (action === 'assignGroup') {
      const res = await prisma.keyword.updateMany({
        where: {
          id: { in: keywordIds },
          projectId: project.id,
          deletedAt: null,
        },
        data: {
          groupName: groupName || 'General',
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({
        success: true,
        message: `Assigned ${res.count} keywords to group "${groupName || 'General'}".`,
        affectedCount: res.count,
      });
    }

    if (action === 'activate' || action === 'deactivate') {
      const isActive = action === 'activate';
      const res = await prisma.keyword.updateMany({
        where: {
          id: { in: keywordIds },
          projectId: project.id,
          deletedAt: null,
        },
        data: {
          isActive,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({
        success: true,
        message: `Set ${res.count} keywords to ${isActive ? 'active' : 'inactive'}.`,
        affectedCount: res.count,
      });
    }

    return NextResponse.json({ error: 'Unknown bulk action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bulk keyword operation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
