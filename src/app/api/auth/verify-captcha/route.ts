import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { verifyTurnstileToken, getCloudflareConfig } from '@/lib/cloudflare';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, provider } = body;

    const remoteIp =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      undefined;


    const isTurnstile =
      provider === 'turnstile' ||
      provider === 'cloudflare' ||
      (typeof token === 'string' &&
        (token.startsWith('cf_') ||
          token.startsWith('XXXX.') ||
          token.includes('turnstile')));

    if (isTurnstile) {
      const result = await verifyTurnstileToken(token, remoteIp);
      const config = getCloudflareConfig();
      return NextResponse.json({
        success: result.success,
        data: result,
        provider: 'cloudflare_turnstile',
        siteKey: config.turnstile.siteKey,
      });
    }

    const result = await verifyRecaptcha(token, remoteIp);

    return NextResponse.json({
      success: result.success,
      data: result,
      provider: 'google_recaptcha',
      siteKey:
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
        '6LfVttotAAAAAA0SVYMq-0KRG78ZA-z-sygL494G',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Captcha verification failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    googleRecaptcha: {
      siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LfVttotAAAAAA0SVYMq-0KRG78ZA-z-sygL494G',
      configured: Boolean(process.env.RECAPTCHA_SECRET_KEY),
    },
    cloudflareTurnstile: {
      siteKey: process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || '0x4AAAAAAFSBSgnXN7R18grY',
      configured: Boolean(process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY),
    },
  });
}
