/**
 * Serper.dev Live Google SERP Ranking Provider
 * Fast, reliable Google organic rankings & SERP features
 * Free tier includes 2,500 queries at https://serper.dev
 */

import {
  RankingProvider,
  KeywordCheckRequest,
  ProviderCheckResponse,
  KeywordCheckResult,
  EngineCapability,
} from './types';
import { urlMatchesTarget } from './google';

export class SerperProvider implements RankingProvider {
  readonly id = 'serper';
  readonly name = 'Serper.dev Google SERP';

  private apiKey: string | undefined;
  private baseUrl = 'https://google.serper.dev/search';

  constructor() {
    this.apiKey = process.env.SERPER_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(
      this.apiKey &&
      this.apiKey.trim() !== '' &&
      !this.apiKey.includes('placeholder') &&
      !this.apiKey.includes('your_')
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
        notes: configured ? 'Active via Serper.dev' : 'Requires SERPER_API_KEY (Free 2,500 queries at serper.dev)',
      },
      {
        engine: 'google-ai-overview',
        name: 'Google AI Overviews',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: true,
        notes: configured ? 'Active via Serper.dev' : 'Requires SERPER_API_KEY',
      },
      {
        engine: 'bing',
        name: 'Microsoft Bing',
        isAvailable: false,
        supportsDesktop: false,
        supportsMobile: false,
        supportsSerpFeatures: false,
        notes: 'Serper.dev specializes in Google SERP',
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
          message: 'SERPER_API_KEY is not configured in .env. Get a free API key with 2,500 free queries at https://serper.dev',
          provider: this.id,
          statusCode: 400,
        },
      };
    }

    const timeout = options?.timeoutMs || 15000;
    const results: KeywordCheckResult[] = [];

    for (const req of requests) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'X-API-KEY': this.apiKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: req.keyword,
            gl: req.countryCode?.toLowerCase() || 'gb',
            hl: req.languageCode?.toLowerCase() || 'en',
            num: 100,
          }),
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
              message: 'Invalid SERPER_API_KEY. Please verify key at https://serper.dev',
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
              message: 'Serper.dev query credits limit reached.',
              provider: this.id,
              statusCode: 429,
            },
          };
        }

        const data = await response.json();
        const organicList: Array<{
          position?: number;
          title?: string;
          link?: string;
          snippet?: string;
        }> = data.organic || [];

        let position: number | null = null;
        let rankedUrl: string | null = null;
        let title: string | null = null;
        let snippet: string | null = null;

        for (const item of organicList) {
          if (item.link && urlMatchesTarget(item.link, req.targetDomain)) {
            position = item.position || null;
            rankedUrl = item.link;
            title = item.title || null;
            snippet = item.snippet || null;
            break;
          }
        }

        const serpFeatures: string[] = [];
        if (data.answerBox) serpFeatures.push('featured_snippet');
        if (data.peopleAlsoAsk && data.peopleAlsoAsk.length > 0) serpFeatures.push('people_also_ask');
        if (data.knowledgeGraph) serpFeatures.push('knowledge_graph');
        if (data.topStories) serpFeatures.push('top_stories');

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
          serpFeatures,
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
            message: err instanceof Error ? err.message : 'Serper.dev connection failed',
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
