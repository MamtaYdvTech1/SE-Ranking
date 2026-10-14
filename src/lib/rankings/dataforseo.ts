/**
 * DataForSEO Live SERP Ranking Provider (MIGRATED TO YEPAPI)
 *
 * NOTE: DataForSEO has been fully decommissioned and migrated to YepAPI.
 * This class delegates all ranking checks to YepApiRankingProvider.
 */

import {
  RankingProvider,
  KeywordCheckRequest,
  ProviderCheckResponse,
  EngineCapability,
} from './types';
import { YepApiRankingProvider } from './yepapi';
import { yepApiClient } from '@/lib/yepapi';

export class DataForSeoProvider implements RankingProvider {
  readonly id = 'dataforseo';
  readonly name = 'DataForSEO (Migrated to YepAPI)';

  private yepProvider = new YepApiRankingProvider();

  isConfigured(): boolean {
    return yepApiClient.isConfigured() || Boolean(
      process.env.DATAFORSEO_LOGIN &&
      process.env.DATAFORSEO_PASSWORD &&
      !process.env.DATAFORSEO_LOGIN.includes('your_')
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
        notes: configured ? 'Active via YepAPI' : 'Requires YEPAPI_KEY',
      },
      {
        engine: 'bing',
        name: 'Microsoft Bing',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: true,
        notes: configured ? 'Active via YepAPI' : 'Requires YEPAPI_KEY',
      },
      {
        engine: 'yahoo',
        name: 'Yahoo Search',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: false,
        notes: configured ? 'Active via YepAPI' : 'Requires YEPAPI_KEY',
      },
      {
        engine: 'youtube',
        name: 'YouTube Search',
        isAvailable: configured,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: false,
        notes: configured ? 'Active via YepAPI' : 'Requires YEPAPI_KEY',
      },
      {
        engine: 'google-ai-overview',
        name: 'Google AI Overviews',
        isAvailable: false,
        supportsDesktop: true,
        supportsMobile: true,
        supportsSerpFeatures: true,
        notes: 'Supported via YepAPI',
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
    return this.yepProvider.checkRankings(requests, options);
  }
}
