import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createSession, setSessionCookie } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const appUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

  if (error || !code) {
    console.error('Google OAuth callback error:', error || 'No authorization code received');
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error || 'google_auth_failed')}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const redirectUri = !isLocal
    ? `${appUrl}/api/auth/google/callback`
    : (process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/google/callback`);

  const returnTo = searchParams.get('state') || '/projects';
  const redirectTarget = returnTo.startsWith('/') ? returnTo : '/projects';

  try {
    // 1. Exchange authorization code for Google access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Google token exchange failed:', tokenData);
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange_failed`);
    }

    // 2. Fetch user profile from Google
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profile = await userinfoResponse.json();

    if (!userinfoResponse.ok || !profile.email) {
      console.error('Failed to fetch Google user info:', profile);
      return NextResponse.redirect(`${appUrl}/login?error=profile_fetch_failed`);
    }

    const email = profile.email.toLowerCase().trim();
    const name = profile.name || profile.given_name || email.split('@')[0];
    const avatarUrl = profile.picture || null;

    // 3. Upsert user in Prisma database with graceful error handling
    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            avatarUrl,
            role: 'OWNER',
            status: 'active',
            lastLoginAt: new Date(),
          },
        }).catch(async () => {
          return await prisma.user.findUnique({ where: { email } });
        });
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            avatarUrl: avatarUrl || user.avatarUrl,
            name: user.name || name,
          },
        }).catch(() => user);
      }
    } catch (dbErr) {
      console.warn('Database access warning during Google login:', dbErr);
    }

    const resolvedId = user?.id || `usr_google_${Date.now()}`;

    // 4. Create database session or fallback session token
    const { randomBytes } = await import('node:crypto');
    let sessionToken = `ses_g_${Date.now()}_${randomBytes(16).toString('hex')}`;
    let expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    try {
      const sessionResult = await createSession(resolvedId, req);
      sessionToken = sessionResult.sessionToken;
      expiresAt = sessionResult.expiresAt;
    } catch (sessionErr) {
      console.warn('Session write fallback:', sessionErr);
    }

    // 5. Construct HTML response that sets localStorage and cookies before redirecting
    const userJson = JSON.stringify({
      id: resolvedId,
      email: email,
      name: name,
      avatarUrl: avatarUrl || '',
      role: user?.role || 'OWNER',
    });

    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Signing In with Google...</title>
    <style>
      body {
        margin: 0;
        background: #0f172a;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
      }
      .loader {
        text-align: center;
      }
      .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid rgba(255,255,255,0.2);
        border-top-color: #7C3AED;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 16px;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body>
    <div class="loader">
      <div class="spinner"></div>
      <p style="font-size: 14px; font-weight: 500;">Signing into SE Ranking...</p>
    </div>
    <script>
      try {
        localStorage.removeItem('se_ranking_has_project');
        localStorage.removeItem('se_ranking_active_project_id');
        localStorage.removeItem('se_ranking_paused_projects');
        localStorage.removeItem('se_ranking_starred_projects');
        localStorage.removeItem('se_ranking_project_groups');
        localStorage.removeItem('seranking_tour_completed');

        localStorage.setItem('seranking_auth_status', 'logged_in');
        sessionStorage.setItem('seranking_auth_status', 'logged_in');
        localStorage.setItem('auth_token', ${JSON.stringify(sessionToken)});
        localStorage.setItem('user_email', ${JSON.stringify(email)});
        localStorage.setItem('user_name', ${JSON.stringify(name)});
        localStorage.setItem('seranking_user', ${JSON.stringify(userJson)});
        window.dispatchEvent(new CustomEvent('seranking_auth_change'));
      } catch (err) {
        console.error('Storage error:', err);
      }
      window.location.replace(${JSON.stringify(redirectTarget)});
    </script>
  </body>
</html>`;

    const response = new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

    // Attach DB session cookie
    setSessionCookie(response, sessionToken, expiresAt);

    // Attach client-accessible cookies
    response.cookies.set('seranking_auth_status', 'logged_in', {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    response.cookies.set('user_email', encodeURIComponent(email), {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    response.cookies.set('user_name', encodeURIComponent(name), {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    response.cookies.set('se_auth_token', sessionToken, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (err: any) {
    console.error('OAuth callback execution error:', err);
    return NextResponse.redirect(`${appUrl}/login?error=oauth_internal_error`);
  }
}
