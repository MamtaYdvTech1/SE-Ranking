import { NextRequest, NextResponse } from 'next/server';
import { purgeCloudflareCache } from '@/lib/cloudflare';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { zoneId, urls, purgeEverything, tags } = body;

    const result = await purgeCloudflareCache({
      zoneId,
      urls: Array.isArray(urls) ? urls : urls ? [urls] : undefined,
      purgeEverything: !!purgeEverything,
      tags,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to purge Cloudflare cache' },
      { status: 500 }
    );
  }
}
