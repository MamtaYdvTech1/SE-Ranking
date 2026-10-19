/**
 * YepAPI Universal SEO Client & Service
 * Official integration for YepAPI (https://api.yepapi.com)
 *
 * Supported Capabilities:
 * - Google SERP (live organic results, featured snippets, people also ask)
 * - Keyword Research & Metrics (volume, CPC, difficulty, competition, intent, trend)
 * - Keyword Ideas (seed keyword suggestions)
 * - Keyword Difficulty (bulk difficulty scoring)
 * - Backlink Analysis (summary, backlinks list, referring domains)
 * - Competitor SEO Research (domain overview, competitor domains, keyword gap)
 */

export interface YepApiError {
  code: string;
  message: string;
  statusCode?: number;
}

export interface YepApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: YepApiError;
  requestId?: string;
  cached?: boolean;
  retrievedAt: string;
  costEstimateUsd?: number;
}

// ---------------------------------------------------------------------------
// 1. Google SERP Types
// ---------------------------------------------------------------------------
export interface GoogleSerpParams {
  query: string;
  depth?: number; // 10 to 100, default 10
  location_code?: number;
  location_name?: string;
  language?: string;
  device?: 'desktop' | 'mobile';
  stop_at_domain?: string;
}

export interface GoogleSerpItem {
  position: number;
  type: string; // 'organic' | 'paid' | 'localPack' | 'peopleAlsoAsk' | etc.
  title: string;
  url: string;
  description: string;
  domain: string;
  data?: {
    breadcrumb?: string;
    isFeaturedSnippet?: boolean;
    rating?: { value: number; votesCount: number };
    items?: Array<{ title: string; expandedElement?: Array<{ title: string; url: string; domain: string }> }>;
    [key: string]: unknown;
  };
}

export interface GoogleSerpData {
  query: string;
  totalResults: number;
  itemTypes?: string[];
  results: GoogleSerpItem[];
  pagesFetched?: number;
}

// ---------------------------------------------------------------------------
// 2. Keyword Metrics Types
// ---------------------------------------------------------------------------
export interface KeywordMetricsParams {
  keywords: string[];
  location_code?: number;
  language?: string;
  filters?: Array<{ field: string; op: string; value: unknown }>;
  sort?: string[];
}

export interface KeywordMetricItem {
  keyword: string;
  volume: number;
  cpc: number;
  difficulty: number;
  competition: number;
  competitionLevel?: string;
  intent?: string;
  avgBacklinks?: number;
  avgReferringDomains?: number;
  serpFeatures?: string[];
  totalResults?: number;
  trend?: Array<{ year: number; month: number; volume: number }>;
}

export interface KeywordMetricsData {
  keywords: KeywordMetricItem[];
  skipped?: Array<{ keyword: string; reason: string }>;
}

// ---------------------------------------------------------------------------
// 3. Keyword Ideas Types
// ---------------------------------------------------------------------------
export interface KeywordIdeasParams {
  keyword: string;
  limit?: number;
  location_code?: number;
  language?: string;
  filters?: Array<{ field: string; op: string; value: unknown }>;
  sort?: string[];
}

export interface KeywordIdeasData {
  seed: string;
  keywords: KeywordMetricItem[];
}

// ---------------------------------------------------------------------------
// 4. Keyword Difficulty Types
// ---------------------------------------------------------------------------
export interface KeywordDifficultyParams {
  keywords: string[];
  location?: string;
  language?: string;
}

export interface KeywordDifficultyItem {
  keyword: string;
  difficulty: number;
}

export interface KeywordDifficultyData {
  keywords: KeywordDifficultyItem[];
}

// ---------------------------------------------------------------------------
// 5. Backlink Types
// ---------------------------------------------------------------------------
export interface BacklinkSummaryData {
  target: string;
  totalBacklinks: number;
  referringDomains: number;
  referringMainDomains?: number;
  referringPages: number;
  referringIps?: number;
  referringSubnets?: number;
  dofollow: number;
  nofollow: number;
  brokenBacklinks: number;
  brokenPages?: number;
  spamScore?: number;
  rank?: number;
  firstSeen?: string;
}

