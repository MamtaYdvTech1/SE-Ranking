import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/server/session-token';

// Public landing & informational pages that do NOT require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/register',
  '/forgot',
  '/terms',
  '/privacy',
  '/landing',
  '/forgot',
  '/forgot-password',
  '/reset-password',
  '/verification-challenge',
  '/for-agencies',
  '/agencies',
  '/enterprise',
  '/growing-business',
  '/small-business',
  '/keyword-rank-tracker',
  '/rank-tracker',
  '/keyword-tool',
  '/on-page-seo-checker',
  '/website-audit-tool',
  '/competitor-analysis-tool',
  '/competitor-analysis',
  '/backlink-checker',
  '/backlinks-checker',
  '/pricing',
  '/podcast',
  '/academy',
  '/help',
  '/whats-new',
  '/logout',
  '/security-check',
  '/cdn-cgi',
  '/api-docs',
];

// Public API endpoints that do not require an active session
const PUBLIC_API_PREFIXES = [
  '/api/auth/me',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/google',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow Next.js internals, static assets, and images
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/favicon.svg') ||
    pathname.startsWith('/icon.svg') ||
    pathname.startsWith('/flags') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Allow public auth APIs
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isPublicApi) {
    return NextResponse.next();
  }

  // 3. Authenticate session token cryptographically
  // We strictly check the HMAC-signed session cookie or Authorization header.
  // We NEVER trust client-side localStorage flags or unverified cookie names.
  const sessionCookie =
    request.cookies.get('seranking_session')?.value ||
    request.cookies.get('auth_token')?.value;

  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

  const candidateToken = sessionCookie || bearerToken;

  // Verify HMAC signature
  const verifiedRawToken = await verifySessionToken(candidateToken);
  const isAuthenticated = Boolean(verifiedRawToken);

  // 4. If authenticated and directly visiting /login, direct them to dashboard
  // /signup and /register are always accessible so users can register new accounts anytime
  const isLoginRoute = pathname === '/login';
  const hasRedirectParam = request.nextUrl.searchParams.has('redirect');
  if (isAuthenticated && isLoginRoute && !hasRedirectParam) {
    return NextResponse.redirect(new URL('/projects', request.url));
  }

  // 5. Check if accessing a public marketing/content page
  const isPublicPage = PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== '/' && pathname.startsWith(p))
  );

  if (isPublicPage) {
    return NextResponse.next();
  }

  // 6. If unauthenticated and accessing a protected API route, return 401 JSON
  if (pathname.startsWith('/api')) {
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Please sign in.',
          },
        },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 7. If unauthenticated and attempting to access any protected frontend route:
  // Strictly redirect to login page with preserved destination (redirect parameter)
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    const destination = pathname + (request.nextUrl.search || '');
    loginUrl.searchParams.set('redirect', destination);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Support both naming conventions for maximum compatibility
export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|flags).*)',
  ],
};
