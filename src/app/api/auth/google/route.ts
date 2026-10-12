import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createSession, setSessionCookie, sanitizeUser } from '@/lib/server/auth';

import { validateRealEmail } from '@/lib/validation/email-validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { credential, email, name, picture, googleId } = body;

    const userEmail = (email || '').toLowerCase().trim();
    if (!userEmail) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const emailCheck = validateRealEmail(userEmail);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.error || 'Please enter a valid Google email address.' },
        { status: 400 }
      );
    }

    const userName = name || userEmail.split('@')[0] || 'Google User';
    const sub = googleId || `gid_${Date.now()}`;

    // Look up or create user in Prisma DB
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    }).catch(() => null);

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: userName,
          role: 'OWNER',
          status: 'active',
          avatarUrl: picture || null,
          googleSubjectId: sub,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleSubjectId: sub,
          avatarUrl: picture || user.avatarUrl,
          lastLoginAt: new Date(),
        },
      });
    }

    const safeUser = sanitizeUser(user);
    const { sessionToken, expiresAt } = await createSession(user.id, req);

    const res = NextResponse.json({
      success: true,
      user: safeUser,
      token: sessionToken,
    });

    return setSessionCookie(res, sessionToken, expiresAt);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Google OAuth authentication failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const isConfigured = Boolean(clientId && !clientId.includes('your-google-client-id') && clientId.length > 10);
  
  // Resolve base URL dynamically from request or env (supports localhost and https://seranking.vercel.app)
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const dynamicOrigin = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
    `${dynamicOrigin}/api/auth/google/callback`;

  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state') || '/projects';
  const customScope = searchParams.get('scope');

  // Standard Google login scopes: openid, email, profile
  const scope = customScope === 'gmb'
    ? 'openid%20email%20profile%20https://www.googleapis.com/auth/business.manage'
    : 'openid%20email%20profile';

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`;

  if (searchParams.get('format') === 'json') {
    return NextResponse.json({
      success: true,
      configured: isConfigured,
      authUrl: isConfigured ? authUrl : null,
      redirectUri,
    });
  }

  if (!isConfigured) {
    return NextResponse.redirect(`${dynamicOrigin}/login?google=direct`);
  }

  return NextResponse.redirect(authUrl);
}

