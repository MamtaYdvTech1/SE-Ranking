import { NextRequest, NextResponse } from 'next/server';
import { inspectDomainCloudflareStatus } from '@/lib/cloudflare';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || searchParams.get('url');

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain or URL parameter is required' },
        { status: 400 }
      );
    }

    const audit = await inspectDomainCloudflareStatus(domain);
    return NextResponse.json({
      success: true,
      audit,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Security inspection failed' },
      { status: 500 }
    );
  }
}
