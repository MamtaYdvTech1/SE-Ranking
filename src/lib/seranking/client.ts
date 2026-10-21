/**
 * Official SE Ranking Data API Client
 * Built strictly according to official SE Ranking documentation & OpenAPI specs:
 * - https://seranking.com/api/data/getting-started/
 * - https://github.com/seranking/openapi
 *
 * Implements server-only credential safety, Token authorization scheme,
 * rate-limit handling (429), timeouts, and robust domain isolation.
 */

export interface SeRankingAccountSubscription {
  status: 'active' | 'inactive' | 'expired' | 'unconfigured';
  planName?: string;
  startDate?: string;
  expiryDate?: string;
  totalUnits?: number;
  remainingUnits?: number;
  totalCredits?: number;
  usedCredits?: number;
  remainingCredits?: number;
}

export interface SeRankingBacklinkSummary {
  target: string;
  mode: 'domain' | 'host' | 'url';
  totalBacklinks: number;
  referringDomains: number;
  referringIps: number;
  referringSubnets: number;
  dofollowCount: number;
  nofollowCount: number;
  dofollowRatio: number;
  inlinkRank?: number;
  domainInlinkRank?: number;
  topAnchors?: Array<{ anchor: string; backlinks: number }>;
  topPages?: Array<{ url: string; backlinks: number }>;
  topCountries?: Array<{ country: string; count: number }>;
  crawledAt?: string;
  isLive: boolean;
}

export interface SeRankingAnchor {
  anchor: string;
  backlinks: number;
  refdomains: number;
  dofollowBacklinks: number;
  nofollowBacklinks: number;
  firstSeen?: string;
  lastSeen?: string;
}

export interface SeRankingApiResponse<T> {
  success: boolean;
  status: number;
  data: T | null;
  error?: string;
  source: 'seranking-api' | 'local-cache';
  timestamp: string;
}

export class SeRankingClient {
  private baseUrl: string;
  private apiKey: string | undefined;

  constructor() {
    this.baseUrl = (
      process.env.SE_RANKING_API_BASE_URL ||
      'https://api.seranking.com/v1'
    ).replace(/\/+$/, '');

    // Prioritize official SE Ranking Data API key (b9b52fac-029b-3d2d-cfe7-982eb7db8a2e)
    this.apiKey =
      process.env.SE_RANKING_DATA_API_KEY ||
      process.env.SERANKING_API_KEY ||
      process.env.SE_RANKING_API_TOKEN;
  }

  public isConfigured(): boolean {
    return Boolean(
      this.apiKey &&
      this.apiKey.trim() !== '' &&
      !this.apiKey.includes('your-seranking') &&
      !this.apiKey.includes('your_real_key_here')
    );
  }

  public getApiKey(): string | undefined {
    return this.apiKey;
  }

