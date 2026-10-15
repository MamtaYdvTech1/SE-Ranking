import { NextRequest, NextResponse } from 'next/server';
import { yepApiClient, type ReferringDomainItem } from '@/lib/yepapi';

export const dynamic = 'force-dynamic';

const MAX_COMPETITORS = 5;
const DOMAINS_PER_TARGET = 500;

interface GapRow {
  domain: string;
  domainTrust: number;
  pageTrust: number;
  mainCount: number;
  compCounts: Record<string, number>;
  opportunityScore: 'High' | 'Medium' | 'Low';
  anchor: string;
  linkType: 'follow' | 'nofollow';
}

function cleanDomain(input: string): string {
  return (input || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^\*\./, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .toLowerCase();
}

// Same rank -> 0-100 trust mapping the backlink service uses
const trustFromRank = (rank: number | undefined) => (rank != null ? Math.min(100, Math.round(rank / 2)) : 0);

/**
 * POST /api/seo/backlink-gap  { target: string, competitors: string[] }
 * Referring domains that link to competitors, with how many backlinks each gives the target.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const target = cleanDomain(body.target);
    const competitors = Array.from(
      new Set((Array.isArray(body.competitors) ? body.competitors : []).map((c: unknown) => cleanDomain(String(c))))
    )
      .filter((c) => c && c !== target)
      .slice(0, MAX_COMPETITORS) as string[];

    if (!target) {
      return NextResponse.json({ success: false, error: 'Enter your domain.' }, { status: 400 });
    }
    if (competitors.length === 0) {
      return NextResponse.json({ success: false, error: 'Add at least one competitor domain.' }, { status: 400 });
    }
    if (!yepApiClient.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Backlink data provider (YepAPI) is not configured.' },
        { status: 503 }
      );
    }

    const fetchDomains = async (domain: string) => {
      const res = await yepApiClient.getReferringDomains({ target: domain, limit: DOMAINS_PER_TARGET, status: 'live' });
      if (!res.ok || !res.data) {
        throw new Error(res.error?.message || `Could not load referring domains for ${domain}.`);
      }
      return new Map<string, ReferringDomainItem>(
        res.data.referringDomains.map((d) => [cleanDomain(d.domain), d])
      );
    };

    const [mainDomains, ...competitorDomains] = await Promise.all([target, ...competitors].map(fetchDomains));

    const rows = new Map<string, GapRow>();
    competitors.forEach((comp, idx) => {
      for (const [domain, item] of competitorDomains[idx].entries()) {
        if (domain === target || competitors.includes(domain)) continue;
        let row = rows.get(domain);
        if (!row) {
          const mainItem = mainDomains.get(domain);
          row = {
            domain,
            domainTrust: trustFromRank(item.rank),
            pageTrust: 0,
            mainCount: mainItem?.backlinks ?? 0,
            compCounts: Object.fromEntries(competitors.map((c) => [c, 0])),
            opportunityScore: 'Low',
            anchor: '',
            linkType: item.dofollow > 0 ? 'follow' : 'nofollow',
          };
          rows.set(domain, row);
        }
        row.compCounts[comp] = item.backlinks;
        if (item.dofollow > 0) row.linkType = 'follow';
      }
    });

    // High: links to 2+ competitors but not you; Medium: 1 competitor but not you; Low: already links to you
    const result = [...rows.values()].map((row) => {
      const linkingCompetitors = Object.values(row.compCounts).filter((n) => n > 0).length;
      row.opportunityScore = row.mainCount > 0 ? 'Low' : linkingCompetitors >= 2 ? 'High' : 'Medium';
      return row;
    });
    result.sort((a, b) => b.domainTrust - a.domainTrust);

    return NextResponse.json({ success: true, target, competitors, rows: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Backlink gap analysis failed.';
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
