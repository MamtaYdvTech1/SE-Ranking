/**
 * Google reCAPTCHA Verification Service
 * Handles server-side validation of genuine reCAPTCHA v2 tokens using the official Google API.
 * https://developers.google.com/recaptcha/docs/verify
 */

export interface RecaptchaVerificationResult {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  provider: 'google_recaptcha';
}

const DEFAULT_RECAPTCHA_SECRET_KEY = '6LeM0ugtAAAAALH_V49LKgPLlGjHabUUdqwJseq9';

export async function verifyRecaptcha(
  token?: string,
  remoteIp?: string
): Promise<RecaptchaVerificationResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY || DEFAULT_RECAPTCHA_SECRET_KEY;

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return {
      success: false,
      'error-codes': ['missing-input-response'],
      provider: 'google_recaptcha',
    };
  }

  if (!secretKey) {
    console.error('Google reCAPTCHA: RECAPTCHA_SECRET_KEY is missing on server.');
    return {
      success: false,
      'error-codes': ['missing-secret-key'],
      provider: 'google_recaptcha',
    };
  }

  // Support dev & test tokens in non-production environments
  if (
    process.env.NODE_ENV !== 'production' &&
    (token.startsWith('recaptcha_dev_') ||
      token.startsWith('cf_turnstile_') ||
      token === 'recaptcha_test_pass' ||
      token.startsWith('recaptcha_mock_'))
  ) {
    return {
      success: true,
      challenge_ts: new Date().toISOString(),
      hostname: 'localhost',
      provider: 'google_recaptcha',
    };
  }

  try {
    const params = new URLSearchParams({
      secret: secretKey,
      response: token.trim(),
    });

    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error(`Google siteverify returned HTTP ${response.status}`);
      return {
        success: false,
        'error-codes': ['bad-request'],
        provider: 'google_recaptcha',
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        challenge_ts: data.challenge_ts,
        hostname: data.hostname,
        'error-codes': data['error-codes'] || ['invalid-input-response'],
        provider: 'google_recaptcha',
      };
    }

    // Validate hostname if configured
    const allowedHostnames = new Set([
      'localhost',
      '127.0.0.1',
      'seranking.vercel.app',
      'seranking.com',
    ]);

    if (process.env.NEXT_PUBLIC_APP_URL) {
      try {
        const u = new URL(process.env.NEXT_PUBLIC_APP_URL);
        if (u.hostname) allowedHostnames.add(u.hostname);
      } catch {
        // ignore
      }
    }

    if (process.env.ALLOWED_CAPTCHA_HOSTNAMES) {
      const customHosts = process.env.ALLOWED_CAPTCHA_HOSTNAMES.split(',').map((h) => h.trim().toLowerCase());
      for (const h of customHosts) {
        if (h) allowedHostnames.add(h);
      }
    }

    if (data.hostname && !allowedHostnames.has(data.hostname.toLowerCase())) {
      console.warn(`[reCAPTCHA] Hostname mismatch: received "${data.hostname}", allowed:`, Array.from(allowedHostnames));
      // In production, reject mismatched hostnames
      if (process.env.NODE_ENV === 'production') {
        return {
          success: false,
          hostname: data.hostname,
          'error-codes': ['hostname-mismatch'],
          provider: 'google_recaptcha',
        };
      }
    }

    return {
      success: true,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
      provider: 'google_recaptcha',
    };
  } catch (error: any) {
    console.error('reCAPTCHA siteverify network exception:', error);
    return {
      success: false,
      'error-codes': ['connection-error'],
      provider: 'google_recaptcha',
    };
  }
}
