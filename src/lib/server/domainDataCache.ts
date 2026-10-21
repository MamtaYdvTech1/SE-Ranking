/**
 * Domain-Specific Server Data Isolation & Cache Manager
 *
 * Guarantees that:
 * 1. Every query & cache entry is keyed strictly by workspace/user, normalized domain,
 *    feature, country, search engine, and date range.
 * 2. Cross-domain data leakage is completely prevented.
 * 3. Switching from Domain A to Domain B always invalidates and fetches Domain B's data freshly.
 * 4. Stale results are never served across different domains.
 */

export interface CacheEntry<T> {
  workspaceId: string;
  normalizedDomain: string;
  feature: string;
  country: string;
  searchEngine: string;
  dateRange: string;
  data: T;
  status: 'LIVE' | 'CACHED' | 'EMPTY' | 'UNAVAILABLE';
  source: string;
  updatedAt: string;
  expiresAt: number;
}

class DomainDataCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTtlMs = 15 * 60 * 1000; // 15 minutes

  /**
   * Normalizes a target domain to lowercase hostname without protocol, www, or trailing paths.
   */
  public normalizeTargetDomain(rawDomain: string): string {
    if (!rawDomain) return '';
    return rawDomain
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/.*$/, '')
      .toLowerCase()
      .trim();
  }

  /**
   * Builds an unambiguous, isolated cache key.
   */
  public buildKey(params: {
    workspaceId: string;
    domain: string;
    feature: string;
    country?: string;
    searchEngine?: string;
    dateRange?: string;
  }): string {
    const cleanDomain = this.normalizeTargetDomain(params.domain);
    const ws = params.workspaceId || 'global';
    const feat = (params.feature || 'general').toLowerCase();
    const ctry = (params.country || 'all').toLowerCase();
    const eng = (params.searchEngine || 'google').toLowerCase();
    const range = (params.dateRange || 'default').toLowerCase();

    return `${ws}:${cleanDomain}:${feat}:${ctry}:${eng}:${range}`;
  }

  public get<T>(params: {
    workspaceId: string;
    domain: string;
    feature: string;
    country?: string;
    searchEngine?: string;
    dateRange?: string;
  }): CacheEntry<T> | null {
    const key = this.buildKey(params);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Defensive check: ensure normalized domain matches exactly
    const targetDomain = this.normalizeTargetDomain(params.domain);
    if (entry.normalizedDomain !== targetDomain) {
      this.cache.delete(key);
      return null;
    }

    return entry as CacheEntry<T>;
  }

  public set<T>(
    params: {
      workspaceId: string;
      domain: string;
      feature: string;
      country?: string;
      searchEngine?: string;
      dateRange?: string;
    },
    data: T,
    options: {
      status?: 'LIVE' | 'CACHED' | 'EMPTY' | 'UNAVAILABLE';
      source?: string;
      ttlMs?: number;
    } = {}
  ): CacheEntry<T> {
    const key = this.buildKey(params);
    const normalizedDomain = this.normalizeTargetDomain(params.domain);
    const ttl = options.ttlMs || this.defaultTtlMs;
    const now = new Date();

    const entry: CacheEntry<T> = {
      workspaceId: params.workspaceId || 'global',
      normalizedDomain,
      feature: (params.feature || 'general').toLowerCase(),
      country: (params.country || 'all').toLowerCase(),
      searchEngine: (params.searchEngine || 'google').toLowerCase(),
      dateRange: (params.dateRange || 'default').toLowerCase(),
      data,
      status: options.status || 'LIVE',
      source: options.source || 'seranking-api',
      updatedAt: now.toISOString(),
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(key, entry);
    return entry;
  }

  public invalidateDomain(domain: string, workspaceId?: string): void {
    const clean = this.normalizeTargetDomain(domain);
    for (const [key, entry] of this.cache.entries()) {
      if (entry.normalizedDomain === clean) {
        if (!workspaceId || entry.workspaceId === workspaceId) {
          this.cache.delete(key);
        }
      }
    }
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const domainDataCache = new DomainDataCacheManager();