export interface BacklinksListParams {
  target: string;
  limit?: number; // max 1000, default 100
  offset?: number;
  mode?: 'as_is' | 'one_per_domain' | 'one_per_anchor';
  status?: 'live' | 'lost' | 'all';
  dofollow?: boolean;
  broken?: boolean;
  sort?: string;
}

export interface BacklinkListItem {
  anchor: string;
  dofollow: boolean;
  domainAuthority?: number;
  firstSeen: string;
  from: string;
  fromDomain: string;
  lastSeen: string;
  spamScore: number;
  status: string;
  rank: number;
  isBroken: boolean;
  to: string;
}

export interface BacklinksListData {
  target: string;
  total: number;
  backlinks: BacklinkListItem[];
}

export interface ReferringDomainsParams {
  target: string;
  limit?: number;
  offset?: number;
  status?: 'live' | 'lost' | 'all';
  sort?: string;
}

export interface ReferringDomainItem {
  domain: string;
  rank: number;
  backlinks: number;
  dofollow: number;
  referringPages: number;
  spamScore: number;
  brokenBacklinks: number;
  firstSeen: string;
  lastSeen?: string;
}

export interface ReferringDomainsData {
  target: string;
  total: number;
  referringDomains: ReferringDomainItem[];
}

// ---------------------------------------------------------------------------
// 6. Competitor SEO Types
// ---------------------------------------------------------------------------
export interface DomainOverviewParams {
  domain: string;
  location_code?: number;
  language?: string;
}

export interface DomainOverviewData {
  domain: string;
  domainRank: number;
  organicTraffic: number;
  organicKeywords: number;
  backlinks: number;
  referringDomains: number;
}

export interface CompetitorDomainsParams {
  domain: string;
  location_code?: number;
  language?: string;
  limit?: number;
}

export interface CompetitorDomainItem {
  domain: string;
  avgPosition: number;
  intersections: number;
  organicCount: number;
  organicEtv: number;
}

export interface CompetitorDomainsData {
  domain: string;
  competitors: CompetitorDomainItem[];
}

export interface CompetitorKeywordsParams {
  domain1: string;
  domain2: string;
  intersections?: boolean; // true = shared, false = gap
  location_code?: number;
  language?: string;
  limit?: number;
}

export interface CompetitorKeywordsData {
  domain1: string;
  domain2: string;
  keywords: Array<KeywordMetricItem & { domain1Position?: number; domain2Position?: number }>;
}

/**
 * Maps common country codes (ISO alpha-2/alpha-3) to YepAPI / Google location_code integers.
 * Default is 2840 (United States).
 */
export function mapCountryToLocationCode(countryCode?: string): number {
  if (!countryCode) return 2840;
  const code = countryCode.toLowerCase().trim();
  const map: Record<string, number> = {
    us: 2840,
    usa: 2840,
    in: 2356,
    ind: 2356,
    uk: 2826,
    gb: 2826,
    ca: 2124,
    au: 2036,
    de: 2276,
    fr: 2250,
    es: 2724,
    it: 2380,
    nl: 2528,
    jp: 2392,
    br: 2076,
    ae: 2784,
    sg: 2702,
  };
  return map[code] || 2840;
}

// ---------------------------------------------------------------------------
// Main YepApiClient Class
// ---------------------------------------------------------------------------
export class YepApiClient {
  private readonly baseUrl = 'https://api.yepapi.com';
  private readonly defaultTimeoutMs = 25000;
  private readonly responseCache = new Map<string, { expiresAt: number; data: unknown; cost: number }>();
  private readonly inFlightRequests = new Map<string, Promise<YepApiResponse<unknown>>>();

