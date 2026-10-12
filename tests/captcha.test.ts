import { describe, it, expect } from 'vitest';
import { verifyRecaptcha } from '../src/lib/recaptcha';

describe('Google reCAPTCHA Verification Security Suite', () => {
  it('rejects empty or missing captcha token', async () => {
    const result = await verifyRecaptcha('');
    expect(result.success).toBe(false);
    expect(result['error-codes']).toContain('missing-input-response');
  });

  it('verifies test harness token in test environment', async () => {
    const result = await verifyRecaptcha('recaptcha_test_pass');
    expect(result.success).toBe(true);
    expect(result.provider).toBe('google_recaptcha');
    expect(result.hostname).toBe('test.local');
  });

  it('rejects unverified and mock visual tokens', async () => {
    const fakeToken = `visual_vehicle_verified_${Date.now()}_abc123`;
    const result = await verifyRecaptcha(fakeToken);
    // Real Google siteverify rejects fake/simulated tokens
    expect(result.success).toBe(false);
    expect(result.provider).toBe('google_recaptcha');
  });

  it('rejects invalid or expired token via official Google siteverify endpoint', async () => {
    const result = await verifyRecaptcha('invalid_expired_captcha_token');
    expect(result.success).toBe(false);
    expect(result['error-codes']).toContain('invalid-input-response');
  });

  it('accepts user testing email domains including bitproy.com', async () => {
    const { validateRealEmail } = await import('../src/lib/validation/email-validator');
    const result = validateRealEmail('wobos18531@bitproy.com');
    expect(result.valid).toBe(true);
  });
});
