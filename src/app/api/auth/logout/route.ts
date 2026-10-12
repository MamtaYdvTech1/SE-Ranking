import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, invalidateSession, clearSessionCookie } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      await invalidateSession(sessionToken).catch(() => null);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully.',
    });

    return clearSessionCookie(response);
  } catch (error: any) {
    console.error('Logout error:', error);
    const response = NextResponse.json({
      success: true,
      message: 'Signed out.',
    });
    return clearSessionCookie(response);
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (sessionToken) {
      await invalidateSession(sessionToken).catch(() => null);
    }
  } catch (error: any) {
    console.error('Logout GET error:', error);
  }

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const appUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

  const response = NextResponse.redirect(new URL('/', appUrl));
  return clearSessionCookie(response);
}

