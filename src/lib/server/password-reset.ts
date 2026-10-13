import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';

const RESET_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'se-ranking-reset-secret-key-2026';
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export interface GeneratedResetToken {
  token: string;
  expiresAt: Date;
}

/**
 * Generate a cryptographically secure, tamper-proof, expiring password reset token.
 * Incorporates the user's current password hash into the HMAC so that if the password
 * is changed, any existing reset tokens are immediately and automatically invalidated.
 */
export function generatePasswordResetToken(user: { id: string; email: string; passwordHash?: string | null }): GeneratedResetToken {
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);
  const payload = `${user.id}:${user.email}:${expiresAt.getTime()}:${user.passwordHash || 'no-hash'}`;
  
  const signature = crypto
    .createHmac('sha256', RESET_SECRET)
    .update(payload)
    .digest('hex');

  // Format: userId.expiresTimestamp.signature
  const token = `${user.id}.${expiresAt.getTime()}.${signature}`;

  return { token, expiresAt };
}

/**
 * Verify a password reset token.
 * Checks expiration and HMAC signature against current user database state.
 */
export async function verifyPasswordResetToken(token: string): Promise<{ valid: boolean; userId?: string; email?: string; error?: string }> {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Invalid token format.' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Malformed reset token.' };
  }

  const [userId, expiresTimestampStr, providedSignature] = parts;
  const expiresTimestamp = parseInt(expiresTimestampStr, 10);

  if (isNaN(expiresTimestamp) || Date.now() > expiresTimestamp) {
    return { valid: false, error: 'Password reset link has expired. Please request a new one.' };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, passwordHash: true },
  });

  if (!user) {
    return { valid: false, error: 'User associated with this reset link was not found.' };
  }

  const payload = `${user.id}:${user.email}:${expiresTimestamp}:${user.passwordHash || 'no-hash'}`;
  const expectedSignature = crypto
    .createHmac('sha256', RESET_SECRET)
    .update(payload)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  const provBuf = Buffer.from(providedSignature, 'utf-8');
  const expBuf = Buffer.from(expectedSignature, 'utf-8');

  if (provBuf.length !== expBuf.length || !crypto.timingSafeEqual(provBuf, expBuf)) {
    return { valid: false, error: 'Invalid or already-used reset token.' };
  }

  return { valid: true, userId: user.id, email: user.email };
}