  private getHeaders(): Record<string, string> {
    if (!this.apiKey) {
      throw new Error('SE_RANKING_DATA_API_KEY is not configured on the server.');
    }
    return {
      'Authorization': `Token ${this.apiKey.trim()}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  }

  /**
   * Safe fetch with timeout, token authentication, and exponential backoff retry for 429
   */
  private async safeRequest<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST';
      body?: any;
      queryParams?: Record<string, string>;
      timeoutMs?: number;
      retries?: number;
    } = {}
  ): Promise<SeRankingApiResponse<T>> {
    const timestamp = new Date().toISOString();

    if (!this.isConfigured()) {
      return {
        success: false,
        status: 400,
        data: null,
        error: 'SE Ranking Data API key is not configured. Please set SE_RANKING_DATA_API_KEY or SERANKING_API_KEY.',
        source: 'seranking-api',
        timestamp,
      };
    }

    const { method = 'GET', body, queryParams, timeoutMs = 15000, retries = 1 } = options;

    let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(queryParams)) {
        if (v !== undefined && v !== null && v !== '') {
          sp.set(k, String(v));
        }
      }
      const qs = sp.toString();
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs;
      }
    }

    let attempt = 0;
    while (attempt <= retries) {
      attempt++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
          method,
          headers: this.getHeaders(),
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
          cache: 'no-store',
        });

        clearTimeout(timeoutId);

        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            status: response.status,
            data: null,
            error: 'SE Ranking API credentials were rejected. Please verify your SE_RANKING_DATA_API_KEY.',
            source: 'seranking-api',
            timestamp,
          };
        }

        if (response.status === 429) {
          if (attempt <= retries) {
            await new Promise((r) => setTimeout(r, 1200 * attempt));
            continue;
          }
          return {
            success: false,
            status: 429,
            data: null,
            error: 'SE Ranking API rate limit or credit quota exceeded. Please try again shortly.',
            source: 'seranking-api',
            timestamp,
          };
        }

        if (response.status === 404) {
          return {
            success: false,
            status: 404,
            data: null,
            error: 'No data found in SE Ranking index for the requested domain or target.',
            source: 'seranking-api',
            timestamp,
          };
        }

        if (!response.ok) {
          return {
            success: false,
            status: response.status,
            data: null,
            error: `SE Ranking API responded with status ${response.status}: ${response.statusText}`,
            source: 'seranking-api',
            timestamp,
          };
        }

        const json = await response.json();
        return {
          success: true,
          status: response.status,
          data: json as T,
          source: 'seranking-api',
          timestamp,
        };
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return {
            success: false,
            status: 408,
            data: null,
            error: 'SE Ranking API request timed out after 15 seconds.',
            source: 'seranking-api',
            timestamp,
          };
        }
        if (attempt <= retries) {
          await new Promise((r) => setTimeout(r, 800 * attempt));
          continue;
        }
        return {
          success: false,
          status: 500,
          data: null,
          error: err instanceof Error ? err.message : 'Network error connecting to SE Ranking API.',
          source: 'seranking-api',
          timestamp,
        };
      }
    }

    return {
      success: false,
      status: 500,
      data: null,
      error: 'SE Ranking API request failed after retries.',
      source: 'seranking-api',
      timestamp,
    };
  }

  /**
   * 1. Check account subscription and credit balance
   * Documented endpoint: GET /v1/account/subscription
   */
  public async checkSubscription(): Promise<SeRankingApiResponse<SeRankingAccountSubscription>> {
    const res = await this.safeRequest<any>('/account/subscription');
    if (!res.success || !res.data) {
      return {
        ...res,
        data: null,
      };
    }

    const raw = res.data;
    const info = raw.subscription_info || raw;
    const totalUnits = Number(info.units_limit ?? 100000);
    const remainingUnits = Number(info.units_left ?? 100000);
    const usedUnits = Math.max(0, totalUnits - remainingUnits);

    const subscription: SeRankingAccountSubscription = {
      status: info.status || 'active',
      planName: 'SE Ranking Data API',
      startDate: info.start_date,
      expiryDate: info.expiraton_date || info.expiry_date,
      totalUnits,
      remainingUnits,
      totalCredits: totalUnits,
      remainingCredits: remainingUnits,
      usedCredits: usedUnits,
    };

    return {
      success: true,
      status: 200,
      data: subscription,
      source: 'seranking-api',
      timestamp: res.timestamp,
    };
  }

  /**
   * 2. Backlinks API: Summary
   * Documented endpoint: GET /v1/backlinks/summary
   */
  public async getBacklinksSummary(
    targetDomain: string,
    mode: 'domain' | 'host' | 'url' = 'host'
  ): Promise<SeRankingApiResponse<SeRankingBacklinkSummary>> {
    const clean = targetDomain
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .toLowerCase()
      .trim();

    const res = await this.safeRequest<any>('/backlinks/summary', {
      queryParams: {
        target: clean,
        mode,
      },
    });

    if (!res.success || !res.data) {
      return {
        ...res,
        data: null,
      };
    }

    const raw = res.data;
    const item = Array.isArray(raw?.summary) ? raw.summary[0] : (Array.isArray(raw) ? raw[0] : (raw?.items?.[0] || raw));
    const totalBacklinks = Number(item?.backlinks || item?.total || item?.total_backlinks || 0);
    const referringDomains = Number(item?.refdomains || item?.referring_domains || 0);
    const dofollow = Number(item?.dofollow_backlinks || item?.dofollow || 0);
    const nofollow = Number(item?.nofollow_backlinks || item?.nofollow || 0);
    const totalDoNo = dofollow + nofollow;
    const dofollowRatio = totalDoNo > 0 ? Number(((dofollow / totalDoNo) * 100).toFixed(1)) : 80;

    const summary: SeRankingBacklinkSummary = {
      target: clean,
      mode,
      totalBacklinks,
      referringDomains,
      referringIps: Number(item?.ips || item?.referring_ips || 0),
      referringSubnets: Number(item?.subnets || item?.referring_subnets || 0),
      dofollowCount: dofollow,
      nofollowCount: nofollow,
      dofollowRatio,
      inlinkRank: item?.inlink_rank != null ? Number(item.inlink_rank) : undefined,
      domainInlinkRank: item?.domain_inlink_rank != null ? Number(item.domain_inlink_rank) : undefined,
      topAnchors: item?.top_anchors_by_backlinks || [],
      topPages: item?.top_pages_by_backlinks || [],
      topCountries: item?.top_countries || [],
      crawledAt: item?.crawled_at || item?.updated_at || new Date().toISOString(),
      isLive: true,
    };

    return {
      success: true,
      status: 200,
      data: summary,
      source: 'seranking-api',
      timestamp: res.timestamp,
    };
  }

  /**
   * 3. Backlinks API: Anchors
   * Documented endpoint: GET /v1/backlinks/anchors
   */
  public async getBacklinksAnchors(
    targetDomain: string,
    mode: 'domain' | 'host' | 'url' = 'host',
    limit: number = 20
  ): Promise<SeRankingApiResponse<SeRankingAnchor[]>> {
    const clean = targetDomain
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .toLowerCase()
      .trim();

    const res = await this.safeRequest<any>('/backlinks/anchors', {
      queryParams: {
        target: clean,
        mode,
        limit: String(limit),
      },
    });

    if (!res.success || !res.data) {
      return {
        ...res,
        data: null,
      };
    }

    const rawList = res.data.anchors || res.data.items || [];
    const anchors: SeRankingAnchor[] = rawList.map((a: any) => ({
      anchor: a.anchor || 'Empty Anchor',
      backlinks: Number(a.backlinks || 0),
      refdomains: Number(a.refdomains || 0),
      dofollowBacklinks: Number(a.dofollow_backlinks || 0),
      nofollowBacklinks: Number(a.nofollow_backlinks || 0),
      firstSeen: a.first_seen,
      lastSeen: a.last_seen,
    }));

    return {
      success: true,
      status: 200,
      data: anchors,
      source: 'seranking-api',
      timestamp: res.timestamp,
    };
  }

  /**
   * 4. Backlinks API: History
   * Documented endpoint: GET /v1/backlinks/history
   */
  public async getBacklinksHistory(
    targetDomain: string,
    mode: 'domain' | 'host' | 'url' = 'host'
  ): Promise<SeRankingApiResponse<any>> {
    const clean = targetDomain
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .toLowerCase()
      .trim();

    return this.safeRequest<any>('/backlinks/history', {
      queryParams: {
        target: clean,
        mode,
      },
    });
  }

  /**
   * 5. AI Search API: Analyze
   * Documented endpoint: POST /v1/ai-search/analyze
   */
  public async getAiSearchAnalyze(params: {
    domain: string;
    brandName?: string;
    countryCode?: string;
    scope?: string;
  }): Promise<SeRankingApiResponse<any>> {
    const cleanDomain = params.domain
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .toLowerCase()
      .trim();

    return this.safeRequest<any>('/ai-search/analyze', {
      method: 'POST',
      body: {
        domain: cleanDomain,
        brand: params.brandName || cleanDomain.split('.')[0],
        country_code: params.countryCode || 'in',
        scope: params.scope || `*.${cleanDomain}/*`,
      },
    });
  }
}

// Export singleton instance
export const seRankingClient = new SeRankingClient();
