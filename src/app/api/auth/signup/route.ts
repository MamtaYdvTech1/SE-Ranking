import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { SignupSchema } from '@/lib/validation/schemas';
import { validateRealEmail } from '@/lib/validation/email-validator';
import { hashPassword, sanitizeUser, createSession, setSessionCookie } from '@/lib/server/auth';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { verifyTurnstileToken } from '@/lib/cloudflare/turnstile';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify security token (Cloudflare Turnstile or Google reCAPTCHA)
    const captchaToken = body.captchaToken;
    if (!captchaToken && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        { error: 'Security verification is required. Please complete the captcha.' },
        { status: 400 }
      );
    }

    if (captchaToken) {
      const isTurnstile =
        body.captchaProvider === 'cloudflare_turnstile' ||
        body.captchaProvider === 'turnstile' ||
        captchaToken.startsWith('cf_') ||
        captchaToken.startsWith('XXXX.') ||
        captchaToken.includes('turnstile');

      let captchaResult: { success: boolean; [key: string]: any };

      if (isTurnstile) {
        captchaResult = await verifyTurnstileToken(captchaToken);
      } else {
        captchaResult = await verifyRecaptcha(captchaToken);
      }

      if (!captchaResult.success) {
        return NextResponse.json(
          { error: 'Security verification failed. Please complete the captcha again.' },
          { status: 400 }
        );
      }
    }

    // Check confirmPassword match if supplied
    if (body.confirmPassword !== undefined && body.password !== body.confirmPassword) {
      return NextResponse.json(
        { error: 'Password and confirm password do not match.' },
        { status: 400 }
      );
    }

    const result = SignupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid registration details.' },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    // Full name
    const rawName = (body.name || `${firstName || ''} ${lastName || ''}`).trim();
    const fullName = rawName || cleanEmail.split('@')[0];

    const emailCheck = validateRealEmail(cleanEmail, {
      allowExampleDomains: process.env.NODE_ENV === 'test',
    });
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.error || 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Prevent duplicate account registration
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // Securely hash password on the server
    const passwordHash = hashPassword(password);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: fullName,
        firstName: firstName || fullName.split(' ')[0] || '',
        lastName: lastName || fullName.split(' ').slice(1).join(' ') || '',
        passwordHash,
        role: 'OWNER',
        status: 'active',
      },
    });

    const safeUser = sanitizeUser(user);

    // Create a real database session and attach secure cookie
    const { sessionToken, expiresAt } = await createSession(user.id, req);

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! Welcome to SE Ranking.',
      user: safeUser,
      token: sessionToken,
      redirectTo: '/projects',
    });

    return await setSessionCookie(response, sessionToken, expiresAt);
  } catch (error: any) {
    console.error('Registration error:', error);
    const message = error?.message || 'Registration failed. Please try again.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
