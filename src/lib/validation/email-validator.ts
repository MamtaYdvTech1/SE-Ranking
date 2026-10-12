/**
 * Strict Email & Disposable Email (Temp Mail) Validator
 * Prevents temporary, disposable, fake, and invalid email addresses
 * during Login, Signup, and Account operations.
 */

// Comprehensive list of known disposable and temporary email domains
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  // Popular Temp Mail services
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'tempmail.net',
  'tempmail.io',
  'tempmail.ninja',
  'tempmailo.com',
  'tempail.com',
  'tmpmail.org',
  'tmpmail.net',
  'tmpmail.pw',
  'tmailor.com',
  'mytemp.email',
  'mytempmail.com',
  'mailtemp.net',
  'tempremail.com',
  'disposablemail.com',
  'tempinbox.com',
  'tempemail.co',
  'tempmailaddress.com',

  // 10 Minute Mail family
  '10minutemail.com',
  '10minutemail.net',
  '10minuteemail.com',
  '10minutemail.be',
  '10minutemail.de',
  '20minutemail.com',
  'minuteinbox.com',

  // Mailinator family
  'mailinator.com',
  'mailinator2.com',
  'mailin8r.com',
  'suremail.info',
  'tradermail.info',
  'mailcatch.com',

  // Guerrilla Mail family
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.biz',
  'guerrillamail.org',
  'guerrillamail.de',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'pokemail.net',
  'spam4.me',

  // Yopmail family
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',

  // TrashMail family
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'trashmail.org',
  'trash-mail.com',
  'trash-mail.at',
  'trash-mail.de',
  'trashmail.ws',
  'trashymail.com',
  'trashinbox.com',

  // Dispostable & Throwaway
  'dispostable.com',
  'throwawaymail.com',
  'throwaway.email',
  'throwawayemailaddress.com',

  // Nada & Getnada
  'getnada.com',
  'nada.ltd',
  'nada.email',
  'getairmail.com',
  'abcvg.com',
  'cmail.club',
  'inboxbear.com',

  // Burner & Fake inbox
  'burnermail.io',
  'burner.email',
  'fakeinbox.com',
  'fakemailgenerator.com',
  'emailfake.com',
  'fakemail.net',
  'deadaddress.com',
  'spambox.us',
  'bupmail.com',
  'crazymailing.com',
  'emailondeck.com',
  'inboxkitten.com',
  'mohmal.com',
  'maildrop.cc',
  'harakirimail.com',
  'dropmail.me',
  'mailnesia.com',
  'incognitomail.org',
  'inboxclean.com',
  'mailscrap.com',
  'mailforspam.com',
  'spamfree24.org',
  'spamex.com',
  'byom.de',
  'sofort-mail.de',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'wegwerfmail.org',
  'chacuo.net',
  'zoemail.org',
  'generator.email',
  'tempr.email',
  'discard.email',
  'spambog.com',
  'internxt.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'mailnull.com',
]);

// Keywords inside domain names commonly used by disposable email providers
export const DISPOSABLE_KEYWORDS = [
  'tempmail',
  'temp-mail',
  'disposable',
  'fakeinbox',
  '10minute',
  'trashmail',
  'trash-mail',
  'throwaway',
  'mailinator',
  'guerrillamail',
  'guerrilla',
  'yopmail',
  'fakemail',
  'sharklasers',
  'burnermail',
  'mohmal',
  'getnada',
  'inboxkitten',
  'emailondeck',
  'minuteinbox',
  'wegwerfmail',
  'dropmail',
  'tempinbox',
  'dispostable',
  'spam4me',
];

// Dummy / reserved domains that are not real email providers
export const FAKE_EMAIL_DOMAINS = new Set([
  'test.com',
  'example.com',
  'fake.com',
  'dummy.com',
  'invalid.com',
  'none.com',
  'sample.com',
  'test.org',
  'example.org',
  'test.net',
  'example.net',
  'localhost',
  'localhost.com',
]);

const STRICT_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export interface EmailValidationResult {
  valid: boolean;
  cleanEmail: string;
  domain: string;
  error?: string;
  isDisposable?: boolean;
}

export interface EmailValidationOptions {
  allowExampleDomains?: boolean;
}

/**
 * Validates that an email is legitimate, correctly structured, and NOT a temporary or disposable address.
 */
export function validateRealEmail(
  rawEmail: string,
  options?: EmailValidationOptions
): EmailValidationResult {
  const allowExampleDomains = options?.allowExampleDomains ?? false;
  if (!rawEmail || typeof rawEmail !== 'string') {
    return {
      valid: false,
      cleanEmail: '',
      domain: '',
      error: 'Please enter your email address.',
    };
  }

  const cleanEmail = rawEmail.trim().toLowerCase();

  if (cleanEmail.length < 5) {
    return {
      valid: false,
      cleanEmail,
      domain: '',
      error: 'Email address is too short.',
    };
  }

  if (cleanEmail.length > 254) {
    return {
      valid: false,
      cleanEmail,
      domain: '',
      error: 'Email address exceeds maximum length.',
    };
  }

  // Format check
  if (!cleanEmail.includes('@') || !STRICT_EMAIL_REGEX.test(cleanEmail)) {
    return {
      valid: false,
      cleanEmail,
      domain: '',
      error: 'Please enter a valid email address (e.g. name@gmail.com).',
    };
  }

  const parts = cleanEmail.split('@');
  if (parts.length !== 2) {
    return {
      valid: false,
      cleanEmail,
      domain: '',
      error: 'Please enter a valid email address.',
    };
  }

  const [username, domain] = parts;

  if (username.length < 1 || username.length > 64) {
    return {
      valid: false,
      cleanEmail,
      domain,
      error: 'Invalid email username.',
    };
  }

  if (!domain.includes('.')) {
    return {
      valid: false,
      cleanEmail,
      domain,
      error: 'Email domain must include a valid extension (e.g. .com, .in).',
    };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return {
      valid: false,
      cleanEmail,
      domain,
      error: 'Invalid email domain extension.',
    };
  }

  // Check dummy / example domains
  if (FAKE_EMAIL_DOMAINS.has(domain) && !allowExampleDomains) {
    return {
      valid: false,
      cleanEmail,
      domain,
      error: 'Please enter a genuine, active email address.',
    };
  }

  // Check exact disposable domains
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      valid: false,
      cleanEmail,
      domain,
      isDisposable: true,
      error: 'Temporary and disposable email addresses (temp mail) are not allowed. Please use a valid personal or business email address.',
    };
  }

  // Check disposable keywords in domain
  for (const keyword of DISPOSABLE_KEYWORDS) {
    if (domain.includes(keyword)) {
      return {
        valid: false,
        cleanEmail,
        domain,
        isDisposable: true,
        error: 'Temporary and disposable email addresses (temp mail) are not allowed. Please use a valid personal or business email address.',
      };
    }
  }

  return {
    valid: true,
    cleanEmail,
    domain,
  };
}
