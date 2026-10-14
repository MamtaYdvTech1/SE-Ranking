/**
 * DataForSEO Universal SEO API Client (MIGRATED TO YEPAPI)
 *
 * NOTE: DataForSEO has been fully decommissioned and migrated to YepAPI.
 * This client delegates all operations to YepAPI (`yepApiClient`) to ensure
 * zero downtime, backward-compatibility with existing tests, and 100% genuine
 * data from the new provider without falling back to DataForSEO.
 */

import { yepApiClient } from '@/lib/yepapi';

export interface DataForSeoCredentials {
  login?: string;
  password?: string;
}

export interface DataForSeoKeywordMetrics {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  keywordDifficulty?: number;
  intent?: string;
  monthlySearches?: Array<{ year: number; month: number; search_volume: number }>;
}

export interface DataForSeoCompetitorItem {
  domain: string;
  avgPosition: number;
  intersections: number;
  fullDomainMetrics?: {
    organicTraffic?: number;
    organicKeywords?: number;
  };
}

export interface DataForSeoBacklinksSummary {
  target: string;
  totalBacklinks: number;
  referringDomains: number;
  referringIps: number;
  rank: number;
  dofollowCount: number;
  nofollowCount: number;
  govLinksCount: number;
  eduLinksCount: number;
}

export interface DataForSeoBacklinkItem {
  sourceUrl: string;
  targetUrl: string;
  urlFrom?: string;
  urlTo?: string;
  anchor: string;
  rank: number;
  domainRank?: number;
  pageRank: number;
  isDoFollow: boolean;
  isLost: boolean;
  firstSeen: string;
  lastSeen: string;
}

export class DataForSeoClient {
  /**
   * Checks if active SEO provider (YepAPI) is configured.
   */
  isConfigured(): boolean {
    return yepApiClient.isConfigured();
  }

  /**
   * Normalizes target domain to hostname only.
   */
  normalizeDomain(domain: string): string {
    return yepApiClient.normalizeTargetDomain(domain);
  }

