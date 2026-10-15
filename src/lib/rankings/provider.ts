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

  if (configuredProvider === 'serper') {
    cachedProvider = new SerperProvider();
  } else if (configuredProvider === 'yepapi') {
    cachedProvider = new YepApiRankingProvider();
  } else if (configuredProvider === 'serpapi') {
    cachedProvider = new SerpApiProvider();
  } else if (process.env.SERPER_API_KEY && !process.env.SERPER_API_KEY.includes('placeholder') && !process.env.SERPER_API_KEY.includes('your_')) {
    cachedProvider = new SerperProvider();
  } else if (process.env.YEPAPI_KEY) {
    cachedProvider = new YepApiRankingProvider();
  } else {
    cachedProvider = new SerperProvider();
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
