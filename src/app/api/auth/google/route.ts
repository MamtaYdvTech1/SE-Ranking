import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createSession, setSessionCookie, sanitizeUser } from '@/lib/server/auth';
import { validateRealEmail } from '@/lib/validation/email-validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { credential } = body;

    let userEmail = '';
    let userName = 'Google User';
    let sub = `gid_${Date.now()}`;
    let picture: string | null = null;

    if (process.env.NODE_ENV === 'test' && body.email) {
      userEmail = String(body.email).toLowerCase().trim();
      userName = body.name || userEmail.split('@')[0];
      sub = body.googleId || `gid_test_${Date.now()}`;
      picture = body.picture || null;
    } else {
      // Reject requests without authentic Google ID token
      if (!credential || typeof credential !== 'string') {
        return NextResponse.json(
          { error: 'Valid Google ID token (credential) is required.' },
          { status: 400 }
        );
      }

      // Verify ID token with official Google tokeninfo endpoint
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );

      if (!verifyRes.ok) {
        return NextResponse.json(
          { error: 'Google authentication credential could not be verified.' },
          { status: 401 }
        );
      }

      const payload = await verifyRes.json();
      userEmail = (payload.email || '').toLowerCase().trim();
      userName = payload.name || payload.given_name || userEmail.split('@')[0];
      sub = payload.sub || `gid_${Date.now()}`;
      picture = payload.picture || null;
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'No verified email returned from Google.' },
        { status: 400 }
      );
    }

    const emailCheck = validateRealEmail(userEmail);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.error || 'Invalid email address provided by Google account.' },
        { status: 400 }
      );
    }

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
          avatarUrl: picture,
          googleSubjectId: sub,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleSubjectId: sub,
          avatarUrl: picture || user.avatarUrl,
          emailVerified: true,
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
    const msg = err instanceof Error ? err.message : 'Google authentication failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const isConfigured = Boolean(clientId && !clientId.includes('your-google-client-id') && clientId.length > 10);

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
    return NextResponse.redirect(`${dynamicOrigin}/login?error=google_not_configured`);
  }

  return NextResponse.redirect(authUrl);
}
