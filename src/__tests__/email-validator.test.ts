import { describe, it, expect } from 'vitest';
import { validateRealEmail } from '@/lib/validation/email-validator';

describe('validateRealEmail', () => {
  it('accepts legitimate email addresses', () => {
    const validEmails = [
      'user@gmail.com',
      'john.doe@amazon.in',
      'developer@workcomposer.com',
      'support@yahoo.co.in',
      'alex@outlook.com',
      'info@mycompany.org',
    ];

    for (const email of validEmails) {
      const res = validateRealEmail(email);
      expect(res.valid).toBe(true);
      expect(res.cleanEmail).toBe(email.toLowerCase());
      expect(res.error).toBeUndefined();
    }
  });

  it('rejects temporary and disposable email addresses (temp mail)', () => {
    const tempEmails = [
      'throwaway@tempmail.com',
      'test@temp-mail.org',
      'quick@10minutemail.com',
      'junk@10minuteemail.com',
      'spambox@mailinator.com',
      'inbox@mailinator2.com',
      'burner@guerrillamail.com',
      'ninja@sharklasers.com',
      'disposable@yopmail.com',
      'fake@yopmail.net',
      'rubbish@trashmail.com',
      'temp@trashmail.net',
      'dispost@dispostable.com',
      'throw@throwawaymail.com',
      'nada@getnada.com',
      'kitten@inboxkitten.com',
      'burner@burnermail.io',
      'anon@fakeinbox.com',
      'fast@minuteinbox.com',
      'drop@dropmail.me',
      'temp@tempmailo.com',
    ];

    for (const email of tempEmails) {
      const res = validateRealEmail(email);
      expect(res.valid).toBe(false);
      expect(res.isDisposable).toBe(true);
      expect(res.error).toContain('Temporary and disposable email addresses');
    }
  });

  it('rejects fake, dummy, and example domains', () => {
    const fakeEmails = [
      'test@example.com',
      'admin@test.com',
      'user@fake.com',
      'none@dummy.com',
      'user@invalid.com',
    ];

    for (const email of fakeEmails) {
      const res = validateRealEmail(email);
      expect(res.valid).toBe(false);
      expect(res.error).toBeDefined();
    }
  });

  it('rejects malformed email formats', () => {
    const malformed = [
      '',
      'notanemail',
      'missingat.com',
      'user@',
      '@domain.com',
      'user@domain',
      'user@.com',
      'user@domain.',
    ];

    for (const email of malformed) {
      const res = validateRealEmail(email);
      expect(res.valid).toBe(false);
      expect(res.error).toBeDefined();
    }
  });
});
