/**
 * Cloudflare DNS Management & 1.1.1.1 DNS-over-HTTPS Service
 * Provides live DNS lookups, white-label CNAME verification, and zone DNS record management.
 */

import { getCloudflareConfig } from './config';

export interface CloudflareDnsRecord {
  id?: string;
  type: string;
  name: string;
  content: string;
  proxiable?: boolean;
  proxied?: boolean;
  ttl: number;
  zone_id?: string;
  zone_name?: string;
  created_on?: string;
  modified_on?: string;
}

export interface DohAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

export interface DohResponse {
  Status: number;
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question: Array<{ name: string; type: number }>;
  Answer?: DohAnswer[];
  Authority?: DohAnswer[];
}

const DNS_TYPE_MAP: Record<number, string> = {
  1: 'A',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  15: 'MX',
  16: 'TXT',
  28: 'AAAA',
};

/**
 * Perform live DNS lookup using Cloudflare's global 1.1.1.1 DoH (DNS-over-HTTPS)
 */
export async function queryDnsViaCloudflare(
  domain: string,
  type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS' | 'ANY' = 'A'
): Promise<{
  domain: string;
  type: string;
  records: Array<{ type: string; name: string; value: string; ttl: number }>;
  rawStatus: number;
  server: string;
}> {
  // Normalize domain
  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];

  try {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=${type}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/dns-json',
      },
    });

    if (!res.ok) {
      throw new Error(`Cloudflare DoH returned HTTP ${res.status}`);
    }

    const data: DohResponse = await res.json();
    const records = (data.Answer || []).map((ans) => ({
      type: DNS_TYPE_MAP[ans.type] || `${ans.type}`,
      name: ans.name,
      value: ans.data,
      ttl: ans.TTL,
    }));

    return {
      domain: cleanDomain,
      type,
      records,
      rawStatus: data.Status,
      server: '1.1.1.1 (Cloudflare Anycast)',
    };
  } catch (error: any) {
    console.error('[Cloudflare DoH] DNS query failed:', error);
    return {
      domain: cleanDomain,
      type,
      records: [],
      rawStatus: -1,
      server: '1.1.1.1 (Cloudflare Anycast)',
    };
  }
}

/**
 * Query multiple common record types (A, CNAME, TXT, MX) for a comprehensive domain DNS profile
 */
export async function getDomainFullDnsProfile(domain: string) {
  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
  const [aRecords, cnameRecords, txtRecords, mxRecords] = await Promise.all([
    queryDnsViaCloudflare(cleanDomain, 'A'),
    queryDnsViaCloudflare(cleanDomain, 'CNAME'),
    queryDnsViaCloudflare(cleanDomain, 'TXT'),
    queryDnsViaCloudflare(cleanDomain, 'MX'),
  ]);

  return {
    domain: cleanDomain,
    records: [
      ...aRecords.records,
      ...cnameRecords.records,
      ...txtRecords.records,
      ...mxRecords.records,
    ],
    timestamp: new Date().toISOString(),
  };
}

/**
 * List Cloudflare Zones in the account (if token is authorized)
 */
export async function listCloudflareZones(): Promise<Array<{ id: string; name: string; status: string }>> {
  const config = getCloudflareConfig();
  if (!config.apiToken) return [];

  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/zones?per_page=20', {
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.result)) {
      return data.result.map((z: any) => ({
        id: z.id,
        name: z.name,
        status: z.status,
      }));
    }
  } catch (err) {
    console.warn('[Cloudflare API] List zones failed:', err);
  }

  return [];
}

/**
 * Create or verify a White Label CNAME record pointing to SE Ranking
 */
export async function verifyWhiteLabelCname(customDomain: string, target = 'cname.seranking.com') {
  const cleanDomain = customDomain.replace(/^https?:\/\//, '').split('/')[0];
  const query = await queryDnsViaCloudflare(cleanDomain, 'CNAME');

  const matches = query.records.some(
    (r) => r.value.toLowerCase().includes(target.toLowerCase()) || r.value.toLowerCase().includes('seranking')
  );

  return {
    domain: cleanDomain,
    target,
    verified: matches,
    foundRecords: query.records,
    instruction: `Set a CNAME record for ${cleanDomain} pointing to ${target} in your DNS provider.`,
  };
}