  /**
   * Normalizes target domain to hostname only (stripping protocol, www, trailing slashes, and paths).
   */
  public normalizeTargetDomain(target: string): string {
    if (!target) return '';
    return target
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0]
      .split('?')[0]
      .split('#')[0]
      .toLowerCase()
      .trim();
  }

  /**
   * Cleans keyword string to meet upstream validity rules:
   * non-empty, max 80 chars, max 10 words, letters, numbers, hyphens, apostrophes.
   */
  public normalizeKeyword(keyword: string): string {
    if (!keyword) return '';
    return keyword
      .replace(/[^\w\s\-']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80);
  }

  /**
   * Validates server-side environment variable. Never exposes value.
   */
  public isConfigured(): boolean {
    const key = process.env.YEPAPI_KEY;
    return Boolean(key && key.trim().startsWith('yep_sk_') && key.trim().length > 10);
  }

  private getApiKey(): string {
    const key = process.env.YEPAPI_KEY;
    if (!key || key.trim() === '') {
      throw new Error('YEPAPI_KEY is not configured in server environment. Please set YEPAPI_KEY in .env.local.');
    }
    return key.trim();
  }

  /**
   * Core request dispatcher with deduplication, in-memory caching, timeout handling, and cost estimation.
   */
  public async post<T>(
    endpoint: string,
    body: Record<string, unknown>,
    options?: {
      timeoutMs?: number;
      bypassCache?: boolean;
      cacheTtlMs?: number;
      estimatedCostUsd?: number;
    }
  ): Promise<YepApiResponse<T>> {
    const retrievedAt = new Date().toISOString();

    if (!this.isConfigured()) {
      return {
        ok: false,
        retrievedAt,
        error: {
          code: 'UNCONFIGURED_API_KEY',
          message: 'YepAPI is not configured. Add YEPAPI_KEY to server environment variables.',
          statusCode: 503,
        },
      };
    }

    const cacheKey = `${endpoint}::${JSON.stringify(body)}`;
    const now = Date.now();

    // 1. Check cache
    if (!options?.bypassCache) {
      const cachedEntry = this.responseCache.get(cacheKey);
      if (cachedEntry && cachedEntry.expiresAt > now) {
        return {
          ok: true,
          data: cachedEntry.data as T,
          cached: true,
          retrievedAt,
          costEstimateUsd: 0,
        };
      }
    }

    // 2. Check in-flight promise deduplication
    const activePromise = this.inFlightRequests.get(cacheKey);
    if (activePromise) {
      const sharedRes = await activePromise;
      return sharedRes as YepApiResponse<T>;
    }

    // 3. Dispatch fresh request
    const executionPromise = (async (): Promise<YepApiResponse<T>> => {
      const controller = new AbortController();
      const timeoutMs = options?.timeoutMs || this.defaultTimeoutMs;
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const apiKey = this.getApiKey();
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutHandle);

        const text = await response.text();
        let payload: any;
        try {
          payload = JSON.parse(text);
        } catch {
          return {
            ok: false,
            retrievedAt: new Date().toISOString(),
            error: {
              code: 'MALFORMED_UPSTREAM_RESPONSE',
              message: `YepAPI returned non-JSON response (${response.status})`,
              statusCode: response.status,
            },
          };
        }

        // Check YepAPI standard error format
        if (!response.ok || payload.ok === false) {
          const errCode = payload.error?.code || `HTTP_${response.status}`;
          let message = payload.error?.message || response.statusText || 'Upstream request failed';

          if (errCode === 'NO_CREDITS' || response.status === 402) {
            message = 'YepAPI credit balance exhausted. Please top up your YepAPI balance to proceed.';
          } else if (errCode === 'INVALID_API_KEY' || response.status === 401) {
            message = 'Invalid YepAPI API key. Check YEPAPI_KEY configuration.';
          }

          return {
            ok: false,
            retrievedAt: new Date().toISOString(),
            error: {
              code: errCode,
              message,
              statusCode: response.status,
            },
          };
        }

        const data: T = payload.data !== undefined ? payload.data : payload;
        const ttlMs = options?.cacheTtlMs ?? (15 * 60 * 1000); // 15 mins default TTL
        const costEstimateUsd = options?.estimatedCostUsd ?? 0;

        if (ttlMs > 0) {
          this.responseCache.set(cacheKey, {
            expiresAt: Date.now() + ttlMs,
            data,
            cost: costEstimateUsd,
          });
        }

        return {
          ok: true,
          data,
          cached: false,
          retrievedAt: new Date().toISOString(),
          costEstimateUsd,
        };
      } catch (err: unknown) {
        clearTimeout(timeoutHandle);
        const isAbort = err instanceof Error && err.name === 'AbortError';
        return {
          ok: false,
          retrievedAt: new Date().toISOString(),
          error: {
            code: isAbort ? 'TIMEOUT' : 'NETWORK_ERROR',
            message: isAbort
              ? `YepAPI request timed out after ${timeoutMs}ms.`
              : err instanceof Error
              ? err.message
              : 'Unknown connection failure to YepAPI',
            statusCode: isAbort ? 504 : 502,
          },
        };
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, executionPromise);
    return executionPromise;
  }

  // -------------------------------------------------------------------------
  // High-Level Domain Methods
  // -------------------------------------------------------------------------

  /**
   * Google SERP: POST /v1/serp/google ($0.01 per 10 results)
   */
  public async getGoogleSerp(params: GoogleSerpParams): Promise<YepApiResponse<GoogleSerpData>> {
    const depth = Math.min(100, Math.max(10, params.depth || 10));
    const pages = Math.ceil(depth / 10);
    const estimatedCostUsd = pages * 0.01;

    return this.post<GoogleSerpData>(
      '/v1/serp/google',
      {
        query: params.query.trim(),
        depth,
        location_code: params.location_code,
        location_name: params.location_name,
        language: params.language || 'en',
        device: params.device || 'desktop',
        stop_at_domain: params.stop_at_domain ? this.normalizeTargetDomain(params.stop_at_domain) : undefined,
      },
      {
        estimatedCostUsd,
        cacheTtlMs: 30 * 60 * 1000, // 30 mins cache for SERP
      }
    );
  }

  /**
   * Alias for getGoogleSerp
   */
  public async getSerpResults(query: string, options?: { country?: string; depth?: number; num?: number }): Promise<YepApiResponse<GoogleSerpData>> {
    return this.getGoogleSerp({
      query,
      location_name: options?.country,
      depth: options?.depth || options?.num || 10,
    });
  }

  /**
   * Bulk Keyword Metrics: POST /v1/seo/keywords ($0.15/call)
   */
  public async getKeywords(params: KeywordMetricsParams): Promise<YepApiResponse<KeywordMetricsData>> {
    const validKeywords = (params.keywords || [])
      .map((k) => this.normalizeKeyword(k))
      .filter((k) => k.length > 0)
      .slice(0, 100);

    if (validKeywords.length === 0) {
      return {
        ok: true,
        data: { keywords: [], skipped: [] },
        retrievedAt: new Date().toISOString(),
      };
    }

    return this.post<KeywordMetricsData>(
      '/v1/seo/keywords',
      {
        keywords: validKeywords,
        location_code: params.location_code,
        language: params.language || 'en',
        filters: params.filters,
        sort: params.sort,
      },
      {
        estimatedCostUsd: 0.15,
        cacheTtlMs: 60 * 60 * 1000, // 1 hour cache
      }
    );
  }

  /**
   * Keyword Ideas: POST /v1/seo/keywords/ideas (from $0.03 + $0.03/100 keywords)
   */
  public async getKeywordIdeas(params: KeywordIdeasParams): Promise<YepApiResponse<KeywordIdeasData>> {
    const cleanSeed = this.normalizeKeyword(params.keyword);
    if (!cleanSeed) {
      return {
        ok: true,
        data: { seed: '', keywords: [] },
        retrievedAt: new Date().toISOString(),
      };
    }

    const limit = Math.min(250, Math.max(5, params.limit || 50));
    const estimatedCostUsd = Number((0.03 + Math.ceil(limit / 100) * 0.03).toFixed(2));

    return this.post<KeywordIdeasData>(
      '/v1/seo/keywords/ideas',
      {
        keyword: cleanSeed,
        limit,
        location_code: params.location_code,
        language: params.language || 'en',
        filters: params.filters,
        sort: params.sort,
      },
      {
        estimatedCostUsd,
        cacheTtlMs: 2 * 60 * 60 * 1000, // 2 hours cache
      }
    );
  }

  /**
   * Keyword Difficulty: POST /v1/seo/keywords/difficulty (from $0.03 + $0.03/100 keywords)
   */
  public async getKeywordDifficulty(params: KeywordDifficultyParams): Promise<YepApiResponse<KeywordDifficultyData>> {
    const validKeywords = (params.keywords || [])
      .map((k) => this.normalizeKeyword(k))
      .filter((k) => k.length > 0)
      .slice(0, 500);

    if (validKeywords.length === 0) {
      return {
        ok: true,
        data: { keywords: [] },
        retrievedAt: new Date().toISOString(),
      };
    }

    const estimatedCostUsd = Number((0.03 + Math.ceil(validKeywords.length / 100) * 0.03).toFixed(2));

    return this.post<KeywordDifficultyData>(
      '/v1/seo/keywords/difficulty',
      {
        keywords: validKeywords,
        location: params.location || 'us',
        language: params.language || 'en',
      },
      {
        estimatedCostUsd,
        cacheTtlMs: 24 * 60 * 60 * 1000, // 24 hours cache for KD
      }
    );
  }

  /**
   * Backlink Profile Summary: POST /v1/seo/backlinks/summary ($0.05/call)
   */
  public async getBacklinkSummary(target: string): Promise<YepApiResponse<BacklinkSummaryData>> {
    const cleanTarget = this.normalizeTargetDomain(target);
    if (!cleanTarget) {
      return {
        ok: false,
        retrievedAt: new Date().toISOString(),
        error: { code: 'INVALID_TARGET', message: 'Target domain or URL is required' },
      };
    }

    return this.post<BacklinkSummaryData>(
      '/v1/seo/backlinks/summary',
      { target: cleanTarget },
      {
        estimatedCostUsd: 0.05,
        cacheTtlMs: 6 * 60 * 60 * 1000, // 6 hours cache
      }
    );
  }

  /**
   * Alias for getBacklinkSummary (plural form support)
   */
  public async getBacklinksSummary(target: string): Promise<YepApiResponse<BacklinkSummaryData>> {
    return this.getBacklinkSummary(target);
  }

  /**
   * Backlinks List: POST /v1/seo/backlinks/list (from $0.05 + $0.01/100 rows)
   */
  public async getBacklinksList(params: BacklinksListParams): Promise<YepApiResponse<BacklinksListData>> {
    const cleanTarget = this.normalizeTargetDomain(params.target);
    if (!cleanTarget) {
      return {
        ok: false,
        retrievedAt: new Date().toISOString(),
        error: { code: 'INVALID_TARGET', message: 'Target domain is required' },
      };
    }

    const limit = Math.min(500, Math.max(10, params.limit || 100));
    const estimatedCostUsd = Number((0.05 + Math.ceil(limit / 100) * 0.01).toFixed(2));

    return this.post<BacklinksListData>(
      '/v1/seo/backlinks/list',
      {
        target: cleanTarget,
        limit,
        offset: params.offset || 0,
        mode: params.mode || 'as_is',
        status: params.status || 'live',
        dofollow: params.dofollow,
        broken: params.broken,
        sort: params.sort || 'rank:desc',
      },
      {
        estimatedCostUsd,
        cacheTtlMs: 6 * 60 * 60 * 1000,
      }
    );
  }

  /**
   * Referring Domains: POST /v1/seo/backlinks/referring-domains (from $0.05 + $0.01/100 rows)
   */
  public async getReferringDomains(params: ReferringDomainsParams): Promise<YepApiResponse<ReferringDomainsData>> {
    const cleanTarget = this.normalizeTargetDomain(params.target);
    if (!cleanTarget) {
      return {
        ok: false,
        retrievedAt: new Date().toISOString(),
        error: { code: 'INVALID_TARGET', message: 'Target domain is required' },
      };
    }

    const limit = Math.min(500, Math.max(10, params.limit || 50));
    const estimatedCostUsd = Number((0.05 + Math.ceil(limit / 100) * 0.01).toFixed(2));

    return this.post<ReferringDomainsData>(
      '/v1/seo/backlinks/referring-domains',
      {
        target: cleanTarget,
        limit,
        offset: params.offset || 0,
        status: params.status || 'live',
        sort: params.sort || 'rank:desc',
      },
      {
        estimatedCostUsd,
        cacheTtlMs: 6 * 60 * 60 * 1000,
      }
    );
  }

  /**
   * Domain Overview: POST /v1/seo/domain/overview ($0.08/call)
   */
  public async getDomainOverview(params: DomainOverviewParams): Promise<YepApiResponse<DomainOverviewData>> {
    const cleanDomain = this.normalizeTargetDomain(params.domain);
    if (!cleanDomain) {
      return {
        ok: false,
        retrievedAt: new Date().toISOString(),
        error: { code: 'INVALID_DOMAIN', message: 'Domain is required' },
      };
    }

    return this.post<DomainOverviewData>(
      '/v1/seo/domain/overview',
      {
        domain: cleanDomain,
        location_code: params.location_code,
        language: params.language || 'en',
      },
      {
        estimatedCostUsd: 0.08,
        cacheTtlMs: 4 * 60 * 60 * 1000,
      }
    );
  }

  /**
   * Competitor Domains: POST /v1/seo/competitors/domain (from $0.03 + $0.03/100 domains)
   */
  public async getCompetitorDomains(params: CompetitorDomainsParams): Promise<YepApiResponse<CompetitorDomainsData>> {
    const cleanDomain = this.normalizeTargetDomain(params.domain);
    if (!cleanDomain) {
      return {
        ok: false,
        retrievedAt: new Date().toISOString(),
        error: { code: 'INVALID_DOMAIN', message: 'Domain is required' },
      };
    }

    const limit = Math.min(200, Math.max(5, params.limit || 50));
    const estimatedCostUsd = Number((0.03 + Math.ceil(limit / 100) * 0.03).toFixed(2));

    return this.post<CompetitorDomainsData>(
      '/v1/seo/competitors/domain',
      {
        domain: cleanDomain,
        location_code: params.location_code,
        language: params.language || 'en',
        limit,
      },
      {
        estimatedCostUsd,
        cacheTtlMs: 6 * 60 * 60 * 1000,
      }
    );
  }

  /**
   * Keyword Gap Analysis: POST /v1/seo/competitors/keywords (from $0.03 + $0.03/100 keywords)
   */
  public async getCompetitorKeywords(params: CompetitorKeywordsParams): Promise<YepApiResponse<CompetitorKeywordsData>> {
    const cleanDomain1 = this.normalizeTargetDomain(params.domain1);
    const cleanDomain2 = this.normalizeTargetDomain(params.domain2);

    if (!cleanDomain1 || !cleanDomain2) {
      return {
        ok: false,
        retrievedAt: new Date().toISOString(),
        error: { code: 'INVALID_DOMAINS', message: 'Both domain1 and domain2 are required' },
      };
    }

    const limit = Math.min(200, Math.max(10, params.limit || 50));
    const estimatedCostUsd = Number((0.03 + Math.ceil(limit / 100) * 0.03).toFixed(2));

    return this.post<CompetitorKeywordsData>(
      '/v1/seo/competitors/keywords',
      {
        domain1: cleanDomain1,
        domain2: cleanDomain2,
        intersections: params.intersections !== undefined ? params.intersections : true,
        location_code: params.location_code,
        language: params.language || 'en',
        limit,
      },
      {
        estimatedCostUsd,
        cacheTtlMs: 6 * 60 * 60 * 1000,
      }
    );
  }
}

// Global server singleton
export const yepApiClient = new YepApiClient();
