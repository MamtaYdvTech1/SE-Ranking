import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = (body.code || '').trim().toUpperCase();

    const validCodes = ['SERANKING20', 'PLANABLE20', 'SERANKING'];

    if (!code || validCodes.includes(code)) {
      return NextResponse.json({
        success: true,
        discountApplied: true,
        discountPercent: 20,
        code: 'SERANKING20',
        message: '20% off Planable activated successfully for the first 12 months on all plans!',
        partnerUrl: 'https://planable.io/?via=seranking-partner-20',
        expiresInDays: 365,
      });
    }

    return NextResponse.json({
      success: false,
      discountApplied: false,
      message: 'Invalid promo code. Use SERANKING20 to claim your 20% discount.',
    }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to validate promo code';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
