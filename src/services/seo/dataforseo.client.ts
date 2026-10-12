/**
 * DataForSEO Universal SEO API Client
 * Enterprise-grade client for live SERP tracking, keyword research,
 * search volume, keyword difficulty, competitor discovery, and backlinks.
 */

export interface DataForSeoCredentials {
  login: string;
  password: string;
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
  anchor: string;
  rank: number;
  pageRank: number;
  isDoFollow: boolean;
  isLost: boolean;
  firstSeen: string;
  lastSeen: string;
}

export class DataForSeoClient {
  private login?: string;
  private password?: string;
  private baseUrl = 'https://api.dataforseo.com/v3';

  constructor() {
    this.login = process.env.DATAFORSEO_LOGIN;
    this.password = process.env.DATAFORSEO_PASSWORD || process.env.DATAFORSEO_API_KEY;
  }

  /**
   * Checks if valid DataForSEO credentials are provided in environment variables.
   * Never invents or assumes credentials.
   */
  isConfigured(): boolean {
    return Boolean(
      this.login &&
      this.login.trim() !== '' &&
      this.password &&
      this.password.trim() !== '' &&
      !this.login.includes('your_') &&
      !this.password.includes('your_')
    );
  }

  private getAuthHeader(): string {
    if (!this.login || !this.password) return '';
    return 'Basic ' + Buffer.from(`${this.login.trim()}:${this.password.trim()}`).toString('base64');
  }

