import { NextRequest, NextResponse } from 'next/server';
import { verifyProjectAccess } from '@/lib/server/projectAuth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const access = await verifyProjectAccess(request, id);
  if (!access.success) return access.error;

  // No GA4 Data API sync is implemented yet; report that instead of pretending a job was queued.
  return NextResponse.json(
    {
      success: false,
      statusCode: 501,
      timestamp: new Date().toISOString(),
      message: 'GA4 sync is not available yet.',
    },
    { status: 501 }
  );
}
