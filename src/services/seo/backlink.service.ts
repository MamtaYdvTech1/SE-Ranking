/**
 * Production Backlink Analysis & Monitoring Service
 * Multi-provider architecture, database persistence, anchor distribution,
 * DoFollow/NoFollow ratio calculations, and competitive Backlink Gap analysis.
 */

import { prisma } from '@/lib/db/prisma';

export interface BacklinkRecord {
  id?: string;
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  domainTrust: number | null;
  pageTrust: number | null;
  isDoFollow: boolean;
  isLost: boolean;
  firstSeenDate: Date;
  lastSeenDate: Date;
}

export interface OverallDataPoint {
  date: string;
  range: string;
  refDomains: number;
  backlinks: number;
  dt: number;
  pt: number;
  organic: number;
}

export interface NewLostDataPoint {
  date: string;
  range: string;
  newCount: number;
  lostCount: number;
  change: number;
}

export interface BacklinkSummary {
  domain: string;
  totalBacklinks: number;
  referringDomains: number;
  dofollowRatio: number; // Percentage
  nofollowRatio: number; // Percentage
  domainTrust: number;
  pageTrust: number;
  newBacklinksLast30Days: number;
  lostBacklinksLast30Days: number;
  anchors: Array<{
    anchor: string;
    count: number;
    percentage: number;
  }>;
  recentBacklinks: BacklinkRecord[];
  timeSeries?: OverallDataPoint[];
  newLostDomains?: NewLostDataPoint[];
  newLostBacklinks?: NewLostDataPoint[];
}

export interface BacklinkGapResult {
  referringDomain: string;
  targetDomainHasLink: boolean;
  competitorsWithLinks: Array<{
    competitorDomain: string;
    hasLink: boolean;
  }>;
  domainTrust: number;
}

import { yepApiClient, type BacklinkSummaryData } from '@/lib/yepapi';

export interface BacklinkProvider {
  fetchBacklinks(domain: string): Promise<BacklinkRecord[]>;
}

/**
 * Default Backlink Provider using YepAPI client
 */
/**
 * Default Backlink Provider using YepAPI client with resilient timeout
 */
class DefaultBacklinkProvider implements BacklinkProvider {
  async fetchBacklinks(domain: string): Promise<BacklinkRecord[]> {
    if (!yepApiClient.isConfigured()) {
      return [];
    }

    try {
      const clean = (domain || '')
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .split('/')[0]
        .toLowerCase();

      const res = await yepApiClient.getBacklinksList({
        target: clean,
        limit: 100,
        mode: 'as_is',
        status: 'all',
      });

      if (!res.ok || !res.data || !res.data.backlinks || res.data.backlinks.length === 0) {
        return [];
      }

      return res.data.backlinks.map((item) => ({
        sourceUrl: item.from,
        targetUrl: item.to,
        anchorText: item.anchor || '',
        domainTrust: item.domainAuthority != null
          ? Math.round(item.domainAuthority)
          : (item.rank != null ? Math.min(100, Math.round(item.rank / 2)) : null),
        pageTrust: item.rank != null ? Math.min(100, Math.round(item.rank / 2.5)) : null,
        isDoFollow: item.dofollow ?? true,
        isLost: item.status === 'lost',
        firstSeenDate: item.firstSeen ? new Date(item.firstSeen) : new Date(),
        lastSeenDate: item.lastSeen ? new Date(item.lastSeen) : new Date(),
      }));
    } catch {
      return [];
    }
  }
}

const activeProvider: BacklinkProvider = new DefaultBacklinkProvider();

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return url;
  }
}

/**
 * Retrieves backlink intelligence for a project. Totals come from the live YepAPI summary when
 * available, otherwise from stored backlinks; charts are derived from stored first/last-seen dates.
 */
