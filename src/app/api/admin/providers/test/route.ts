import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/server/auth';
import { executeProviderConnectionTest, getProviderTelemetry } from '@/lib/server/providerTelemetry';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await requireAdminAuth(req);
    if (adminCheck.error) {
      return NextResponse.json({ success: false, message: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await req.json().catch(() => ({}));
    const { providerId } = body;

    if (!providerId) {
      return NextResponse.json({ success: false, message: 'Missing providerId parameter' }, { status: 400 });
    }

    const result = await executeProviderConnectionTest(providerId);
    const telemetry = getProviderTelemetry(providerId);

    return NextResponse.json({
      success: result.success,
      data: {
        providerId,
        status: result.status,
        latencyMs: result.latencyMs,
        message: result.message,
        details: result.details,
        telemetry,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Provider test failed';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
