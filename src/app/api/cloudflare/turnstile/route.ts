import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstileToken, getCloudflareConfig } from '@/lib/cloudflare';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, remoteIp } = body;

    const result = await verifyTurnstileToken(token, remoteIp);
    const config = getCloudflareConfig();

    return NextResponse.json({
      success: result.success,
      data: result,
      siteKey: config.turnstile.siteKey,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Turnstile verification failed' },
      { status: 500 }
    );
  }
}
