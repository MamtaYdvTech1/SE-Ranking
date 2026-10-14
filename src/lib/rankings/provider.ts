/**
 * Live Ranking Provider Factory & Manager
 * Selects configured provider via RANKING_PROVIDER env variable ('serpapi' | 'dataforseo')
 */

import { RankingProvider, EngineCapability } from './types';
import { SerpApiProvider } from './serpapi';
import { YepApiRankingProvider } from './yepapi';
import { SerperProvider } from './serper';

let cachedProvider: RankingProvider | null = null;

export function getRankingProvider(): RankingProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const configuredProvider = (process.env.RANKING_PROVIDER || '').toLowerCase().trim();

  if (configuredProvider === 'yepapi' || (!configuredProvider && process.env.YEPAPI_KEY)) {
    cachedProvider = new YepApiRankingProvider();
  } else if (configuredProvider === 'serper' || process.env.SERPER_API_KEY) {
    cachedProvider = new SerperProvider();
  } else if (configuredProvider === 'serpapi' || process.env.SERPAPI_API_KEY) {
    cachedProvider = new SerpApiProvider();
  } else {
    // Default to YepAPI if credentials exist, otherwise Serper or SerpApi
    if (process.env.YEPAPI_KEY) {
      cachedProvider = new YepApiRankingProvider();
    } else if (process.env.SERPER_API_KEY) {
      cachedProvider = new SerperProvider();
    } else {
      cachedProvider = new YepApiRankingProvider();
    }
  }

  return cachedProvider;
}

/**
 * Resets cached provider (useful for testing or dynamic credential updates)
 */
export function resetRankingProvider(): void {
  cachedProvider = null;
}

/**
 * Retrieves aggregate engine capabilities across the active provider.
 */
export function getActiveEngineCapabilities(): EngineCapability[] {
  const provider = getRankingProvider();
  return provider.getEngineCapabilities();
}