  /**
   * Fetches real keyword search volume and CPC using DataForSEO Google Ads API
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
        error: 'DataForSEO credentials are not configured. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD.',
      };
    }

    if (keywords.length === 0) {
      return { success: true, data: [] };
    }

    try {
      const locationCode = this.mapCountryToLocationCode(countryCode);
      const payload = [
        {
          keywords: keywords.slice(0, 100),
          location_code: locationCode,
          language_code: languageCode,
        },
      ];

      const res = await fetch(`${this.baseUrl}/keywords_data/google_ads/search_volume/live`, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        return {
          success: false,
          data: [],
          error: `DataForSEO API responded with status ${res.status}: ${res.statusText}`,
        };
      }

      const json = await res.json();
      const items = json.tasks?.[0]?.result || [];

      const metrics: DataForSeoKeywordMetrics[] = items.map((item: any) => ({
        keyword: item.keyword,
        searchVolume: item.search_volume || 0,
        cpc: item.cpc || 0,
        competition: item.competition || 0,
        monthlySearches: item.monthly_searches || [],
      }));

      return { success: true, data: metrics };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch search volume from DataForSEO';
      return { success: false, data: [], error: msg };
    }
  }

  /**
   * Fetches real keyword suggestions & keyword difficulty using DataForSEO Labs
   */
  async getKeywordSuggestions(
    keyword: string,
    countryCode = 'us',
    languageCode = 'en',
    limit = 20
  ): Promise<{ success: boolean; data: DataForSeoKeywordMetrics[]; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        data: [],
        error: 'DataForSEO credentials are not configured. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD.',
      };
    }

    try {
      const locationCode = this.mapCountryToLocationCode(countryCode);
      const payload = [
        {
          keyword: keyword.trim(),
          location_code: locationCode,
          language_code: languageCode,
          limit,
        },
      ];

      const res = await fetch(`${this.baseUrl}/dataforseo_labs/google/keyword_suggestions/live`, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        return {
          success: false,
          data: [],
          error: `DataForSEO API responded with status ${res.status}: ${res.statusText}`,
        };
      }

      const json = await res.json();
      const items = json.tasks?.[0]?.result?.[0]?.items || [];

      const suggestions: DataForSeoKeywordMetrics[] = items.map((item: any) => ({
        keyword: item.keyword,
        searchVolume: item.keyword_info?.search_volume || 0,
        cpc: item.keyword_info?.cpc || 0,
        competition: item.keyword_info?.competition_level || 0,
        keywordDifficulty: item.keyword_properties?.keyword_difficulty || 0,
        intent: item.search_intent_info?.main_intent || 'Commercial',
      }));

      return { success: true, data: suggestions };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch keyword suggestions from DataForSEO';
      return { success: false, data: [], error: msg };
    }
  }

  /**
   * Fetches real organic competitors for a target domain using DataForSEO Labs
   */
  async getCompetitors(
    targetDomain: string,
    countryCode = 'us',
    languageCode = 'en',
    limit = 10
  ): Promise<{ success: boolean; data: DataForSeoCompetitorItem[]; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        data: [],
        error: 'DataForSEO credentials are not configured. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD.',
      };
    }

    try {
      const cleanDomain = targetDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '');
      const locationCode = this.mapCountryToLocationCode(countryCode);
      const payload = [
        {
          target: cleanDomain,
          location_code: locationCode,
          language_code: languageCode,
          limit,
        },
      ];

      const res = await fetch(`${this.baseUrl}/dataforseo_labs/google/competitors_domain/live`, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        return {
          success: false,
          data: [],
          error: `DataForSEO API responded with status ${res.status}: ${res.statusText}`,
        };
      }

      const json = await res.json();
      const items = json.tasks?.[0]?.result?.[0]?.items || [];

      const competitors: DataForSeoCompetitorItem[] = items.map((item: any) => ({
        domain: item.domain || '',
        avgPosition: Math.round(item.avg_position || 15),
        intersections: item.intersections || 0,
        fullDomainMetrics: {
          organicTraffic: item.full_domain_metrics?.organic_traffic || 0,
          organicKeywords: item.full_domain_metrics?.organic_count || 0,
        },
      }));

      return { success: true, data: competitors };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch competitors from DataForSEO';
      return { success: false, data: [], error: msg };
    }
  }

  /**
   * Fetches real backlinks summary using DataForSEO Backlinks API
   */
  async getBacklinksSummary(
    targetDomain: string
  ): Promise<{ success: boolean; data?: DataForSeoBacklinksSummary; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'DataForSEO credentials are not configured. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD.',
      };
    }

    try {
      const cleanDomain = targetDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '');
      const payload = [{ target: cleanDomain }];

      const res = await fetch(`${this.baseUrl}/backlinks/summary/live`, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        return {
          success: false,
          error: `DataForSEO Backlinks API responded with status ${res.status}: ${res.statusText}`,
        };
      }

      const json = await res.json();
      const item = json.tasks?.[0]?.result?.[0] || {};

      const summary: DataForSeoBacklinksSummary = {
        target: cleanDomain,
        totalBacklinks: item.backlinks || 0,
        referringDomains: item.referring_domains || 0,
        referringIps: item.referring_ips || 0,
        rank: item.rank || 0,
        dofollowCount: item.dofollow || 0,
        nofollowCount: item.nofollow || 0,
        govLinksCount: item.gov || 0,
        eduLinksCount: item.edu || 0,
      };

      return { success: true, data: summary };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch backlinks summary from DataForSEO';
      return { success: false, error: msg };
    }
  }

  /**
   * Maps 2-letter ISO country code to DataForSEO location codes
   */
  private mapCountryToLocationCode(countryCode = 'us'): number {
    const code = countryCode.toLowerCase();
    const map: Record<string, number> = {
      us: 2840, // United States
      in: 2356, // India
      uk: 2826, // United Kingdom
      gb: 2826, // Great Britain
      ca: 2124, // Canada
      au: 2036, // Australia
      de: 2276, // Germany
      fr: 2250, // France
      es: 2724, // Spain
      it: 2380, // Italy
      nl: 2528, // Netherlands
      jp: 2392, // Japan
      br: 2076, // Brazil
      ae: 2784, // United Arab Emirates
      sg: 2702, // Singapore
    };
    return map[code] || 2840;
  }
}

// Singleton instance
export const dataForSeoClient = new DataForSeoClient();
