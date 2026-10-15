import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { uploadToR2 } from '@/lib/cloudflare';
import { getAuthSession, getSessionFromCookie } from '@/lib/server/auth';

export const runtime = 'nodejs';

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

export async function POST(req: NextRequest) {
  try {
    const auth = (await getAuthSession(req)) || (await getSessionFromCookie());
    if (!auth?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'headerLogo';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // MIME type check
    const mimeType = (file.type || '').toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PNG, JPG, WEBP, and GIF images are allowed.' },
        { status: 400 }
      );
    }

    // Extension check and path traversal prevention
    const rawExt = path.extname(file.name || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file extension. Only .png, .jpg, .jpeg, .webp, and .gif are allowed.' },
        { status: 400 }
      );
    }

    // Size limit check: 200KB for logos, 2MB for cover backgrounds
    const maxKb = type === 'coverBg' ? 2048 : 200;
    if (file.size > maxKb * 1024) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${maxKb}KB limit.` },
        { status: 400 }
      );
    }

    // Generate safe filename with timestamp and clean extension
    const cleanExt = rawExt || '.png';
    const cleanType = type.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) || 'logo';
    const cleanName = `${cleanType}_${Date.now()}${cleanExt}`;

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
