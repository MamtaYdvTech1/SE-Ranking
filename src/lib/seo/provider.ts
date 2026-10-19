import { AnalyzeRequestInput } from '../validation/schemas';
import { AnalysisOverview, EngineMetric, PromptItem, CitationItem, CompetitorItem, TopicItem } from '../types';

export interface SeoDataProvider {
  analyze(params: AnalyzeRequestInput): Promise<AnalysisOverview>;
  testConnection(): Promise<{ success: boolean; message: string; status: number }>;
}

export class SeRankingProvider implements SeoDataProvider {
  private baseUrl: string;
  private token: string | undefined;

  constructor() {
    this.baseUrl = process.env.SE_RANKING_API_BASE_URL || 'https://api.seranking.com/v1';
    this.token = process.env.SE_RANKING_API_TOKEN;
  }

  private getHeaders(): HeadersInit {
    if (!this.token) {
      throw new Error('SE Ranking API credentials are not configured.');
    }
    return {
      'Authorization': `Token ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string; status: number }> {
    if (!this.token) {
      return {
        success: false,
        message: 'SE Ranking API credentials are not configured.',
        status: 400,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/account/info`, {
        headers: this.getHeaders(),
      });

      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          message: 'Your SEO data provider credentials were rejected.',
          status: response.status,
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          message: 'API request limit reached. Please try again later.',
          status: 429,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: `SE Ranking API error: ${response.statusText}`,
          status: response.status,
        };
      }

      return {
        success: true,
        message: 'SE Ranking API connected successfully.',
        status: 200,
      };
    } catch {
      return {
        success: false,
        message: 'Unable to retrieve SEO data. Please try again.',
        status: 500,
      };
    }
  }

  async analyze(params: AnalyzeRequestInput): Promise<AnalysisOverview> {
    const isTokenConfigured = Boolean(
      this.token &&
      this.token.trim() !== '' &&
      !this.token.includes('your_se_ranking_api_token_here')
    );

    if (!isTokenConfigured) {
      throw new Error('SE Ranking API credentials are not configured.');
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/ai-search/analyze`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          domain: params.domain,
          scope: params.scope,
          country_code: params.countryCode,
          brand: params.brandName,
        }),
      });
    } catch (err: unknown) {
      console.warn('Unable to reach SE Ranking API:', err);
      throw new Error('Unable to reach the SEO data provider. Please try again.');
    }

    // Surface provider failures instead of substituting generated data
    if (response.status === 401 || response.status === 403) {
      throw new Error('Your SEO data provider credentials were rejected.');
    }
    if (response.status === 429) {
      throw new Error('API request limit reached. Please try again later.');
    }
    if (!response.ok) {
      throw new Error(`SEO data provider error (${response.status}). AI search analysis is unavailable.`);
    }

    const data = await response.json();
    return this.normalizeApiResponse(data, params);
  }

  private normalizeApiResponse(raw: Record<string, unknown>, params: AnalyzeRequestInput): AnalysisOverview {
    return {
      id: (raw.id as string) || `an_${Date.now()}`,
      domain: params.domain,
      scope: params.scope,
      brandName: params.brandName || undefined,
      country: params.country,
      countryCode: params.countryCode,
      searchType: params.searchType,
      aiPresence: typeof raw.ai_presence === 'number' ? raw.ai_presence : null,
      brandPresence: typeof raw.brand_presence === 'number' ? raw.brand_presence : null,
      domainPresence: typeof raw.domain_presence === 'number' ? raw.domain_presence : null,
      avgPosition: typeof raw.avg_position === 'number' ? raw.avg_position : null,
      traffic: typeof raw.traffic === 'number' ? raw.traffic : null,
      mentions: typeof raw.mentions === 'number' ? raw.mentions : null,
      links: typeof raw.links === 'number' ? raw.links : null,
      citationShare: typeof raw.citation_share === 'number' ? raw.citation_share : null,
      referringDomains: typeof raw.referring_domains === 'number' ? raw.referring_domains : null,
      status: 'completed',
      createdAt: new Date().toISOString(),
      engines: Array.isArray(raw.engines) ? (raw.engines as EngineMetric[]) : [],
      prompts: Array.isArray(raw.prompts) ? (raw.prompts as PromptItem[]) : [],
      citations: Array.isArray(raw.citations) ? (raw.citations as CitationItem[]) : [],
      competitors: Array.isArray(raw.competitors) ? (raw.competitors as CompetitorItem[]) : [],
    };
  }
}

export class MockSeoDataProvider implements SeoDataProvider {
  async testConnection(): Promise<{ success: boolean; message: string; status: number }> {
    return {
      success: true,
      message: 'SE Ranking Mock Engine connected and active.',
      status: 200,
    };
  }

  async analyze(params: AnalyzeRequestInput): Promise<AnalysisOverview> {
    await new Promise((r) => setTimeout(r, 800));

    const domain = params.domain.toLowerCase();
    const brand = params.brandName || domain.split('.')[0];
    const capitalizedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);

    const engines: EngineMetric[] = [
      {
        id: 'eng_1',
        engineId: 'ai-overview',
        name: 'AI Overview',
        mentions: (domain.includes('workco') || domain.includes('workcomposer')) ? 13500 : 8420,
        linkPresence: (domain.includes('workco') || domain.includes('workcomposer')) ? 4.8 : 2.5,
        presence: 62.4,
        status: 'active',
      },
      {
        id: 'eng_2',
        engineId: 'ai-mode',
        name: 'AI Mode',
        mentions: (domain.includes('workco') || domain.includes('workcomposer')) ? 1200 : 450,
        linkPresence: 1.2,
        presence: 18.5,
        status: 'active',
      },
      {
        id: 'eng_3',
        engineId: 'chatgpt',
        name: 'ChatGPT',
        mentions: (domain.includes('workco') || domain.includes('workcomposer')) ? 9400 : 5100,
        linkPresence: 3.1,
        presence: 44.0,
        status: 'active',
      },
      {
        id: 'eng_4',
        engineId: 'gemini',
        name: 'Gemini',
        mentions: (domain.includes('workco') || domain.includes('workcomposer')) ? 7800 : 3900,
        linkPresence: 2.8,
        presence: 39.2,
        status: 'active',
      },
      {
        id: 'eng_5',
        engineId: 'perplexity',
        name: 'Perplexity',
        mentions: (domain.includes('workco') || domain.includes('workcomposer')) ? 6200 : 2800,
        linkPresence: 5.4,
        presence: 51.6,
        status: 'active',
      },
    ];

    const prompts: PromptItem[] = [
      {
        id: 'pr_1',
        prompt: `what is ${capitalizedBrand} and what services does ${domain} provide`,
        topic: 'Brand Overview',
        engine: 'ai-overview',
        mention: true,
        link: true,
        ads: false,
        competitors: [],
        fullAnswer: `${capitalizedBrand} (${domain}) is an online platform. Overview data is generated based on public domain indexing.`,
        answerDate: new Date().toISOString().split('T')[0],
        visibility: 'Visible',
      },
      {
        id: 'pr_2',
        prompt: `top alternatives and competitors to ${capitalizedBrand} in 2026`,
        topic: 'Competitor Alternatives',
        engine: 'chatgpt',
        mention: true,
        link: true,
        ads: false,
        competitors: [],
        fullAnswer: `When evaluating alternatives to ${capitalizedBrand}, users consider competitors operating within the same market sector as ${domain}.`,
        answerDate: new Date().toISOString().split('T')[0],
        visibility: 'Visible',
      },
      {
        id: 'pr_3',
        prompt: `customer reviews and ratings for ${capitalizedBrand} (${domain})`,
        topic: 'Reviews & Reputation',
        engine: 'gemini',
        mention: true,
        link: false,
        ads: false,
        competitors: [],
        fullAnswer: `Public sentiment and user discussions regarding ${capitalizedBrand} can be discovered across review platforms and search engines.`,
        answerDate: new Date().toISOString().split('T')[0],
        visibility: 'Visible',
      },
      {
        id: 'pr_4',
        prompt: `how does ${capitalizedBrand} compare to other industry tools`,
        topic: 'Product Comparisons',
        engine: 'perplexity',
        mention: true,
        link: true,
        ads: false,
        competitors: [],
        fullAnswer: `A comparative evaluation of ${capitalizedBrand} against alternatives in the ${domain} niche shows varying feature sets and market reach.`,
        answerDate: new Date().toISOString().split('T')[0],
        visibility: 'Visible',
      },
    ];

    const citations: CitationItem[] = [
      {
        id: 'cit_1',
        domain: domain,
        url: `https://${domain}/`,
        citationShare: 35.0,
        visibility: 80.0,
        topics: 'Official Website, Overview',
        domainTrust: 50,
        pageTrust: 45,
        organicTraffic: 0,
      },
      {
        id: 'cit_2',
        domain: domain,
        url: `https://${domain}/features`,
        citationShare: 20.0,
        visibility: 65.0,
        topics: 'Product Features',
        domainTrust: 50,
        pageTrust: 40,
        organicTraffic: 0,
      },
    ];

    // Competitors are strictly empty or labeled as AI-generated; never fake share of voice
    const competitors: CompetitorItem[] = [];

    const topics: TopicItem[] = [
      { id: 'top_1', topic: 'Brand Overview', presence: 80, competitorPresence: 0, overlap: 'Unique', promptsCount: 1 },
      { id: 'top_2', topic: 'Competitor Alternatives', presence: 60, competitorPresence: 0, overlap: 'Shared', promptsCount: 1 },
      { id: 'top_3', topic: 'Reviews & Reputation', presence: 50, competitorPresence: 0, overlap: 'Shared', promptsCount: 1 },
      { id: 'top_4', topic: 'Product Comparisons', presence: 50, competitorPresence: 0, overlap: 'Shared', promptsCount: 1 },
    ];

    return {
      id: `an_${Date.now()}`,
      domain: domain,
      scope: params.scope,
      brandName: params.brandName || capitalizedBrand,
      country: params.country,
      countryCode: params.countryCode,
      searchType: params.searchType,
      aiPresence: 60.0,
      brandPresence: params.brandName ? 55.0 : null,
      domainPresence: 65.0,
      avgPosition: 2.5,
      traffic: 0,
      mentions: prompts.filter((p) => p.mention).length,
      links: citations.length,
      citationShare: 35.0,
      referringDomains: citations.length,
      organicKeywords: null,
      organicTraffic: null,
      status: 'completed',
      createdAt: new Date().toISOString(),
      engines,
      prompts,
      citations,
      competitors,
      topics,
    };
  }
}

export function getSeoProvider(): SeoDataProvider {
  const mode = process.env.SEO_PROVIDER_MODE || 'real';
  if (mode === 'mock') {
    return new MockSeoDataProvider();
  }

  // Mock data only when explicitly requested (local demos); everything else hits the real provider
  return new SeRankingProvider();
}
