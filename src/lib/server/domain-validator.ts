import dns from 'dns';
import { validateRealDomainFormat, DomainValidationResult } from '@/lib/validation/schemas';

const domainCache = new Map<string, { valid: boolean; error?: string; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

/**
 * Verifies that a domain name is both syntactically valid and actively registered in DNS.
 * Rejects fake inputs, non-existent domains, localhost, and malformed strings.
 * Includes in-memory caching for lightning fast repeated operations.
 */
export async function verifyDomainExists(domainOrUrl: string): Promise<DomainValidationResult> {
  const formatResult = validateRealDomainFormat(domainOrUrl);
  if (!formatResult.valid) {
    return formatResult;
  }

  const domain = formatResult.normalizedDomain;

  // Check cache first for instantaneous response
  const cached = domainCache.get(domain);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      valid: cached.valid,
      normalizedDomain: domain,
      error: cached.error,
    };
  }

  // Fast DNS resolution check with 2000ms timeout
  try {
    const lookupPromise = dns.promises.lookup(domain);
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('DNS_TIMEOUT')), 2000)
    );

    const res = (await Promise.race([lookupPromise, timeoutPromise])) as any;
    if (res && res.address) {
      domainCache.set(domain, { valid: true, timestamp: Date.now() });
      return { valid: true, normalizedDomain: domain };
    }
  } catch (err: any) {
    // If DNS explicitly returned ENOTFOUND or NXDOMAIN, domain is fake or unregistered
    if (err && (err.code === 'ENOTFOUND' || err.code === 'NXDOMAIN' || err.code === 'NODATA')) {
      const errorMsg = `The domain "${domain}" is not active or could not be found in DNS. Please enter a real, registered website.`;
      domainCache.set(domain, { valid: false, error: errorMsg, timestamp: Date.now() });
      return {
        valid: false,
        normalizedDomain: domain,
        error: errorMsg,
      };
    }
    // If timeout or other non-fatal network error, log and fallback to format check
    console.warn(`DNS check fast-path for "${domain}":`, err?.code || err?.message);
  }

  domainCache.set(domain, { valid: true, timestamp: Date.now() });
  return { valid: true, normalizedDomain: domain };
}
