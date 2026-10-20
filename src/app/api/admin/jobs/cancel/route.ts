import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminAuth } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error || !adminCheck.auth) {
      return NextResponse.json({ success: false, message: adminCheck.error || 'Unauthorized' }, { status: adminCheck.status });
    }

    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ success: false, message: 'jobId is required.' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ success: false, message: 'Job not found.' }, { status: 404 });
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'cancelled',
        completedAt: new Date(),
      },
    });

    await prisma.jobLog.create({
      data: {
        jobId,
        level: 'warn',
        message: `Job cancelled manually by admin ${adminCheck.auth.user.email}`,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: adminCheck.auth.user.id,
        userName: adminCheck.auth.user.name || adminCheck.auth.user.email,
        action: 'CANCEL_JOB',
        entityType: 'Job',
        entityId: jobId,
        details: JSON.stringify({ type: job.type }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: 'Job cancelled successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to cancel job' }, { status: 500 });
  }
}
