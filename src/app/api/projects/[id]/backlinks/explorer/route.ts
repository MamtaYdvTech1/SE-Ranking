import { NextRequest, NextResponse } from 'next/server';
import { promises as dns } from 'node:dns';
import { prisma } from '@/lib/db/prisma';
import { verifyProjectAccess } from '@/lib/server/projectAuth';
import type {
  AnchorData,
  BacklinkRecord,
  ReferringDomainRecord,
  TimeSeriesPoint,
  TrustDistributionData,
  ZohoIpItem,
  ZohoPageItem,
} from '@/components/backlink-checker/types';

export const dynamic = 'force-dynamic';

const NEW_WINDOW_DAYS = 30;
const DNS_TIMEOUT_MS = 2500;
const DNS_CONCURRENCY = 16;

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function resolveIp(host: string): Promise<string | null> {
  try {
    const result = await Promise.race([
      dns.lookup(host, { family: 4 }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), DNS_TIMEOUT_MS)),
    ]);
    return result ? result.address : null;
  } catch {
    return null;
  }
}

async function resolveAll(hosts: string[]): Promise<Map<string, string | null>> {
  const out = new Map<string, string | null>();
  for (let i = 0; i < hosts.length; i += DNS_CONCURRENCY) {
    const batch = hosts.slice(i, i + DNS_CONCURRENCY);
    const ips = await Promise.all(batch.map(resolveIp));
    batch.forEach((h, idx) => out.set(h, ips[idx]));
  }
  return out;
}

