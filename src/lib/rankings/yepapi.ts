/**
 * YepAPI Live SERP Ranking Provider
 * Real organic ranking checking via YepAPI Google SERP API
 */

import {
  RankingProvider,
  KeywordCheckRequest,
  ProviderCheckResponse,
  KeywordCheckResult,
  EngineCapability,
} from './types';
import { urlMatchesTarget } from './google';
import { yepApiClient } from '@/lib/yepapi';

export class YepApiRankingProvider implements RankingProvider {
  readonly id = 'yepapi';
  readonly name = 'YepAPI SERP v1';

  isConfigured(): boolean {
    return yepApiClient.isConfigured();
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
        notes: configured ? 'Active via YepAPI' : 'Requires YEPAPI_KEY in server environment',
      },
      {
        engine: 'bing',
        name: 'Microsoft Bing',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: false,
        notes: configured ? 'Active via YepAPI' : 'Requires YEPAPI_KEY in server environment',
      },
      {
        engine: 'yahoo',
        name: 'Yahoo Search',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: false,
        notes: configured ? 'Active via YepAPI' : 'Requires YEPAPI_KEY in server environment',
      },
      {
        engine: 'youtube',
        name: 'YouTube Search',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: false,
        notes: configured ? 'Active via YepAPI' : 'Requires YEPAPI_KEY in server environment',
      },
      {
        engine: 'google-ai-overview',
        name: 'Google AI Overviews',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: true,
        notes: 'Supported via YepAPI AI Mode',
      },
      {
        engine: 'chatgpt',
        name: 'ChatGPT Search',
        isAvailable: false,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: false,
        notes: 'Requires OpenAI direct connection',
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
          message: 'YepAPI is not configured. Add YEPAPI_KEY to server environment variables.',
          provider: this.id,
          statusCode: 503,
        },
      };
    }

    const results: KeywordCheckResult[] = [];

    for (const req of requests) {
      const locationCode = this.mapCountryToLocationCode(req.countryCode);

      const serpRes = await yepApiClient.getGoogleSerp({
        query: req.keyword,
        depth: 100,
        location_code: locationCode,
        language: req.languageCode || 'en',
        device: req.device || 'desktop',
        stop_at_domain: req.targetDomain,
      });

      if (!serpRes.ok || !serpRes.data) {
        const errCode = serpRes.error?.code || 'NETWORK_ERROR';
        let mappedCode: 'CREDITS_EXHAUSTED' | 'INVALID_API_KEY' | 'RATE_LIMITED' | 'TIMEOUT' | 'NETWORK_ERROR' = 'NETWORK_ERROR';

        if (errCode === 'NO_CREDITS' || serpRes.error?.statusCode === 402) {
          const serperKey = process.env.SERPER_API_KEY;
          if (serperKey && !serperKey.includes('placeholder') && !serperKey.includes('your_')) {
            const { SerperProvider } = await import('./serper');
            const serper = new SerperProvider();
            if (serper.isConfigured()) {
              return serper.checkRankings(requests, options);
            }
          }
          mappedCode = 'CREDITS_EXHAUSTED';
        } else if (errCode === 'INVALID_API_KEY' || serpRes.error?.statusCode === 401) {
          mappedCode = 'INVALID_API_KEY';
        } else if (errCode === 'RATE_LIMITED' || serpRes.error?.statusCode === 429) {
          mappedCode = 'RATE_LIMITED';
        } else if (errCode === 'TIMEOUT' || serpRes.error?.statusCode === 504) {
          mappedCode = 'TIMEOUT';
        }

        return {
          success: false,
          results,
          checkedCount: results.length,
          rankedCount: results.filter((r) => r.position !== null).length,
          unrankedCount: results.filter((r) => r.position === null).length,
          provider: this.id,
          checkedAt,
          error: {
            code: mappedCode,
            message: serpRes.error?.message || 'Failed to check rankings via YepAPI',
            provider: this.id,
            statusCode: serpRes.error?.statusCode || 500,
          },
        };
      }

      const serpData = serpRes.data;
      const items = serpData.results || [];

      let position: number | null = null;
      let rankedUrl: string | null = null;
      let title: string | null = null;
      let snippet: string | null = null;
      const serpFeatures: string[] = [];

      // Extract SERP features
      if (serpData.itemTypes && Array.isArray(serpData.itemTypes)) {
        if (serpData.itemTypes.includes('peopleAlsoAsk')) serpFeatures.push('people_also_ask');
        if (serpData.itemTypes.includes('localPack')) serpFeatures.push('local_pack');
      }

      for (const item of items) {
        if (item.type === 'peopleAlsoAsk' && !serpFeatures.includes('people_also_ask')) {
          serpFeatures.push('people_also_ask');
        }
        if (item.type === 'localPack' && !serpFeatures.includes('local_pack')) {
          serpFeatures.push('local_pack');
        }

        if (item.data?.isFeaturedSnippet) {
          serpFeatures.push('featured_snippet');
        }

        // Check if organic rank matches target
        if (
          (item.type === 'organic' || !item.type) &&
          item.url &&
          urlMatchesTarget(item.url, req.targetDomain)
        ) {
          if (position === null) {
            position = item.position || null;
            rankedUrl = item.url;
            title = item.title;
            snippet = item.description;
          }
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
        serpFeatures,
        checkedAt,
        provider: this.id,
      });
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

  private mapCountryToLocationCode(countryCode?: string): number {
    const code = (countryCode || 'us').toLowerCase().trim();
    const map: Record<string, number> = {
      us: 2840,
      in: 2356,
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
}