export async function getProjectBacklinks(projectId: string): Promise<BacklinkSummary> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const cleanDomain = (project.domain || '')
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .toLowerCase();

  const storedBacklinks = await prisma.backlink.findMany({
    where: { projectId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  let liveSummary: BacklinkSummaryData | null = null;
  if (yepApiClient.isConfigured()) {
    try {
      const summaryRes = await yepApiClient.getBacklinkSummary(cleanDomain);
      if (summaryRes.ok && summaryRes.data) {
        liveSummary = summaryRes.data;
      }
    } catch (e) {
      console.warn('YepAPI summary fetch notice:', e);
    }
  }

  const uniqueDomains = new Set<string>();
  const anchorCounts: Record<string, number> = {};
  let dofollowCount = 0;
  let newLast30 = 0;
  let lostLast30 = 0;
  let dtSum = 0;
  let dtCount = 0;
  let ptSum = 0;
  let ptCount = 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (const b of storedBacklinks) {
    if (b.domainTrust != null) {
      dtSum += b.domainTrust;
      dtCount++;
    }
    if (b.pageTrust != null) {
      ptSum += b.pageTrust;
      ptCount++;
    }
    uniqueDomains.add(hostnameOf(b.sourceUrl));

    const anchor = b.anchorText?.trim();
    if (anchor) anchorCounts[anchor] = (anchorCounts[anchor] || 0) + 1;

    if (b.isDoFollow) dofollowCount++;
    if (b.isLost && b.lastSeenDate >= thirtyDaysAgo) lostLast30++;
    if (!b.isLost && b.firstSeenDate >= thirtyDaysAgo) newLast30++;
  }

  const dbTotalBacklinks = storedBacklinks.length;
  const totalBacklinks = liveSummary?.totalBacklinks ?? dbTotalBacklinks;
  const referringDomains = liveSummary?.referringDomains ?? uniqueDomains.size;

  const avgDt = dtCount > 0
    ? Math.round(dtSum / dtCount)
    : (liveSummary?.rank != null ? Math.min(100, Math.round(liveSummary.rank / 2)) : 0);
  const avgPt = ptCount > 0 ? Math.round(ptSum / ptCount) : 0;

  let dofollowRatio = 0;
  let nofollowRatio = 0;
  if (liveSummary && liveSummary.dofollow + liveSummary.nofollow > 0) {
    dofollowRatio = Number(((liveSummary.dofollow / (liveSummary.dofollow + liveSummary.nofollow)) * 100).toFixed(1));
    nofollowRatio = Number((100 - dofollowRatio).toFixed(1));
  } else if (dbTotalBacklinks > 0) {
    dofollowRatio = Number(((dofollowCount / dbTotalBacklinks) * 100).toFixed(1));
    nofollowRatio = Number((100 - dofollowRatio).toFixed(1));
  }

  const anchorTotal = Object.values(anchorCounts).reduce((a, b) => a + b, 0);
  const anchors = Object.entries(anchorCounts)
    .map(([anchor, count]) => ({
      anchor,
      count,
      percentage: anchorTotal > 0 ? Number(((count / anchorTotal) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Weekly history over the last 14 weeks, computed from stored first/last-seen dates
  const timeSeries: OverallDataPoint[] = [];
  const newLostDomains: NewLostDataPoint[] = [];
  const newLostBacklinks: NewLostDataPoint[] = [];

  if (dbTotalBacklinks > 0) {
    const weeksCount = 14;
    const now = new Date();

    for (let i = weeksCount - 1; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const dateLabel = weekEnd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const rangeLabel = `${weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${weekEnd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;

      const liveAtWeekEnd = storedBacklinks.filter(
        (b) => b.firstSeenDate <= weekEnd && (!b.isLost || b.lastSeenDate > weekEnd)
      );
      const newThisWeek = storedBacklinks.filter((b) => b.firstSeenDate >= weekStart && b.firstSeenDate <= weekEnd);
      const lostThisWeek = storedBacklinks.filter(
        (b) => b.isLost && b.lastSeenDate >= weekStart && b.lastSeenDate <= weekEnd
      );

      timeSeries.push({
        date: dateLabel,
        range: rangeLabel,
        refDomains: new Set(liveAtWeekEnd.map((b) => hostnameOf(b.sourceUrl))).size,
        backlinks: liveAtWeekEnd.length,
        dt: avgDt,
        pt: avgPt,
        organic: 0,
      });

      const newDomainCount = new Set(newThisWeek.map((b) => hostnameOf(b.sourceUrl))).size;
      const lostDomainCount = new Set(lostThisWeek.map((b) => hostnameOf(b.sourceUrl))).size;
      newLostDomains.push({
        date: dateLabel,
        range: rangeLabel,
        newCount: newDomainCount,
        lostCount: -lostDomainCount,
        change: newDomainCount - lostDomainCount,
      });

      newLostBacklinks.push({
        date: dateLabel,
        range: rangeLabel,
        newCount: newThisWeek.length,
        lostCount: -lostThisWeek.length,
        change: newThisWeek.length - lostThisWeek.length,
      });
    }
  }

  return {
    domain: project.domain,
    totalBacklinks,
    referringDomains,
    dofollowRatio,
    nofollowRatio,
    domainTrust: avgDt,
    pageTrust: avgPt,
    newBacklinksLast30Days: newLast30,
    lostBacklinksLast30Days: lostLast30,
    anchors,
    recentBacklinks: storedBacklinks.slice(0, 50).map((b) => ({
      id: b.id,
      sourceUrl: b.sourceUrl,
      targetUrl: b.targetUrl,
      anchorText: b.anchorText || '',
      domainTrust: b.domainTrust ?? 0,
      pageTrust: b.pageTrust ?? 0,
      isDoFollow: b.isDoFollow,
      isLost: b.isLost,
      firstSeenDate: b.firstSeenDate,
      lastSeenDate: b.lastSeenDate,
    })),
    timeSeries,
    newLostDomains,
    newLostBacklinks,
  };
}

/**
 * Synchronizes backlinks from the configured external provider (YepAPI) into the database.
 * New links are inserted; links already stored get their lost status and last-seen date refreshed.
 */
export async function syncProjectBacklinks(
  projectId: string
): Promise<{ added: number; updated: number; configured: boolean }> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('Project not found');

  if (!yepApiClient.isConfigured()) {
    return { added: 0, updated: 0, configured: false };
  }

  const remoteLinks = await activeProvider.fetchBacklinks(project.domain);
  let added = 0;
  let updated = 0;

  for (const link of remoteLinks) {
    const existing = await prisma.backlink.findFirst({
      where: {
        projectId,
        sourceUrl: link.sourceUrl,
        targetUrl: link.targetUrl,
        deletedAt: null,
      },
    });

    if (existing) {
      await prisma.backlink.update({
        where: { id: existing.id },
        data: {
          isLost: link.isLost,
          lastSeenDate: link.lastSeenDate,
          anchorText: link.anchorText,
          domainTrust: link.domainTrust,
          pageTrust: link.pageTrust,
          isDoFollow: link.isDoFollow,
        },
      });
      updated++;
    } else {
      await prisma.backlink.create({
        data: {
          projectId,
          sourceUrl: link.sourceUrl,
          targetUrl: link.targetUrl,
          anchorText: link.anchorText,
          domainTrust: link.domainTrust,
          pageTrust: link.pageTrust,
          isDoFollow: link.isDoFollow,
          isLost: link.isLost,
          firstSeenDate: link.firstSeenDate,
          lastSeenDate: link.lastSeenDate,
        },
      });
      added++;
    }
  }

  return { added, updated, configured: true };
}
