/**
 * SerpApi Live SERP Ranking Provider
 * Real organic position detection for Google, Bing, Yahoo, Yandex, DuckDuckGo, YouTube, AI Overviews
 */

import {
  RankingProvider,
  KeywordCheckRequest,
  ProviderCheckResponse,
  KeywordCheckResult,
  EngineCapability,
} from './types';
import { urlMatchesTarget, extractGoogleSerpFeatures } from './google';
import { extractBingSerpFeatures } from './bing';

export class SerpApiProvider implements RankingProvider {
  readonly id = 'serpapi';
  readonly name = 'SerpApi Real SERP Provider';

  private apiKey: string | undefined;
  private baseUrl = 'https://serpapi.com/search.json';

  constructor() {
    this.apiKey = process.env.SERPAPI_API_KEY || process.env.SERP_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(
      this.apiKey &&
      this.apiKey.trim() !== '' &&
      !this.apiKey.includes('your_') &&
      !this.apiKey.includes('placeholder')
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
        notes: configured ? 'Active via SerpApi' : 'Requires SERPAPI_API_KEY',
      },
      {
        engine: 'google-ai-overview',
        name: 'Google AI Overviews',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: true,
        notes: configured ? 'Active (extracts generative AI citations)' : 'Requires SERPAPI_API_KEY',
      },
      {
        engine: 'bing',
        name: 'Microsoft Bing',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: true,
        notes: configured ? 'Active via SerpApi' : 'Requires SERPAPI_API_KEY',
      },
      {
        engine: 'yahoo',
        name: 'Yahoo Search',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: false,
        notes: configured ? 'Active via SerpApi' : 'Requires SERPAPI_API_KEY',
      },
      {
        engine: 'yandex',
        name: 'Yandex Search',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: false,
        supportsSerpFeatures: false,
        notes: configured ? 'Active via SerpApi' : 'Requires SERPAPI_API_KEY',
      },
      {
        engine: 'duckduckgo',
        name: 'DuckDuckGo',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: false,
        supportsSerpFeatures: false,
        notes: configured ? 'Active via SerpApi' : 'Requires SERPAPI_API_KEY',
      },
      {
        engine: 'youtube',
        name: 'YouTube Video Search',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: false,
        notes: configured ? 'Active via SerpApi' : 'Requires SERPAPI_API_KEY',
      },
      {
        engine: 'chatgpt',
        name: 'ChatGPT Search',
        isAvailable: false,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: false,
        notes: 'ChatGPT tracking requires direct OpenAI API or Perplexity integration',
      },
      {
        engine: 'google-ai-mode',
        name: 'Google AI Mode',
        isAvailable: false,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: false,
        notes: 'Google AI Mode requires regional Gemini Search access',
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
            'SerpApi provider credentials are not configured. Set SERPAPI_API_KEY in your environment variables to enable live ranking checks.',
          provider: this.id,
          statusCode: 400,
        },
      };
    }

    const timeout = options?.timeoutMs || 15000;
    const results: KeywordCheckResult[] = [];

    for (const req of requests) {
      try {
        const queryParams = new URLSearchParams({
          api_key: this.apiKey!,
          q: req.keyword,
        });

        // Configure engine-specific parameters
        if (req.searchEngine === 'bing') {
          queryParams.set('engine', 'bing');
          queryParams.set('cc', (req.countryCode || 'us').toLowerCase());
          queryParams.set('count', '50');
        } else if (req.searchEngine === 'yahoo') {
          queryParams.set('engine', 'yahoo');
          queryParams.set('p', req.keyword);
        } else if (req.searchEngine === 'yandex') {
          queryParams.set('engine', 'yandex');
          queryParams.set('text', req.keyword);
        } else if (req.searchEngine === 'duckduckgo') {
          queryParams.set('engine', 'duckduckgo');
        } else if (req.searchEngine === 'youtube') {
          queryParams.set('engine', 'youtube');
          queryParams.set('search_query', req.keyword);
        } else {
          // Default: Google or Google AI Overviews
          queryParams.set('engine', 'google');
          queryParams.set('num', '100');
          queryParams.set('gl', (req.countryCode || 'us').toLowerCase());
          if (req.languageCode) {
            queryParams.set('hl', req.languageCode.toLowerCase());
          }
          if (req.device === 'mobile') {
            queryParams.set('device', 'mobile');
          }
          if (req.location) {
            queryParams.set('location', req.location);
          }
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
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
              message: 'Invalid SerpApi API key. Please check your SERPAPI_API_KEY environment variable.',
              provider: this.id,
              statusCode: response.status,
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
              message: 'SerpApi rate limit exceeded. Please wait or upgrade your plan.',
              provider: this.id,
              statusCode: 429,
            },
          };
        }

        if (!response.ok) {
          return {
            success: false,
            results,
            checkedCount: results.length,
            rankedCount: results.filter((r) => r.position !== null).length,
            unrankedCount: results.filter((r) => r.position === null).length,
            provider: this.id,
            checkedAt,
            error: {
              code: 'NETWORK_ERROR',
              message: `SerpApi returned HTTP error ${response.status}: ${response.statusText}`,
              provider: this.id,
              statusCode: response.status,
            },
          };
        }

        const data = await response.json();
        const parsed = this.parseSerpResult(data, req, checkedAt);
        results.push(parsed);
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
            message: isAbort
              ? `SerpApi request timed out after ${timeout}ms.`
              : err instanceof Error
              ? err.message
              : 'Unknown connection error while querying SerpApi.',
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

  private parseSerpResult(
    data: Record<string, unknown>,
    req: KeywordCheckRequest,
    checkedAt: string
  ): KeywordCheckResult {
    const targetDomain = req.targetDomain;
    let position: number | null = null;
    let rankedUrl: string | null = null;
    let title: string | null = null;
    let snippet: string | null = null;

    // 1. Check organic results
    const organic = (Array.isArray(data.organic_results)
      ? data.organic_results
      : Array.isArray(data.results)
      ? data.results
      : []) as Array<Record<string, unknown>>;
    for (let i = 0; i < organic.length; i++) {
      const item = organic[i];
      const link = (item.link || item.url || '') as string;
      if (urlMatchesTarget(link, targetDomain)) {
        position = typeof item.position === 'number' ? item.position : i + 1;
        rankedUrl = link;
        title = (item.title as string) || null;
        snippet = (item.snippet || item.description || null) as string | null;
        break;
      }
    }

    // 2. Check YouTube results if applicable
    if (!position && req.searchEngine === 'youtube') {
      const videoResults = (Array.isArray(data.video_results) ? data.video_results : []) as Array<Record<string, unknown>>;
      for (let i = 0; i < videoResults.length; i++) {
        const item = videoResults[i];
        const link = (item.link || '') as string;
        const channel = item.channel as Record<string, unknown> | undefined;
        const channelLink = (channel?.link || '') as string;
        if (urlMatchesTarget(link, targetDomain) || channelLink.includes(targetDomain)) {
          position = i + 1;
          rankedUrl = link;
          title = (item.title as string) || null;
          snippet = (item.description as string) || null;
          break;
        }
      }
    }

    // 3. Extract SERP features
    let serpFeatures: string[] = [];
    if (req.searchEngine === 'bing') {
      serpFeatures = extractBingSerpFeatures(data);
    } else {
      serpFeatures = extractGoogleSerpFeatures(data);
    }

    // If position is beyond 100, mark as null (unranked)
    if (position !== null && position > 100) {
      position = null;
    }

    return {
      keywordId: req.keywordId,
      keyword: req.keyword,
      searchEngine: req.searchEngine,
      countryCode: req.countryCode,
      device: req.device || 'desktop',
      position,
      rankedUrl,
      title,
      snippet,
      serpFeatures,
      searchVolume: null,
      checkedAt,
      provider: this.id,
    };
  }
}
