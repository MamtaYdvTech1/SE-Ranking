import { NextRequest, NextResponse } from 'next/server';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { getProjectBacklinks, syncProjectBacklinks } from '@/services/seo/backlink.service';
import { createJob } from '@/services/jobs/job.service';

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

    const summary = await getProjectBacklinks(id);
    return NextResponse.json({
      success: true,
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

    // Enqueue background job
    await createJob({
      projectId: id,
      type: 'BACKLINK_SYNC',
      payload: { projectId: id },
    });

    const syncResult = await syncProjectBacklinks(id);

    return NextResponse.json({
      success: true,
      message: `Backlink synchronization completed: ${syncResult.added} new links added.`,
      added: syncResult.added,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error syncing backlinks';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
