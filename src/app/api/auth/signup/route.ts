import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { SignupSchema } from '@/lib/validation/schemas';
import { validateRealEmail } from '@/lib/validation/email-validator';
import { hashPassword, sanitizeUser, createSession, setSessionCookie } from '@/lib/server/auth';
import { checkAuthRateLimit } from '@/lib/server/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // 1. IP Rate Limiting (Abuse prevention)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const rateLimit = checkAuthRateLimit('signup', ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.resetSeconds) },
        }
      );
    }

    // 2. Password Confirmation Validation
    if (body.confirmPassword !== undefined && body.password !== body.confirmPassword) {
      return NextResponse.json(
        { error: 'Password and confirm password do not match.' },
        { status: 400 }
      );
    }

    // 3. Schema Validation
    const result = SignupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid registration details.' },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    // 4. Resolve Full Name
    const rawName = (body.name || `${firstName || ''} ${lastName || ''}`).trim();
    const fullName = rawName || cleanEmail.split('@')[0];

    // 5. Work Email Validation
    // Accepts genuine emails from personal providers (Gmail, Outlook, Yahoo, etc.) and company domains.
    // Rejects disposable / temporary mail services.
    const emailCheck = validateRealEmail(cleanEmail, {
      allowExampleDomains: process.env.NODE_ENV === 'test',
    });
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.error || 'Please enter a valid personal or business email address.' },
        { status: 400 }
      );
    }

    // 6. Duplicate Account Handling
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // 7. Secure Password Hashing using Argon2id
    const passwordHash = hashPassword(password);

    // 8. Create User in Production Database
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

    // 9. Create Real Database Session and Attach Secure HTTP-only Cookie
    const { sessionToken, expiresAt } = await createSession(user.id, req);

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! Welcome to SE Ranking.',
      user: safeUser,
      token: sessionToken,
      redirectTo: '/projects',
    });

    return await setSessionCookie(response, sessionToken, expiresAt);
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'Registration failed. Please try again.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
