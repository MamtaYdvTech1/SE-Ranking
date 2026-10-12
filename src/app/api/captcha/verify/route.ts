import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstileToken } from '@/lib/cloudflare/turnstile';
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token || body.captchaToken;
    const provider = body.provider || body.captchaProvider || 'cloudflare_turnstile';

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'CAPTCHA token is required.' },
        { status: 400 }
      );
    }

    const isTurnstile =
      provider === 'cloudflare_turnstile' ||
      provider === 'turnstile' ||
      token.startsWith('cf_') ||
      token.startsWith('XXXX.') ||
      token.length > 200;

    let result;
    if (isTurnstile) {
      result = await verifyTurnstileToken(token);
    } else {
      result = await verifyRecaptcha(token);
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Verification failed. Token may be invalid or expired.',
          errorCodes: (result as any)['error-codes'],
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: result.provider,
      hostname: result.hostname,
      verifiedAt: (result as any).challenge_ts || new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error in POST /api/captcha/verify:', err);
    return NextResponse.json(
      { success: false, error: 'CAPTCHA verification server error.' },
      { status: 500 }
    );
  }
}
