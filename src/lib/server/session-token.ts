/**
 * Cryptographically secure session token signing and verification using HMAC-SHA256.
 * Zero external dependencies: uses standard Web Crypto API supported in Node.js,
 * Next.js Edge, Next.js Node, and browsers.
 */

/**
 * Signing secret, read at call time. There is deliberately no production fallback: without
 * JWT_SECRET, signing throws and verification rejects every token (fail closed).
 * Vitest runs with NODE_ENV=test and gets a fixed test-only secret.
 */
function resolveSecret(): string | null {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim()) return secret;
  if (process.env.NODE_ENV === 'test') return 'test-only-session-secret';
  return null;
}

/**
 * Signs a raw session token using HMAC-SHA256.
 * Returns `${token}.${signatureHex}`
 */
export async function signSessionToken(token: string, secret = resolveSecret()): Promise<string> {
  if (!token) return '';
  if (!secret) {
    throw new Error('JWT_SECRET is not configured; refusing to sign session tokens.');
  }
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(token));
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${token}.${sigHex}`;
}

/**
 * Verifies a signed session token.
 * Returns the raw token if the signature is valid, or null if invalid or unsigned.
 */
export async function verifySessionToken(
  signedOrRawToken: string | undefined | null,
  secret = resolveSecret()
): Promise<string | null> {
  if (!secret) return null;
  if (!signedOrRawToken || typeof signedOrRawToken !== 'string') return null;
  const trimmed = signedOrRawToken.trim();
  if (!trimmed.includes('.')) {
    return null;
  }
  const parts = trimmed.split('.');
  if (parts.length !== 2) return null;
  const [token, sigHex] = parts;
  if (!token || !sigHex) return null;

  const expectedSigned = await signSessionToken(token, secret);
  const [, expectedSigHex] = expectedSigned.split('.');
  if (!expectedSigHex || sigHex.length !== expectedSigHex.length) return null;

  // Constant-time string comparison to prevent timing attacks
  let match = true;
  for (let i = 0; i < sigHex.length; i++) {
    if (sigHex[i] !== expectedSigHex[i]) {
      match = false;
    }
  }

  return match ? token : null;
}
