import { NextRequest, NextResponse } from 'next/server';
import { listR2Files, deleteFromR2, checkR2Status, getCloudflareConfig } from '@/lib/cloudflare';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get('prefix') || '';
    const maxKeys = parseInt(searchParams.get('maxKeys') || '50', 10);

    const files = await listR2Files({ prefix, maxKeys });
    const status = await checkR2Status();
    const config = getCloudflareConfig();

    return NextResponse.json({
      success: true,
      bucket: config.r2.bucketName,
      status: status.connected ? 'online' : 'fallback_mode',
      latencyMs: status.latencyMs,
      files,
      totalCount: files.length,
      totalBytes: files.reduce((acc, f) => acc + (f.size || 0), 0),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list R2 files' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ success: false, error: 'File key is required' }, { status: 400 });
    }

    const result = await deleteFromR2(key);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete file from R2' },
      { status: 500 }
    );
  }
}
