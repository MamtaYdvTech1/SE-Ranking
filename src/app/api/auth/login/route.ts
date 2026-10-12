import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { LoginSchema } from '@/lib/validation/schemas';
import { validateRealEmail } from '@/lib/validation/email-validator';
import {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  sanitizeUser,
} from '@/lib/server/auth';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { verifyTurnstileToken } from '@/lib/cloudflare';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Email and password are required.' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    const emailCheck = validateRealEmail(cleanEmail, {
      allowExampleDomains: process.env.NODE_ENV === 'test',
    });
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.error || 'Please enter a valid personal or business email address.' },
        { status: 400 }
      );
    }

    // Strictly verify Google reCAPTCHA token
    const captchaToken = body.captchaToken;
    if (!captchaToken && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        { error: 'Google reCAPTCHA verification is required. Please complete the captcha.' },
        { status: 400 }
      );
    }

    if (captchaToken) {
      const captchaResult = await verifyRecaptcha(captchaToken);
      if (!captchaResult.success) {
        const errorMsg = captchaResult['error-codes']?.includes('connection-error')
          ? 'Google reCAPTCHA verification timed out. Please check your internet connection and try again.'
          : 'Google reCAPTCHA verification failed. Please complete the captcha again.';
        return NextResponse.json(
          { error: errorMsg },
          { status: 400 }
        );
      }
    }

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        projects: {
          where: { isArchived: false, deletedAt: null },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Verify password against stored password hash
    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status === 'suspended') {
      return NextResponse.json(
        { error: 'This account has been suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // Update lastLoginAt
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    } catch {
      // Ignore if DB update fails
    }

    // Create a real database session
    const { sessionToken, expiresAt } = await createSession(user.id, req);

    const safeUser = sanitizeUser(user);
    const activeProject = user.projects?.[0] || null;

    const response = NextResponse.json({
      success: true,
      message: 'Signed in successfully!',
      user: safeUser,
      project: activeProject ? { id: activeProject.id, name: activeProject.name, domain: activeProject.domain } : null,
      token: sessionToken,
    });

    return await setSessionCookie(response, sessionToken, expiresAt);
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
