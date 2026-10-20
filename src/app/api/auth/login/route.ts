import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { LoginSchema } from '@/lib/validation/schemas';
import { validateRealEmail } from '@/lib/validation/email-validator';
import {
  verifyPassword,
  createSession,
  setSessionCookie,
  sanitizeUser,
} from '@/lib/server/auth';
import { checkAuthRateLimit } from '@/lib/server/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // 1. IP & Identifier Rate Limiting (Brute-force protection)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const rateLimit = checkAuthRateLimit('login', ip, typeof body?.email === 'string' ? body.email : undefined);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait a few minutes before trying again.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.resetSeconds) },
        }
      );
    }

    // 2. Schema Validation
    const result = LoginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Email and password are required.' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    // 3. Email Format Validation
    const emailCheck = validateRealEmail(cleanEmail, {
      allowExampleDomains: process.env.NODE_ENV === 'test',
    });
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.error || 'Please enter a valid personal or business email address.' },
        { status: 400 }
      );
    }

    // 4. User Lookup in Production Database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        projects: {
          where: { isArchived: false, deletedAt: null },
          take: 1,
        },
      },
    });

    // 5. Generic Error for nonexistent user or invalid password (prevents account enumeration)
    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 6. Check Account Approval & Status Safeguards
    if (user.status === 'pending') {
      return NextResponse.json(
        {
          error: 'Your account is pending review and manual approval by an administrator.',
          status: 'pending',
          requiresApproval: true,
        },
        { status: 403 }
      );
    }

    if (user.status === 'rejected') {
      return NextResponse.json(
        {
          error: user.rejectionReason
            ? `Your registration was rejected by the administrator: ${user.rejectionReason}`
            : 'Your account registration was rejected by the administrator.',
          status: 'rejected',
        },
        { status: 403 }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        {
          error: user.suspendedReason
            ? `Account suspended: ${user.suspendedReason}`
            : 'This account has been suspended by the administrator. Please contact support.',
          status: 'suspended',
        },
        { status: 403 }
      );
    }

    if (user.status === 'deactivated') {
      return NextResponse.json(
        { error: 'This account has been deactivated.', status: 'deactivated' },
        { status: 403 }
      );
    }

    // 7. Update lastLoginAt timestamp
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    } catch {
      // Non-fatal if timestamp update fails
    }

    // 8. Create cryptographically secure database session
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
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
