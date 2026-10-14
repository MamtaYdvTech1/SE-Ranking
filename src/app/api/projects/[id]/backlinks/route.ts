import { NextRequest, NextResponse } from 'next/server';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { getProjectBacklinks, syncProjectBacklinks } from '@/services/seo/backlink.service';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await verifyProjectAccess(req, id);
    if (!authResult.success) {
      return authResult.error;
    }

    const projectId = authResult.data.project.id;

    // First visit with nothing stored: pull real backlinks once
    const storedCount = await prisma.backlink.count({ where: { projectId, deletedAt: null } });
    if (storedCount === 0) {
      await syncProjectBacklinks(projectId).catch((e) => console.warn('Backlink sync notice:', e));
    }

    const summary = await getProjectBacklinks(projectId);

    return NextResponse.json({
      success: true,
      provider: 'YepAPI',
      timestamp: new Date().toISOString(),
      data: summary,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching backlinks';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

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

    const syncResult = await syncProjectBacklinks(authResult.data.project.id);
    if (!syncResult.configured) {
      return NextResponse.json(
        { success: false, error: 'Backlink data provider (YepAPI) is not configured.' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Backlink synchronization completed: ${syncResult.added} new, ${syncResult.updated} updated.`,
      added: syncResult.added,
      updated: syncResult.updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error syncing backlinks';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
