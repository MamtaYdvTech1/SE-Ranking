import { describe, it, expect } from 'vitest';
import {
  normalizeDomain,
  LoginSchema,
  SignupSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ProjectSchema,
} from '../src/lib/validation/schemas';
import { hashPassword, verifyPassword } from '../src/lib/server/auth';
import { generatePasswordResetToken } from '../src/lib/server/password-reset';
import { REAL_VEHICLE_IMAGES } from '../src/components/verification/BusBicycleImageSelector';

describe('1. Domain Normalization & Schema Validation', () => {
  it('normalizes various domain formats correctly', () => {
    expect(normalizeDomain('https://workco.com/')).toBe('workco.com');
    expect(normalizeDomain('http://www.google.com/path?query=1')).toBe('google.com');
    expect(normalizeDomain('   stripe.com/   ')).toBe('stripe.com');
  });

  it('validates project schemas with automatic normalization', () => {
    const valid = ProjectSchema.safeParse({
      name: 'WorkCo Digital',
      domain: 'https://workco.com/',
      country: 'India',
      countryCode: 'in',
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.domain).toBe('workco.com');
    }
  });

  it('rejects invalid or malformed domains', () => {
    const invalid = ProjectSchema.safeParse({
      name: 'Invalid Domain Test',
      domain: 'not-a-valid-domain',
      country: 'India',
    });
    expect(invalid.success).toBe(false);
  });
});

describe('2. Authentication Security & Password Hashing', () => {
  it('hashes passwords with salted scrypt securely', () => {
    const password = 'SuperSecurePassword2026#';
    const hash1 = hashPassword(password);
    const hash2 = hashPassword(password);

    // Salting ensures identical passwords have different hashes
    expect(hash1).not.toBe(hash2);
    expect(hash1).toContain(':');
    expect(verifyPassword(password, hash1)).toBe(true);
    expect(verifyPassword(password, hash2)).toBe(true);
    expect(verifyPassword('WrongPassword#', hash1)).toBe(false);
  });

  it('validates login and registration credentials via Zod', () => {
    const validLogin = LoginSchema.safeParse({
      email: 'user@example.com',
      password: 'ValidPassword123#',
    });
    expect(validLogin.success).toBe(true);

    const invalidLogin = LoginSchema.safeParse({
      email: 'invalid-email-format',
      password: '',
    });
    expect(invalidLogin.success).toBe(false);

    const shortPasswordSignup = SignupSchema.safeParse({
      email: 'test@example.com',
      password: 'short', // less than 8 chars
    });
    expect(shortPasswordSignup.success).toBe(false);
  });
});

describe('3. Password Reset Security', () => {
  it('generates expiring tamper-proof reset tokens', () => {
    const dummyUser = {
      id: 'usr_test_123',
      email: 'test@domain.com',
      passwordHash: 'dummy_hash_123',
    };
    const { token, expiresAt } = generatePasswordResetToken(dummyUser);
    expect(token).toBeDefined();
    expect(token.split('.').length).toBe(3);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('validates password reset schema and checks matching passwords', () => {
    const matching = ResetPasswordSchema.safeParse({
      token: 'valid.token.hash',
      password: 'NewStrongPassword123#',
      confirmPassword: 'NewStrongPassword123#',
    });
    expect(matching.success).toBe(true);

    const mismatch = ResetPasswordSchema.safeParse({
      token: 'valid.token.hash',
      password: 'NewStrongPassword123#',
      confirmPassword: 'DifferentPassword123#',
    });
    expect(mismatch.success).toBe(false);
  });
});

describe('4. Visual Object Verification Dataset', () => {
  it('contains verified photographs with 4 buses and 4 bicycles from Unsplash', () => {
    expect(REAL_VEHICLE_IMAGES).toHaveLength(8);

    const buses = REAL_VEHICLE_IMAGES.filter((img) => img.category === 'bus');
    const bikes = REAL_VEHICLE_IMAGES.filter((img) => img.category === 'bicycle');

    expect(buses).toHaveLength(4);
    expect(bikes).toHaveLength(4);

    REAL_VEHICLE_IMAGES.forEach((item) => {
      expect(item.src).toContain('images.unsplash.com');
      expect(item.title).toBeTruthy();
      expect(item.alt).toBeTruthy();
    });
  });
});