/**
 * GET /api/projects/[id]/backlinks/explorer
 * Stored backlinks for the project, shaped for the Backlink Checker tabs.
 * Metrics with no data source (traffic, keyword counts, domain age, country) are returned empty.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await verifyProjectAccess(req, id);
    if (!access.success) return access.error;
    const projectId = access.data.project.id;

    const rows = await prisma.backlink.findMany({
      where: { projectId, deletedAt: null },
      orderBy: { firstSeenDate: 'desc' },
    });

    const now = new Date();
    const newSince = new Date(now.getTime() - NEW_WINDOW_DAYS * 86400000);
    const statusOf = (isLost: boolean, firstSeen: Date): 'Active' | 'New' | 'Lost' =>
      isLost ? 'Lost' : firstSeen >= newSince ? 'New' : 'Active';

    // Backlinks
    const backlinks: BacklinkRecord[] = rows.map((b) => ({
      id: b.id,
      sourceUrl: b.sourceUrl,
      sourceTitle: hostnameOf(b.sourceUrl),
      targetUrl: b.targetUrl,
      anchorText: b.anchorText || '',
      domainTraffic: '—',
      domainTrafficNum: 0,
      pageTraffic: '—',
      pageTrafficNum: 0,
      domainTrust: b.domainTrust ?? 0,
      pageTrust: b.pageTrust ?? 0,
      keywordsCount: 0,
      firstSeen: fmtDate(b.firstSeenDate),
      lastSeen: fmtDate(b.lastSeenDate),
      status: statusOf(b.isLost, b.firstSeenDate),
      linkType: 'Text',
      isDofollow: b.isDoFollow,
    }));

    // Group by referring domain
    const byDomain = new Map<string, typeof rows>();
    for (const b of rows) {
      const host = hostnameOf(b.sourceUrl);
      if (!byDomain.has(host)) byDomain.set(host, []);
      byDomain.get(host)!.push(b);
    }

    const ipByHost = await resolveAll([...byDomain.keys()]);

    const referringDomains: ReferringDomainRecord[] = [...byDomain.entries()].map(([host, links], idx) => {
      const firstSeen = new Date(Math.min(...links.map((l) => l.firstSeenDate.getTime())));
      const lastSeen = new Date(Math.max(...links.map((l) => l.lastSeenDate.getTime())));
      const allLost = links.every((l) => l.isLost);
      const dofollowCount = links.filter((l) => l.isDoFollow).length;
      const dt = Math.max(...links.map((l) => l.domainTrust ?? 0));
      const pt = Math.max(...links.map((l) => l.pageTrust ?? 0));
      return {
        id: `rd-${idx + 1}`,
        domain: host,
        domainTrust: dt,
        pageTrust: pt,
        domainTraffic: '—',
        domainTrafficNum: 0,
        backlinksCount: links.length,
        keywords: '—',
        keywordsNum: 0,
        domainAge: '—',
        firstSeen: fmtDate(firstSeen),
        lastSeen: fmtDate(lastSeen),
        status: allLost ? 'Lost' : firstSeen >= newSince ? 'New' : 'Active',
        dofollowCount,
        nofollowCount: links.length - dofollowCount,
        ip: ipByHost.get(host) || undefined,
      };
    });

    const sampleRefDomains = (links: typeof rows) => {
      const counts = new Map<string, { dt: number; links: number }>();
      for (const l of links) {
        const host = hostnameOf(l.sourceUrl);
        const cur = counts.get(host) || { dt: 0, links: 0 };
        counts.set(host, { dt: Math.max(cur.dt, l.domainTrust ?? 0), links: cur.links + 1 });
      }
      return [...counts.entries()]
        .map(([domain, v]) => ({ domain, ...v }))
        .sort((a, b) => b.links - a.links)
        .slice(0, 5);
    };
    const sampleBacklinks = (links: typeof rows) =>
      links.slice(0, 5).map((l) => ({
        sourceUrl: l.sourceUrl,
        targetUrl: l.targetUrl,
        anchor: l.anchorText || '',
        isDofollow: l.isDoFollow,
      }));

    // Anchors
    const byAnchor = new Map<string, typeof rows>();
    for (const b of rows) {
      const anchor = (b.anchorText || '').trim() || '(empty)';
      if (!byAnchor.has(anchor)) byAnchor.set(anchor, []);
      byAnchor.get(anchor)!.push(b);
    }
    const anchors: AnchorData[] = [...byAnchor.entries()]
      .map(([anchorText, links], idx) => {
        const dofollowCount = links.filter((l) => l.isDoFollow).length;
        return {
          id: `anc-${idx + 1}`,
          anchorText,
          backlinks: links.length,
          percent: rows.length > 0 ? Number(((links.length / rows.length) * 100).toFixed(1)) : 0,
          referringDomains: new Set(links.map((l) => hostnameOf(l.sourceUrl))).size,
          dofollowCount,
          dofollowPercent: Number(((dofollowCount / links.length) * 100).toFixed(1)),
          firstSeen: fmtDate(new Date(Math.min(...links.map((l) => l.firstSeenDate.getTime())))),
          lastSeen: fmtDate(new Date(Math.max(...links.map((l) => l.lastSeenDate.getTime())))),
          wordCount: anchorText === '(empty)' ? 0 : anchorText.split(/\s+/).length,
          sampleRefDomains: sampleRefDomains(links),
          sampleBacklinks: links.slice(0, 5).map((l) => ({
            sourceUrl: l.sourceUrl,
            targetUrl: l.targetUrl,
            isDofollow: l.isDoFollow,
          })),
        };
      })
      .sort((a, b) => b.backlinks - a.backlinks);

    // Target pages
    const byPage = new Map<string, typeof rows>();
    for (const b of rows) {
      if (!byPage.has(b.targetUrl)) byPage.set(b.targetUrl, []);
      byPage.get(b.targetUrl)!.push(b);
    }
    const pages: ZohoPageItem[] = [...byPage.entries()]
      .map(([url, links], idx) => ({
        id: `pg-${idx + 1}`,
        url,
        protocol: (url.startsWith('http://') ? 'http' : 'https') as 'http' | 'https',
        backlinksCount: links.length,
        refDomainsCount: new Set(links.map((l) => hostnameOf(l.sourceUrl))).size,
        domainTrust: Math.max(...links.map((l) => l.domainTrust ?? 0)),
        firstSeen: fmtDate(new Date(Math.min(...links.map((l) => l.firstSeenDate.getTime())))),
        lastSeen: fmtDate(new Date(Math.max(...links.map((l) => l.lastSeenDate.getTime())))),
        sampleRefDomains: sampleRefDomains(links),
        sampleBacklinks: sampleBacklinks(links),
      }))
      .sort((a, b) => b.backlinksCount - a.backlinksCount);

    // IPs (from DNS resolution of each referring domain)
    const byIp = new Map<string, typeof rows>();
    for (const [host, links] of byDomain.entries()) {
      const ip = ipByHost.get(host);
      if (!ip) continue;
      if (!byIp.has(ip)) byIp.set(ip, []);
      byIp.get(ip)!.push(...links);
    }
    const subnetOf = (ip: string) => ip.split('.').slice(0, 3).join('.') + '.0/24';
    const subnetCounts = new Map<string, number>();
    for (const ip of byIp.keys()) subnetCounts.set(subnetOf(ip), (subnetCounts.get(subnetOf(ip)) || 0) + 1);
    const ips: ZohoIpItem[] = [...byIp.entries()]
      .map(([ipAddress, links], idx) => ({
        id: `ip-${idx + 1}`,
        ipAddress,
        subnet: subnetOf(ipAddress),
        country: '',
        countryCode: '',
        flag: '',
        ipCountInSubnet: subnetCounts.get(subnetOf(ipAddress)) || 1,
        refDomainsCount: new Set(links.map((l) => hostnameOf(l.sourceUrl))).size,
        backlinksCount: links.length,
        sampleRefDomains: sampleRefDomains(links),
        sampleBacklinks: sampleBacklinks(links),
      }))
      .sort((a, b) => b.backlinksCount - a.backlinksCount);

    // Weekly history over the last 14 weeks from first/last-seen dates
    const avgOf = (vals: Array<number | null>) => {
      const nums = vals.filter((v): v is number => v != null);
      return nums.length > 0 ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
    };
    const timeSeries: TimeSeriesPoint[] = [];
    if (rows.length > 0) {
      for (let i = 13; i >= 0; i--) {
        const weekEnd = new Date(now.getTime() - i * 7 * 86400000);
        const weekStart = new Date(weekEnd.getTime() - 6 * 86400000);
        weekStart.setHours(0, 0, 0, 0);
        const live = rows.filter((b) => b.firstSeenDate <= weekEnd && (!b.isLost || b.lastSeenDate > weekEnd));
        const added = rows.filter((b) => b.firstSeenDate >= weekStart && b.firstSeenDate <= weekEnd);
        const lost = rows.filter((b) => b.isLost && b.lastSeenDate >= weekStart && b.lastSeenDate <= weekEnd);
        timeSeries.push({
          date: weekEnd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          referringDomains: new Set(live.map((b) => hostnameOf(b.sourceUrl))).size,
          backlinks: live.length,
          domainTrust: avgOf(live.map((b) => b.domainTrust)),
          pageTrust: avgOf(live.map((b) => b.pageTrust)),
          organicTraffic: 0,
          newRefDomains: new Set(added.map((b) => hostnameOf(b.sourceUrl))).size,
          lostRefDomains: new Set(lost.map((b) => hostnameOf(b.sourceUrl))).size,
          newBacklinks: added.length,
          lostBacklinks: lost.length,
        });
      }
    }

    // Referring domains by Domain Trust band
    const bands: Array<[string, number, number]> = [
      ['0-10', 0, 10], ['11-20', 11, 20], ['21-30', 21, 30], ['31-40', 31, 40], ['41-50', 41, 50],
      ['51-60', 51, 60], ['61-70', 61, 70], ['71-80', 71, 80], ['81-90', 81, 90], ['91-100', 91, 100],
    ];
    const trustDistribution: TrustDistributionData[] = bands.map(([range, lo, hi]) => {
      const n = referringDomains.filter((d) => d.domainTrust >= lo && d.domainTrust <= hi).length;
      return {
        range,
        refDomains: n,
        percent: referringDomains.length > 0 ? Number(((n / referringDomains.length) * 100).toFixed(1)) : 0,
      };
    });

    return NextResponse.json({
      success: true,
      domain: access.data.project.domain,
      totals: {
        backlinks: rows.length,
        referringDomains: referringDomains.length,
        dofollow: rows.filter((b) => b.isDoFollow).length,
        lost: rows.filter((b) => b.isLost).length,
      },
      lastChecked:
        rows.length > 0 ? new Date(Math.max(...rows.map((b) => b.lastSeenDate.getTime()))).toISOString() : null,
      backlinks,
      referringDomains,
      anchors,
      pages,
      ips,
      timeSeries,
      trustDistribution,
      countryDistribution: [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load backlink data.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