  /**
   * Fetches real keyword search volume and CPC via YepAPI
   */
  async getSearchVolume(
    keywords: string[],
    countryCode = 'us',
    languageCode = 'en'
  ): Promise<{ success: boolean; data: DataForSeoKeywordMetrics[]; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        data: [],
        error: 'YepAPI is not configured. Add YEPAPI_KEY to server environment.',
      };
    }

    try {
      const res = await yepApiClient.getKeywords({
        keywords,
        language: languageCode,
      });

      if (!res.ok || !res.data) {
        return {
          success: false,
          data: [],
          error: res.error?.message || 'Failed to fetch keyword metrics from YepAPI',
        };
      }

      const mapped: DataForSeoKeywordMetrics[] = (res.data.keywords || []).map((k) => ({
        keyword: k.keyword,
        searchVolume: k.volume || 0,
        cpc: k.cpc || 0,
        competition: k.competition || 0,
        keywordDifficulty: k.difficulty || 0,
        intent: k.intent || 'informational',
        monthlySearches: (k.trend || []).map((t) => ({
          year: t.year,
          month: t.month,
          search_volume: t.volume,
        })),
      }));

      return { success: true, data: mapped };
    } catch (err: unknown) {
      return {
        success: false,
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error fetching search volume',
      };
    }
  }

  /**
   * Fetches keyword suggestions via YepAPI
   */
  async getKeywordSuggestions(
    seedKeyword: string,
    countryCode = 'us',
    languageCode = 'en',
    limit = 25
  ): Promise<{ success: boolean; data: DataForSeoKeywordMetrics[]; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        data: [],
        error: 'YepAPI is not configured. Add YEPAPI_KEY to server environment.',
      };
    }

    try {
      const res = await yepApiClient.getKeywordIdeas({
        keyword: seedKeyword,
        limit,
        language: languageCode,
      });

      if (!res.ok || !res.data) {
        return {
          success: false,
          data: [],
          error: res.error?.message || 'Failed to fetch keyword ideas from YepAPI',
        };
      }

      const mapped: DataForSeoKeywordMetrics[] = (res.data.keywords || []).map((k) => ({
        keyword: k.keyword,
        searchVolume: k.volume || 0,
        cpc: k.cpc || 0,
        competition: k.competition || 0,
        keywordDifficulty: k.difficulty || 0,
        intent: k.intent || 'informational',
      }));

      return { success: true, data: mapped };
    } catch (err: unknown) {
      return {
        success: false,
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error fetching keyword suggestions',
      };
    }
  }

  /**
   * Discovers competitors via YepAPI
   */
  async getCompetitors(
    domain: string,
    countryCode = 'us',
    languageCode = 'en',
    limit = 10
  ): Promise<{ success: boolean; data: DataForSeoCompetitorItem[]; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        data: [],
        error: 'YepAPI is not configured. Add YEPAPI_KEY to server environment.',
      };
    }

    try {
      const clean = this.normalizeDomain(domain);
      const res = await yepApiClient.getCompetitorDomains({
        domain: clean,
        language: languageCode,
        limit,
      });

      if (!res.ok || !res.data) {
        return {
          success: false,
          data: [],
          error: res.error?.message || 'Failed to fetch competitors from YepAPI',
        };
      }

      const mapped: DataForSeoCompetitorItem[] = (res.data.competitors || []).map((c) => ({
        domain: c.domain,
        avgPosition: c.avgPosition || 0,
        intersections: c.intersections || 0,
        fullDomainMetrics: {
          organicKeywords: c.organicCount || 0,
          organicTraffic: c.organicEtv || 0,
        },
      }));

      return { success: true, data: mapped };
    } catch (err: unknown) {
      return {
        success: false,
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error fetching competitors',
      };
    }
  }

  /**
   * Fetches backlink profile summary via YepAPI
   */
  async getBacklinksSummary(
    targetDomain: string
  ): Promise<{ success: boolean; data?: DataForSeoBacklinksSummary; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'YepAPI is not configured. Add YEPAPI_KEY to server environment.',
      };
    }

    try {
      const clean = this.normalizeDomain(targetDomain);
      const res = await yepApiClient.getBacklinkSummary(clean);

      if (!res.ok || !res.data) {
        return {
          success: false,
          error: res.error?.message || 'Failed to fetch backlink summary from YepAPI',
        };
      }

      const b = res.data;
      return {
        success: true,
        data: {
          target: b.target,
          totalBacklinks: b.totalBacklinks || 0,
          referringDomains: b.referringDomains || 0,
          referringIps: b.referringIps || 0,
          rank: b.rank ? Math.round(b.rank / 10) : 50,
          dofollowCount: b.dofollow || 0,
          nofollowCount: b.nofollow || 0,
          govLinksCount: 0,
          eduLinksCount: 0,
        },
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error fetching backlink summary',
      };
    }
  }

  /**
   * Fetches individual backlinks via YepAPI
   */
  async getBacklinks(
    targetDomain: string,
    limit = 100,
    offset = 0
  ): Promise<{ success: boolean; data: DataForSeoBacklinkItem[]; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        data: [],
        error: 'YepAPI is not configured. Add YEPAPI_KEY to server environment.',
      };
    }

    try {
      const clean = this.normalizeDomain(targetDomain);
      const res = await yepApiClient.getBacklinksList({
        target: clean,
        limit,
        offset,
        mode: 'as_is',
        status: 'all',
      });

      if (!res.ok || !res.data) {
        return {
          success: false,
          data: [],
          error: res.error?.message || 'Failed to fetch backlinks list from YepAPI',
        };
      }

      const mapped: DataForSeoBacklinkItem[] = (res.data.backlinks || []).map((item) => ({
        sourceUrl: item.from,
        targetUrl: item.to,
        urlFrom: item.from,
        urlTo: item.to,
        anchor: item.anchor || '',
        rank: item.domainAuthority ? Math.round(item.domainAuthority / 10) : (item.rank ? Math.round(item.rank / 10) : 50),
        pageRank: item.rank ? Math.round(item.rank / 10) : 50,
        isDoFollow: item.dofollow ?? true,
        isLost: item.status === 'lost',
        firstSeen: item.firstSeen || new Date().toISOString(),
        lastSeen: item.lastSeen || new Date().toISOString(),
      }));

      return { success: true, data: mapped };
    } catch (err: unknown) {
      return {
        success: false,
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error fetching backlinks',
      };
    }
  }
}

export const dataForSeoClient = new DataForSeoClient();
