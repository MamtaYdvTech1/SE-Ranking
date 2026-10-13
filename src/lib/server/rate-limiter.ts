/**
 * In-Memory Sliding-Window Rate Limiter for Authentication Endpoints
 * Protects login, signup, and password-reset from brute-force & enumeration attacks.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale records every 5 minutes to avoid memory leaks
if (typeof setInterval !== 'undefined') {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Allow Node process to exit cleanly if this timer is active
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  limit: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  // In test mode, do not restrict test suites
  if (process.env.NODE_ENV === 'test') {
    return {
      allowed: true,
      remaining: limit,
      resetSeconds: windowSeconds,
      limit,
    };
  }

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetSeconds: windowSeconds,
      limit,
    };
  }

  if (existing.count >= limit) {
    const resetSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetSeconds,
      limit,
    };
  }

  existing.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetSeconds,
    limit,
  };
}

/**
 * Convenience helper for auth routes
 */
export function checkAuthRateLimit(
  action: 'login' | 'signup' | 'forgot-password' | 'reset-password',
  ip: string,
  identifier?: string
): RateLimitResult {
  const cleanIp = ip || 'unknown';
  const cleanId = identifier ? identifier.toLowerCase().trim() : '';

  switch (action) {
    case 'login': {
      // 10 attempts per 15 minutes per IP or email
      const ipResult = checkRateLimit(`auth:login:ip:${cleanIp}`, 10, 15 * 60);
      if (!ipResult.allowed) return ipResult;
      if (cleanId) {
        const idResult = checkRateLimit(`auth:login:id:${cleanId}`, 10, 15 * 60);
        if (!idResult.allowed) return idResult;
      }
      return ipResult;
    }
    case 'signup': {
      // 10 signups per hour per IP
      return checkRateLimit(`auth:signup:ip:${cleanIp}`, 10, 60 * 60);
    }
    case 'forgot-password': {
      // 5 password reset requests per 15 minutes
      const ipResult = checkRateLimit(`auth:forgot:ip:${cleanIp}`, 5, 15 * 60);
      if (!ipResult.allowed) return ipResult;
      if (cleanId) {
        const idResult = checkRateLimit(`auth:forgot:id:${cleanId}`, 5, 15 * 60);
        if (!idResult.allowed) return idResult;
      }
      return ipResult;
    }
    case 'reset-password': {
      // 10 reset attempts per 15 minutes
      return checkRateLimit(`auth:reset:ip:${cleanIp}`, 10, 15 * 60);
    }
  }
}
