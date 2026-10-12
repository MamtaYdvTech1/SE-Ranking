import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ForgotPasswordSchema } from '@/lib/validation/schemas';
import { generatePasswordResetToken } from '@/lib/server/password-reset';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { verifyTurnstileToken } from '@/lib/cloudflare/turnstile';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate body with Zod
    const validation = ForgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Please provide a valid email.' },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Optional CAPTCHA verification if token provided
    if (body.captchaToken) {
      const isTurnstile = body.captchaProvider === 'cloudflare_turnstile' || body.captchaToken.includes('turnstile');
      const captchaResult = isTurnstile
        ? await verifyTurnstileToken(body.captchaToken)
        : await verifyRecaptcha(body.captchaToken);

      if (!captchaResult.success) {
        return NextResponse.json(
          { error: 'Security verification failed. Please try again.' },
          { status: 400 }
        );
      }
    }

    // Look up user in database
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });

    // Always respond with success to avoid account enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been sent.',
      });
    }

    // Generate secure expiring reset token
    const { token, expiresAt } = generatePasswordResetToken(user);

    // In production, send email via SMTP (configured in .env)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${encodeURIComponent(token)}`;
    console.info(`[Auth] Password reset token generated for ${user.email} (expires at ${expiresAt.toISOString()}): ${resetUrl}`);

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
      // For local testing in non-production
      ...(process.env.NODE_ENV !== 'production' && { resetToken: token, resetUrl }),
    });
  } catch (err: any) {
    console.error('Error in POST /api/auth/forgot-password:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
