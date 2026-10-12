import { NextResponse } from 'next/server';
import { getCloudflareConfig, checkR2Status, listCloudflareZones } from '@/lib/cloudflare';

export async function GET() {
  try {
    const config = getCloudflareConfig();
    const r2Status = await checkR2Status();
    const zones = await listCloudflareZones();

    return NextResponse.json({
      success: true,
      cloudflare: {
        accountId: config.accountId ? `${config.accountId.slice(0, 8)}...` : null,
        apiTokenConfigured: !!config.apiToken && config.apiToken.length > 5,
        r2: {
          bucketName: config.r2.bucketName,
          endpoint: config.r2.endpoint,
          publicUrl: config.r2.publicUrl,
          connected: r2Status.connected,
          latencyMs: r2Status.latencyMs,
          error: r2Status.error,
        },
        turnstile: {
          siteKeyConfigured: !!config.turnstile.siteKey,
          siteKey: config.turnstile.siteKey,
          secretKeyConfigured: !!config.turnstile.secretKey,
        },
        edge: {
          zonesCount: zones.length,
          zones: zones.map((z) => ({ id: z.id, name: z.name, status: z.status })),
          anycastDns: '1.1.1.1 (Active)',
          cachePurgeEnabled: true,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Cloudflare status' },
      { status: 500 }
    );
  }
}
