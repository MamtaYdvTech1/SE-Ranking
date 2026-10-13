import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { hashSync, verifySync } from '@node-rs/argon2';
import { NextRequest, NextResponse } from 'next/server';
import type { Session, User } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { signSessionToken, verifySessionToken } from './session-token';

export const SESSION_COOKIE_NAME = 'seranking_session';
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

/**
 * Hashes a plaintext password using Argon2id.
 * Format stored: "$argon2id$v=19$m=19456,t=2,p=1$..."
 */
export function hashPassword(password: string): string {
  return hashSync(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

/**
 * Securely verifies a plaintext password against a stored Argon2id or legacy salt:hash string.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!storedHash || !password) return false;

    // 1. Argon2id verification
    if (storedHash.startsWith('$argon2')) {
      return verifySync(storedHash, password);
    }

    // 2. Backward compatibility for legacy salt:hash (scrypt) passwords
    const parts = storedHash.split(':');
    if (parts.length === 2) {
      const [salt, key] = parts;
      const keyBuffer = Buffer.from(key, 'hex');
      const derivedKey = scryptSync(password, salt, 64);
      if (keyBuffer.length !== derivedKey.length) return false;
      return timingSafeEqual(keyBuffer, derivedKey);
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Sanitizes a User record by removing passwordHash.
 */
export function sanitizeUser<T extends { passwordHash?: string | null }>(user: T): Omit<T, 'passwordHash'> {
  const safe = { ...user };
  delete (safe as { passwordHash?: string | null }).passwordHash;
  return safe;
}

/**
 * Creates a new database session for a user.
 */
export async function createSession(
  userId: string,
  req?: Request | NextRequest
): Promise<{ sessionToken: string; expiresAt: Date; session: Session }> {
  const sessionToken = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  let userAgent = 'Unknown';
  let ipAddress = '127.0.0.1';

  if (req) {
    userAgent = req.headers.get('user-agent') || 'Unknown';
    ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
  }

  const session = await prisma.session.create({
    data: {
      userId,
      sessionToken,
      expiresAt,
      userAgent: userAgent.slice(0, 255),
      ipAddress: ipAddress.slice(0, 45),
    },
  });

  return { sessionToken, expiresAt, session };
}

// In-memory cache for validated sessions to prevent redundant database hits across concurrent requests
interface CachedSessionEntry {
  session: Session;
  user: User;
  cachedAt: number;
}
const sessionCache = new Map<string, CachedSessionEntry>();
const SESSION_CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Validates a session token strictly against the database.
 * Supports both HMAC-signed cookie tokens ("token.sig") and raw database tokens.
 * Uses high-speed in-memory cache for validated sessions to eliminate DB roundtrip latency.
 * Returns the user (sanitized) and session if valid, active, and not expired.
 * Never trusts client state or returns mock sessions.
 */
export async function validateSession(sessionToken?: string | null) {
  try {
    if (!sessionToken || typeof sessionToken !== 'string') {
      return null;
    }

    const trimmed = sessionToken.trim();
    if (!trimmed) return null;

    let lookupToken = trimmed;

    // If the token is signed with a dot signature, verify its HMAC signature first
    if (trimmed.includes('.')) {
      const verified = await verifySessionToken(trimmed);
      if (!verified) {
        return null;
      }
      lookupToken = verified;
    }

    // Check fast-path in-memory cache
    const cached = sessionCache.get(lookupToken);
    if (cached && Date.now() - cached.cachedAt < SESSION_CACHE_TTL_MS) {
      if (new Date() < cached.session.expiresAt && cached.user.status !== 'suspended') {
        return {
          session: cached.session,
          user: cached.user,
        };
      } else {
        sessionCache.delete(lookupToken);
      }
    }

    // Look up real session and user with project count in a single efficient DB query
    const session = await prisma.session.findUnique({
      where: { sessionToken: lookupToken },
      include: {
        user: {
          include: {
            _count: {
              select: {
                projects: {
                  where: { isArchived: false, deletedAt: null },
                },
              },
            },
          },
        },
      },
    });

    if (!session || !session.user) {
      sessionCache.delete(lookupToken);
      return null;
    }

    // Check expiration and account status
    if (new Date() > session.expiresAt) {
      sessionCache.delete(lookupToken);
      try {
        await prisma.session.delete({ where: { id: session.id } });
      } catch {
        // ignore
      }
      return null;
    }

    if (session.user.status === 'suspended') {
      sessionCache.delete(lookupToken);
      return null;
    }

    const safeUser = sanitizeUser(session.user);
    const result = {
      session,
      user: safeUser,
    };

    // Cache valid session
    sessionCache.set(lookupToken, {
      session,
      user: safeUser,
      cachedAt: Date.now(),
    });

    return result;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Extracts and validates auth from an incoming request.
 * Checks Cookie 'seranking_session' or Authorization header 'Bearer <token>'.
 */
export async function getAuthSession(req: Request | NextRequest) {
  let token: string | undefined;

  // 1. Check cookies
  if ('cookies' in req && typeof (req as unknown as { cookies?: { get?: (n: string) => { value?: string } | undefined } }).cookies?.get === 'function') {
    token = (req as NextRequest).cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  // 2. Check Authorization header
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  return validateSession(token);
}

/**
 * Extracts and validates session directly from Next.js server cookie store (next/headers).
 */
export async function getSessionFromCookie() {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return validateSession(token);
  } catch {
    return null;
  }
}

/**
 * Enforces authentication. Throws 401 Unauthorized if unauthenticated.
 */
export async function requireAuth(req: Request | NextRequest) {
  const auth = await getAuthSession(req);
  if (!auth) {
    throw new Error('Unauthorized');
  }
  return auth;
}

/**
 * Invalidates (deletes) a specific session token from the database.
 */
export async function invalidateSession(sessionToken?: string | null): Promise<boolean> {
  if (!sessionToken) return false;
  try {
    let lookupToken = sessionToken.trim();
    if (lookupToken.includes('.')) {
      lookupToken = lookupToken.split('.')[0];
    }
    sessionCache.delete(lookupToken);
    await prisma.session.deleteMany({
      where: { sessionToken: lookupToken },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Invalidates all sessions for a user EXCEPT the current session token.
 */
export async function invalidateAllOtherSessions(
  userId: string,
  currentSessionToken: string
): Promise<number> {
  try {
    let lookupToken = currentSessionToken.trim();
    if (lookupToken.includes('.')) {
      lookupToken = lookupToken.split('.')[0];
    }
    const res = await prisma.session.deleteMany({
      where: {
        userId,
        sessionToken: { not: lookupToken },
      },
    });
    return res.count;
  } catch {
    return 0;
  }
}

/**
 * Attaches the cryptographically signed, secure session cookie to a NextResponse.
 */
export async function setSessionCookie(
  response: NextResponse,
  sessionToken: string,
  expiresAt: Date
): Promise<NextResponse> {
  const signedToken = await signSessionToken(sessionToken);
  response.cookies.set(SESSION_COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  // Auxiliary cookie for UI sync (does NOT grant access on server)
  response.cookies.set('seranking_auth_status', 'logged_in', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return response;
}

/**
 * Clears the session cookie and all auxiliary authentication cookies on a NextResponse.
 */
export function clearSessionCookie(response: NextResponse): NextResponse {
  const cookiesToClear = [
    SESSION_COOKIE_NAME,
    'seranking_auth_status',
    'user_email',
    'user_name',
    'user_domain',
    'seranking_user',
    'se_auth_token',
    'auth_token',
    'token',
    'session_token',
  ];

  for (const name of cookiesToClear) {
    response.cookies.set(name, '', {
      httpOnly: name === SESSION_COOKIE_NAME,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });
  }

  return response;
}
