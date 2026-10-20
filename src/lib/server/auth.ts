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
  user: Omit<User, 'passwordHash'>;
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
      const isInvalid =
        new Date() >= cached.session.expiresAt ||
        cached.user.status === 'suspended' ||
        cached.user.status === 'deactivated' ||
        cached.user.status === 'pending' ||
        cached.user.status === 'rejected' ||
        Boolean(cached.user.deletedAt);

      if (!isInvalid) {
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

    if (
      session.user.status === 'suspended' ||
      session.user.status === 'deactivated' ||
      session.user.status === 'pending' ||
      session.user.status === 'rejected' ||
      Boolean(session.user.deletedAt)
    ) {
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

export type AdminAuthResult =
  | { error: string; status: number; auth: null }
  | { error: null; status: 200; auth: { session: Session; user: Omit<User, 'passwordHash'> } };

/**
 * Enforces admin authorization. Returns 401 if unauthenticated, 403 if user lacks admin role.
 * Permitted roles: ADMIN, SUPERADMIN
 */
export async function requireAdminAuth(req: Request | NextRequest): Promise<AdminAuthResult> {
  const auth = await getAuthSession(req);
  if (!auth) {
    return {
      error: 'Unauthorized. Authentication required.',
      status: 401,
      auth: null,
    };
  }

  const role = (auth.user.role || '').toUpperCase();
  if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
    return {
      error: 'Forbidden. Administrative privileges required.',
      status: 403,
      auth: null,
    };
  }

  return {
    error: null,
    status: 200,
    auth,
  };
}

/**
 * Invalidates all active sessions for a user (called upon deactivation, role change, or force logout).
 */
export async function invalidateAllSessionsForUser(userId: string): Promise<number> {
  try {
    // Purge in-memory session cache for any session belonging to this user
    for (const [token, entry] of sessionCache.entries()) {
      if (entry.user.id === userId) {
        sessionCache.delete(token);
      }
    }

    const res = await prisma.session.deleteMany({
      where: { userId },
    });
    return res.count;
  } catch (err) {
    console.error(`Failed to invalidate sessions for user ${userId}:`, err);
    return 0;
  }
}

// In-memory sliding window rate limiter
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * High-performance sliding-window rate limit check.
 * Returns true if permitted, false if rate limit exceeded.
 */
export function checkRateLimit(key: string, maxAttempts = 10, windowMs = 60000): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetInMs: windowMs };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetInMs: Math.max(0, entry.resetAt - now) };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxAttempts - entry.count, resetInMs: Math.max(0, entry.resetAt - now) };
}

/**
 * Enforces critical administrator protection rules:
 * 1. Admin cannot deactivate or demote their own account.
 * 2. Cannot demote or deactivate the last remaining active administrator.
 */
export async function assertAdminCanModifyUser(
  actorUserId: string,
  targetUserId: string,
  options: { newRole?: string; newStatus?: string; isDelete?: boolean }
): Promise<void> {
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true, status: true, email: true },
  });

  if (!targetUser) {
    throw new Error('User not found.');
  }

  const isSelf = actorUserId === targetUserId;

  // 1. Self-protection
  if (isSelf) {
    if (options.newStatus === 'deactivated' || options.newStatus === 'suspended' || options.isDelete) {
      throw new Error('Security policy violation: Administrators cannot deactivate or delete their own account.');
    }
    if (options.newRole && options.newRole.toUpperCase() !== 'ADMIN' && options.newRole.toUpperCase() !== 'SUPERADMIN') {
      throw new Error('Security policy violation: Administrators cannot demote their own account.');
    }
  }

  // 2. Last-admin protection
  const targetIsAdmin = ['ADMIN', 'SUPERADMIN'].includes((targetUser.role || '').toUpperCase());
  const willLoseAdmin =
    options.isDelete ||
    options.newStatus === 'deactivated' ||
    options.newStatus === 'suspended' ||
    (options.newRole && !['ADMIN', 'SUPERADMIN'].includes(options.newRole.toUpperCase()));

  if (targetIsAdmin && willLoseAdmin) {
    const activeAdminsCount = await prisma.user.count({
      where: {
        role: { in: ['ADMIN', 'SUPERADMIN'] },
        status: 'active',
        deletedAt: null,
      },
    });

    if (activeAdminsCount <= 1) {
      throw new Error('Security policy violation: Cannot remove or demote the last remaining active administrator.');
    }
  }
}

/**
 * Server-side guard checking if an authenticated user has authorization for a specific project.
 * Returns 200 with project if authorized, 403 Forbidden if unauthorized.
 */
