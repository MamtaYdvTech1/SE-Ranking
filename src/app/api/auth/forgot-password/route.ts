import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ForgotPasswordSchema } from '@/lib/validation/schemas';
import { generatePasswordResetToken } from '@/lib/server/password-reset';
import { sendEmail } from '@/lib/email';
import { checkAuthRateLimit } from '@/lib/server/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // 1. IP & Identifier Rate Limiting (Account enumeration & spam defense)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const rateLimit = checkAuthRateLimit(
      'forgot-password',
      ip,
      typeof body?.email === 'string' ? body.email : undefined
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes before trying again.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.resetSeconds) },
        }
      );
    }

    // 2. Validate email format
    const validation = ForgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const cleanEmail = email.toLowerCase().trim();

    // 3. Look up user in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, email: true, passwordHash: true },
    });

    // 4. Always respond with uniform success message to mitigate account enumeration
    const genericResponse = {
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
    };

    if (!user) {
      return NextResponse.json(genericResponse);
    }

    // 5. Generate cryptographically secure, single-use, expiring reset token
    const { token, expiresAt } = generatePasswordResetToken(user);

    // Dynamic origin resolution
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const appUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

    // 6. Deliver genuine reset email via configured SMTP
    const smtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
    if (smtpConfigured) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Reset your SE Ranking password',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAFA; color: #1E293B; margin: 0; padding: 24px; }
                  .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E2E8F0; padding: 32px; }
                  .logo { margin-bottom: 24px; }
                  .btn { display: inline-block; background-color: #7C3AED; color: #ffffff !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin: 20px 0; }
                  .footer { margin-top: 32px; font-size: 12px; color: #94A3B8; border-top: 1px solid #F1F5F9; padding-top: 16px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h2 style="color: #7C3AED; margin-top: 0;">Password Reset Request</h2>
                  <p>Hello,</p>
                  <p>We received a request to reset your password for your SE Ranking account. Click the button below to set a new password:</p>
                  <div>
                    <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
                  </div>
                  <p style="font-size: 13px; color: #64748B;">This password reset link is valid for 1 hour. If you did not make this request, you can safely ignore this email.</p>
                  <div class="footer">
                    &copy; ${new Date().getFullYear()} SE Ranking. All rights reserved.
                  </div>
                </div>
              </body>
            </html>
          `,
          text: `We received a request to reset your password for SE Ranking.\n\nVisit the link below to set a new password:\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
        });
      } catch (emailErr) {
        console.error('[Auth] Failed to send password reset email via SMTP:', emailErr);
      }
    } else {
      console.warn('[Auth] SMTP is not configured in environment variables. Password reset email could not be sent.');
    }

    return NextResponse.json(genericResponse);
  } catch (err: unknown) {
    console.error('Error in POST /api/auth/forgot-password:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
