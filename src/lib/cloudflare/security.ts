/**
 * Cloudflare Edge & Security Inspector
 * Checks whether project domains are running behind Cloudflare CDN, WAF, and SSL.
 */

export interface CloudflareEdgeAuditResult {
  domain: string;
  isBehindCloudflare: boolean;
  server: string;
  cfRay?: string;
  cfDatacenter?: string;
  cfCacheStatus?: string;
  sslEnabled: boolean;
  hstsEnabled: boolean;
  httpVersion?: string;
  securityHeaders: {
    name: string;
    value: string;
    status: 'good' | 'warning' | 'missing';
  }[];
  score: number;
  timestamp: string;
  error?: string;
}

export async function inspectDomainCloudflareStatus(
  targetUrl: string
): Promise<CloudflareEdgeAuditResult> {
  let url = targetUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  const domain = new URL(url).hostname;
  const timestamp = new Date().toISOString();

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SE-Ranking-Cloudflare-Audit/1.0',
      },
      signal: AbortSignal.timeout(6000),
    });

    const headers = res.headers;
    const server = headers.get('server') || 'Unknown';
    const cfRay = headers.get('cf-ray') || undefined;
    const cfCacheStatus = headers.get('cf-cache-status') || undefined;

    // Parse datacenter IATA code from cf-ray (e.g. "8d1b2e557b6a-BOM")
    let cfDatacenter: string | undefined;
    if (cfRay && cfRay.includes('-')) {
      cfDatacenter = cfRay.split('-')[1]?.toUpperCase();
    }

    const isBehindCloudflare =
      server.toLowerCase().includes('cloudflare') ||
      !!cfRay ||
      !!cfCacheStatus ||
      headers.has('cf-visitor') ||
      headers.has('cf-bgj');

    const hsts = headers.get('strict-transport-security');
    const csp = headers.get('content-security-policy');
    const xcto = headers.get('x-content-type-options');
    const xfo = headers.get('x-frame-options');

    const securityHeaders: CloudflareEdgeAuditResult['securityHeaders'] = [
      {
        name: 'Strict-Transport-Security (HSTS)',
        value: hsts || 'Missing',
        status: hsts ? 'good' : 'warning',
      },
      {
        name: 'Content-Security-Policy',
        value: csp ? 'Configured' : 'Missing',
        status: csp ? 'good' : 'warning',
      },
      {
        name: 'X-Content-Type-Options',
        value: xcto || 'Missing',
        status: xcto === 'nosniff' ? 'good' : 'warning',
      },
      {
        name: 'X-Frame-Options',
        value: xfo || 'Missing',
        status: xfo ? 'good' : 'warning',
      },
    ];

    let score = 50;
    if (url.startsWith('https://')) score += 20;
    if (isBehindCloudflare) score += 15;
    if (hsts) score += 10;
    if (xcto) score += 5;

    return {
      domain,
      isBehindCloudflare,
      server,
      cfRay,
      cfDatacenter,
      cfCacheStatus,
      sslEnabled: url.startsWith('https://'),
      hstsEnabled: !!hsts,
      securityHeaders,
      score: Math.min(100, score),
      timestamp,
    };
  } catch (error: any) {
    // If request failed, report unreachable / unverified
    return {
      domain,
      isBehindCloudflare: false,
      server: 'unknown',
      cfRay: undefined,
      cfDatacenter: undefined,
      cfCacheStatus: undefined,
      sslEnabled: false,
      hstsEnabled: false,
      securityHeaders: [],
      score: 0,
      timestamp,
      error: 'Target domain was unreachable or timed out during inspection.',
    };
  }
}
