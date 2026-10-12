import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { uploadToR2 } from '@/lib/cloudflare';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'headerLogo';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Size limit check: 100KB for logos, 2MB for cover backgrounds
    const maxKb = type === 'coverBg' ? 2048 : 200;
    if (file.size > maxKb * 1024) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${maxKb}KB limit.` },
        { status: 400 }
      );
    }

    // Generate safe filename with timestamp
    const ext = path.extname(file.name) || '.png';
    const cleanName = `${type}_${Date.now()}${ext}`;

    // Read buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudflare R2 (with resilient fallback)
    const result = await uploadToR2({
      buffer,
      key: cleanName,
      folder: 'branding',
      contentType: file.type || 'image/png',
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      fileName: cleanName,
      size: file.size,
      storage: result.storage,
      message: result.storage === 'cloudflare_r2' 
        ? 'Logo uploaded successfully to Cloudflare R2 Storage' 
        : 'Logo uploaded successfully to server',
    });
  } catch (error: unknown) {
    console.error('Error uploading logo:', error);
    const msg = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
