import { NextRequest, NextResponse } from 'next/server';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import { listProjectJobs } from '@/services/jobs/job.service';

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

    const jobs = await listProjectJobs(id);

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching background jobs';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