export async function requireProjectAccess(req: Request | NextRequest, projectId: string) {
  const auth = await getAuthSession(req);
  if (!auth) {
    return { error: 'Unauthorized. Please sign in.', status: 401 as const, user: null, project: null };
  }

  const user = auth.user;
  const role = (user.role || '').toUpperCase();

  const project = await prisma.project.findFirst({
    where: { id: projectId, deletedAt: null },
    include: {
      members: { select: { userId: true, role: true, canEdit: true } },
    },
  });

  if (!project) {
    return { error: 'Project not found.', status: 404 as const, user, project: null };
  }

  // Administrators have global project access
  if (role === 'ADMIN' || role === 'SUPERADMIN') {
    return { error: null, status: 200 as const, user, project };
  }

  // SEO users must be the owner or an assigned member
  const isDirectOwner = project.userId === user.id;
  const isAssignedMember = project.members.some((m) => m.userId === user.id);

  if (!isDirectOwner && !isAssignedMember) {
    return { error: 'Forbidden. You do not have access to this project.', status: 403 as const, user, project: null };
  }

  return { error: null, status: 200 as const, user, project };
}

/**
 * Creates an immutable audit log entry for administrative and security actions.
 */
export async function createAuditLog(params: {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entity: string;
  entityId: string;
  beforeJson?: Record<string, unknown> | null;
  afterJson?: Record<string, unknown> | null;
  req?: Request | NextRequest;
}) {
  try {
    let ipAddress = '127.0.0.1';
    let userAgent = 'Unknown';

    if (params.req) {
      userAgent = params.req.headers.get('user-agent') || 'Unknown';
      ipAddress =
        params.req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        params.req.headers.get('x-real-ip') ||
        '127.0.0.1';
    }

    return await prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        actorEmail: params.actorEmail || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        beforeJson: params.beforeJson ? JSON.stringify(params.beforeJson) : null,
        afterJson: params.afterJson ? JSON.stringify(params.afterJson) : null,
        ipAddress: ipAddress.slice(0, 45),
        userAgent: userAgent.slice(0, 255),
      },
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
    return null;
  }
}

export { sanitizeCsvValue } from '@/lib/csvUtils';

/**
 * Enforces per-user SEO tool permission & quota check.
 * Checks:
 * 1. Valid authenticated session
 * 2. User account is active/approved (not pending, rejected, suspended, or deactivated)
 * 3. Specific tool is enabled in user's permissions
 * 4. User has not exceeded their monthly usage limit (if checkQuota is true)
 */
export async function requireToolAccess(
  req: Request | NextRequest,
  toolKey: 'audits' | 'rankings' | 'keywords' | 'backlinks' | 'ai_visibility' | 'competitor_research' | 'reports',
  options?: { checkQuota?: boolean; quotaAmount?: number }
) {
  const auth = await getAuthSession(req);
  if (!auth) {
    return { error: 'Unauthorized. Please sign in.', status: 401 as const, user: null };
  }

  const user = auth.user;
  const status = (user.status || '').toLowerCase();
  if (status !== 'active' && status !== 'approved') {
    return {
      error: `Account ${status}: Your account is pending admin approval or suspended. Access denied.`,
      status: 403 as const,
      user,
    };
  }

  // Import permission engine dynamically
  const { resolveUserToolPermissions, checkAndIncrementQuota } = await import('./permissions');
  const perms = resolveUserToolPermissions(user);

  if (!perms[toolKey]) {
    return {
      error: `Permission Denied: Access to '${toolKey}' is not enabled for your account. Please contact an administrator.`,
      status: 403 as const,
      user,
    };
  }

  if (options?.checkQuota) {
    let metric: 'keywords' | 'auditPages' | 'backlinks' | 'ai' = 'keywords';
    if (toolKey === 'audits') metric = 'auditPages';
    else if (toolKey === 'backlinks') metric = 'backlinks';
    else if (toolKey === 'ai_visibility') metric = 'ai';

    const quotaResult = await checkAndIncrementQuota(user.id, metric, options.quotaAmount || 1);
    if (!quotaResult.allowed) {
      return {
        error: quotaResult.error || 'Monthly usage quota exceeded. Upgrade your plan to continue.',
        status: 402 as const,
        user,
      };
    }
  }

  return { error: null, status: 200 as const, user };
}

/**
 * Sanitizes cell values to prevent CSV formula injection (CSV Injection / CWE-1236).
 * Escapes leading characters like =, +, -, @, \t, \r by prefixing with a single quote.
 */
export function sanitizeForCsv(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

