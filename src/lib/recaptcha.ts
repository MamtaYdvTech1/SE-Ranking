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

  // In unit test environment only, permit test-harness passing token
  if (process.env.NODE_ENV === 'test' && token === 'recaptcha_test_pass') {
    return {
      success: true,
      challenge_ts: new Date().toISOString(),
      hostname: 'test.local',
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

    // Google verified the human interaction successfully
    return {
      success: true,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname || 'verified',
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
