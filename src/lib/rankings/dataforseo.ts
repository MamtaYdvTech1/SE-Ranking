/**
 * DataForSEO Live SERP Ranking Provider
 * Real organic ranking checking via DataForSEO SERP API v3
 */

import {
  RankingProvider,
  KeywordCheckRequest,
  ProviderCheckResponse,
  KeywordCheckResult,
  EngineCapability,
} from './types';
import { urlMatchesTarget } from './google';

export class DataForSeoProvider implements RankingProvider {
  readonly id = 'dataforseo';
  readonly name = 'DataForSEO SERP v3';

  private login: string | undefined;
  private password: string | undefined;
  private baseUrl = 'https://api.dataforseo.com/v3/serp';

  constructor() {
    this.login = process.env.DATAFORSEO_LOGIN;
    this.password = process.env.DATAFORSEO_PASSWORD || process.env.DATAFORSEO_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(
      this.login &&
      this.login.trim() !== '' &&
      this.password &&
      this.password.trim() !== '' &&
      !this.login.includes('your_')
    );
  }

  getEngineCapabilities(): EngineCapability[] {
    const configured = this.isConfigured();
    return [
      {
        engine: 'google',
        name: 'Google Organic Search',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: true,
        notes: configured ? 'Active via DataForSEO' : 'Requires DATAFORSEO_LOGIN & PASSWORD',
      },
      {
        engine: 'bing',
        name: 'Microsoft Bing',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: true,
        notes: configured ? 'Active via DataForSEO' : 'Requires DATAFORSEO_LOGIN & PASSWORD',
      },
      {
        engine: 'yahoo',
        name: 'Yahoo Search',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: false,
        notes: configured ? 'Active via DataForSEO' : 'Requires DATAFORSEO_LOGIN & PASSWORD',
      },
      {
        engine: 'youtube',
        name: 'YouTube Search',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: false,
        notes: configured ? 'Active via DataForSEO' : 'Requires DATAFORSEO_LOGIN & PASSWORD',
      },
      {
        engine: 'google-ai-overview',
        name: 'Google AI Overviews',
        isAvailable: false,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: true,
        notes: 'Requires SerpApi provider mode',
      },
      {
        engine: 'chatgpt',
        name: 'ChatGPT Search',
        isAvailable: false,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: false,
        notes: 'Requires direct OpenAI API',
      },
    ];
  }

  async checkRankings(
    requests: KeywordCheckRequest[],
    options?: { timeoutMs?: number }
  ): Promise<ProviderCheckResponse> {
    const checkedAt = new Date().toISOString();

    if (!this.isConfigured()) {
      return {
        success: false,
        results: [],
        checkedCount: 0,
        rankedCount: 0,
        unrankedCount: 0,
        provider: this.id,
        checkedAt,
        error: {
          code: 'PROVIDER_UNCONFIGURED',
          message:
            'DataForSEO credentials are not configured. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in environment variables.',
          provider: this.id,
          statusCode: 400,
        },
      };
    }

    const timeout = options?.timeoutMs || 20000;
    const authHeader = 'Basic ' + Buffer.from(`${this.login}:${this.password}`).toString('base64');
    const results: KeywordCheckResult[] = [];

    for (const req of requests) {
      try {
        const enginePath = req.searchEngine === 'bing' ? 'bing/organic/live/regular' : 'google/organic/live/regular';
        const payload = [
          {
            keyword: req.keyword,
            location_code: 2356, // default or mapped from countryCode
            language_code: req.languageCode || 'en',
            device: req.device || 'desktop',
            depth: 100,
          },
        ];

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${this.baseUrl}/${enginePath}`, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            results,
            checkedCount: results.length,
            rankedCount: results.filter((r) => r.position !== null).length,
            unrankedCount: results.filter((r) => r.position === null).length,
            provider: this.id,
            checkedAt,
            error: {
              code: 'INVALID_API_KEY',
              message: 'Invalid DataForSEO credentials.',
              provider: this.id,
              statusCode: 401,
            },
          };
        }

        if (response.status === 429) {
          return {
            success: false,
            results,
            checkedCount: results.length,
            rankedCount: results.filter((r) => r.position !== null).length,
            unrankedCount: results.filter((r) => r.position === null).length,
            provider: this.id,
            checkedAt,
            error: {
              code: 'RATE_LIMITED',
              message: 'DataForSEO rate limit exceeded.',
              provider: this.id,
              statusCode: 429,
            },
          };
        }

        const data = await response.json();
        const items = data.tasks?.[0]?.result?.[0]?.items || [];

        let position: number | null = null;
        let rankedUrl: string | null = null;
        let title: string | null = null;
        let snippet: string | null = null;

        for (const item of items) {
          if (item.type === 'organic' && urlMatchesTarget(item.url, req.targetDomain)) {
            position = item.rank_absolute || item.rank_group || null;
            rankedUrl = item.url;
            title = item.title;
            snippet = item.description;
            break;
          }
        }

        results.push({
          keywordId: req.keywordId,
          keyword: req.keyword,
          searchEngine: req.searchEngine,
          countryCode: req.countryCode,
          device: req.device || 'desktop',
          position: position && position <= 100 ? position : null,
          rankedUrl,
          title,
          snippet,
          serpFeatures: [],
          checkedAt,
          provider: this.id,
        });
      } catch (err: unknown) {
        const isAbort = err instanceof Error && err.name === 'AbortError';
        return {
          success: false,
          results,
          checkedCount: results.length,
          rankedCount: results.filter((r) => r.position !== null).length,
          unrankedCount: results.filter((r) => r.position === null).length,
          provider: this.id,
          checkedAt,
          error: {
            code: isAbort ? 'TIMEOUT' : 'NETWORK_ERROR',
            message: err instanceof Error ? err.message : 'DataForSEO connection failure',
            provider: this.id,
            statusCode: isAbort ? 504 : 502,
          },
        };
      }
    }

    const rankedCount = results.filter((r) => r.position !== null).length;
    return {
      success: true,
      results,
      checkedCount: results.length,
      rankedCount,
      unrankedCount: results.length - rankedCount,
      provider: this.id,
      checkedAt,
    };
  }
}
