import { describe, it, expect } from 'vitest';
import {
  getCloudflareConfig,
  queryDnsViaCloudflare,
  verifyWhiteLabelCname,
  purgeCloudflareCache,
  inspectDomainCloudflareStatus,
  uploadToR2,
  listR2Files,
  deleteFromR2,
  verifyTurnstileToken,
} from '../src/lib/cloudflare';

describe('Cloudflare Integration Suite', () => {
  it('loads valid Cloudflare configuration with defaults', () => {
    const config = getCloudflareConfig();
    expect(config).toBeDefined();
    expect(config.accountId).toBeDefined();
    expect(config.r2.bucketName).toBe('seranking');
    expect(config.turnstile.siteKey).toBeDefined();
  });

  it('queries DNS records via Cloudflare 1.1.1.1 DoH', async () => {
    const dnsResult = await queryDnsViaCloudflare('google.com', 'A');
    expect(dnsResult).toBeDefined();
    expect(dnsResult.domain).toBe('google.com');
    expect(dnsResult.server).toContain('1.1.1.1');
    expect(Array.isArray(dnsResult.records)).toBe(true);
  });

  it('validates white label CNAME resolution', async () => {
    const wl = await verifyWhiteLabelCname('cname.seranking.com', 'seranking');
    expect(wl).toBeDefined();
    expect(wl.domain).toBe('cname.seranking.com');
  });

  it('executes edge cache purge', async () => {
    const purge = await purgeCloudflareCache({
      urls: ['https://workcomposer.com/pricing'],
    });
    expect(purge.success).toBe(true);
    expect(purge.timestamp).toBeDefined();
  });

  it('inspects domain Cloudflare edge and security posture', async () => {
    const audit = await inspectDomainCloudflareStatus('cloudflare.com');
    expect(audit).toBeDefined();
    expect(audit.domain).toBe('cloudflare.com');
    expect(audit.isBehindCloudflare).toBe(true);
    expect(audit.score).toBeGreaterThan(0);
  });

  it('handles R2 storage uploads with resilient fallback', async () => {
    const testContent = Buffer.from('SE Ranking Cloudflare R2 Test Asset');
    const uploadResult = await uploadToR2({
      buffer: testContent,
      key: `test_asset_${Date.now()}.txt`,
      folder: 'audits',
      contentType: 'text/plain',
    });

    expect(uploadResult.success).toBe(true);
    expect(uploadResult.url).toBeDefined();

    // List files
    const files = await listR2Files();
    expect(Array.isArray(files)).toBe(true);

    // Delete uploaded asset
    const delResult = await deleteFromR2(uploadResult.key);
    expect(delResult.success).toBe(true);
  });

  it('verifies Cloudflare Turnstile token validation', async () => {
    const res = await verifyTurnstileToken('mock_token');
    expect(res.success).toBe(true);
    expect(res.provider).toBe('cloudflare_turnstile');
  });
});
