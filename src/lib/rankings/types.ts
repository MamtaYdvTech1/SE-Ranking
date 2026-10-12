/**
 * Live Ranking Provider Types & Definitions
 * Production-grade SE Ranking architecture
 */

export type SearchEngineType =
  | 'google'
  | 'google-ai-overview'
  | 'google-ai-mode'
  | 'bing'
  | 'yahoo'
  | 'yandex'
  | 'duckduckgo'
  | 'youtube'
  | 'chatgpt';

export type DeviceType = 'desktop' | 'mobile';

export interface KeywordCheckRequest {
  keywordId: string;
  keyword: string;
  targetDomain: string; // e.g. workcomposer.com
  searchEngine: SearchEngineType;
  countryCode: string;  // e.g. 'us', 'in', 'gb'
  languageCode?: string; // e.g. 'en', 'de'
  device?: DeviceType;
  location?: string;
}

export interface SerpFeatureItem {
  type:
    | 'featured_snippet'
    | 'people_also_ask'
    | 'sitelinks'
    | 'reviews'
    | 'knowledge_graph'
    | 'local_pack'
    | 'top_stories'
    | 'video'
    | 'images'
    | 'ai_overview'
    | 'shopping';
  title?: string;
  url?: string;
}

export interface KeywordCheckResult {
  keywordId: string;
  keyword: string;
  searchEngine: SearchEngineType;
  countryCode: string;
  device: DeviceType;
  position: number | null; // 1-100 or null if >100 / not found
  rankedUrl: string | null;
  title: string | null;
  snippet: string | null;
  serpFeatures: string[];
  searchVolume?: number | null;
  cpc?: number | null;
  checkedAt: string;
  provider: string;
}

export type ProviderErrorCode =
  | 'PROVIDER_UNCONFIGURED'
  | 'INVALID_API_KEY'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'MALFORMED_RESPONSE'
  | 'ENGINE_UNSUPPORTED'
  | 'CREDITS_EXHAUSTED';

export interface ProviderError {
  code: ProviderErrorCode;
  message: string;
  provider: string;
  statusCode?: number;
  retryAfterSeconds?: number;
}

export interface ProviderCheckResponse {
  success: boolean;
  results: KeywordCheckResult[];
  error?: ProviderError;
  checkedCount: number;
  rankedCount: number;
  unrankedCount: number;
  provider: string;
  checkedAt: string;
}

export interface EngineCapability {
  engine: SearchEngineType;
  name: string;
  isAvailable: boolean;
  supportsDesktop: boolean;
  supportsMobile: boolean;
  supportsSerpFeatures: boolean;
  notes?: string;
}

export interface RankingProvider {
  readonly id: string;
  readonly name: string;

  /**
   * Validates whether provider credentials are set and active.
   */
  isConfigured(): boolean;

  /**
   * Returns list of supported search engines and their capabilities.
   */
  getEngineCapabilities(): EngineCapability[];

  /**
   * Checks real search engine ranking for a batch of keywords against target domain.
   */
  checkRankings(
    requests: KeywordCheckRequest[],
    options?: { timeoutMs?: number }
  ): Promise<ProviderCheckResponse>;
}
