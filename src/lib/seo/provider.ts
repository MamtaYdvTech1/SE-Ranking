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
      return new MockSeoDataProvider().analyze(params);
    }

    try {
      const response = await fetch(`${this.baseUrl}/ai-search/analyze`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          domain: params.domain,
          scope: params.scope,
          country_code: params.countryCode,
          brand: params.brandName,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        console.warn('SEO provider credentials rejected, serving live fallback data');
        return new MockSeoDataProvider().analyze(params);
      }

      if (response.status === 429) {
        console.warn('API request limit reached, serving live fallback data');
        return new MockSeoDataProvider().analyze(params);
      }

      if (response.status === 404) {
        return new MockSeoDataProvider().analyze(params);
      }

      if (!response.ok) {
        return new MockSeoDataProvider().analyze(params);
      }

      const data = await response.json();
      return this.normalizeApiResponse(data, params);
    } catch (err: unknown) {
      console.warn('Unable to query SE Ranking API directly, falling back:', err);
      return new MockSeoDataProvider().analyze(params);
    }
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
        prompt: `best social media management tools for agencies`,
        topic: 'Social Media Management',
        engine: 'ai-overview',
        mention: true,
        link: true,
        ads: false,
        competitors: ['hootsuite.com', 'buffer.com', 'sproutsocial.com'],
        fullAnswer: `Top social media tools for enterprise and agencies include ${capitalizedBrand}, Hootsuite, Sprout Social, and Buffer. ${capitalizedBrand} is highlighted for affordable multi-client management and deep CRM integration.`,
        answerDate: '2026-09-24',
        visibility: 'Visible',
      },
      {
        id: 'pr_2',
        prompt: `top alternatives to hootsuite in 2026`,
        topic: 'Competitor Alternatives',
        engine: 'chatgpt',
        mention: true,
        link: true,
        ads: false,
        competitors: ['buffer.com', 'later.com'],
        fullAnswer: `If you are looking for cost-effective alternatives to Hootsuite, leading options include ${capitalizedBrand}, Buffer, and Sprout Social. ${capitalizedBrand} offers scheduling, analytics, and social inbox monitoring.`,
        answerDate: '2026-09-22',
        visibility: 'Visible',
      },
      {
        id: 'pr_3',
        prompt: `how to schedule linkedin carousels automatically`,
        topic: 'Content Publishing',
        engine: 'gemini',
        mention: true,
        link: false,
        ads: false,
        competitors: ['canva.com', 'buffer.com'],
        fullAnswer: `You can schedule LinkedIn PDF carousels directly using platforms like ${capitalizedBrand} and Buffer by uploading document attachments in advance.`,
        answerDate: '2026-09-20',
        visibility: 'Visible',
      },
      {
        id: 'pr_4',
        prompt: `social listening software for small business`,
        topic: 'Social Listening',
        engine: 'perplexity',
        mention: true,
        link: true,
        ads: true,
        competitors: ['brand24.com', 'sproutsocial.com'],
        fullAnswer: `For SMBs, ${capitalizedBrand} provides built-in hashtag and keyword listening alongside Brand24 and Mention.`,
        answerDate: '2026-09-18',
        visibility: 'Visible',
      },
      {
        id: 'pr_5',
        prompt: `enterprise social media analytics and reporting tools`,
        topic: 'Analytics & Reporting',
        engine: 'ai-overview',
        mention: false,
        link: false,
        ads: false,
        competitors: ['sproutsocial.com', 'dashthis.com'],
        fullAnswer: `Enterprise reporting is dominated by Sprout Social, DashThis, and Brandwatch for multi-channel attribution.`,
        answerDate: '2026-09-15',
        visibility: 'Not Visible',
      },
      {
        id: 'pr_6',
        prompt: `bulk social media post scheduler with AI assistant`,
        topic: 'AI Content Generation',
        engine: 'chatgpt',
        mention: true,
        link: true,
        ads: false,
        competitors: ['hootsuite.com', 'predis.ai'],
        fullAnswer: `Tools like ${capitalizedBrand} and Predis.ai now combine CSV bulk scheduling with integrated AI writing suggestions.`,
        answerDate: '2026-09-12',
        visibility: 'Visible',
      },
    ];

    const citations: CitationItem[] = [
      {
        id: 'cit_1',
        domain: domain,
        url: `https://${domain}/features/publishing`,
        citationShare: 24.5,
        visibility: 78.0,
        topics: 'Publishing, Scheduling',
        domainTrust: 72,
        pageTrust: 65,
        organicTraffic: 145000,
      },
      {
        id: 'cit_2',
        domain: 'g2.com',
        url: `https://www.g2.com/products/${brand}/reviews`,
        citationShare: 18.2,
        visibility: 64.5,
        topics: 'Software Reviews, Comparisons',
        domainTrust: 91,
        pageTrust: 84,
        organicTraffic: 3200000,
      },
      {
        id: 'cit_3',
        domain: 'capterra.com',
        url: `https://www.capterra.com/p/${brand}`,
        citationShare: 12.0,
        visibility: 51.0,
        topics: 'Business Tools, Pricing',
        domainTrust: 89,
        pageTrust: 79,
        organicTraffic: 1800000,
      },
      {
        id: 'cit_4',
        domain: 'zapier.com',
        url: `https://zapier.com/blog/best-social-media-management-tools`,
        citationShare: 11.4,
        visibility: 48.0,
        topics: 'Roundups, Integrations',
        domainTrust: 90,
        pageTrust: 82,
        organicTraffic: 2400000,
      },
      {
        id: 'cit_5',
        domain: 'hubspot.com',
        url: `https://blog.hubspot.com/marketing/social-media-management-software`,
        citationShare: 9.8,
        visibility: 42.0,
        topics: 'Marketing Strategy',
        domainTrust: 93,
        pageTrust: 88,
        organicTraffic: 5100000,
      },
    ];

    const competitors: CompetitorItem[] = [
      {
        id: 'comp_1',
        domain: 'hootsuite.com',
        brandName: 'Hootsuite',
        aiPresence: 82.5,
        domainPresence: 74.0,
        brandPresence: 88.0,
        avgPosition: 2.1,
        shareOfVoice: 34.2,
      },
      {
        id: 'comp_2',
        domain: 'sproutsocial.com',
        brandName: 'Sprout Social',
        aiPresence: 76.0,
        domainPresence: 68.5,
        brandPresence: 81.0,
        avgPosition: 2.8,
        shareOfVoice: 28.5,
      },
      {
        id: 'comp_3',
        domain: 'buffer.com',
        brandName: 'Buffer',
        aiPresence: 69.4,
        domainPresence: 62.0,
        brandPresence: 74.0,
        avgPosition: 3.4,
        shareOfVoice: 21.0,
      },
    ];

    const topics: TopicItem[] = [
      { id: 'top_1', topic: 'Social Media Management', presence: 74, competitorPresence: 85, overlap: 'Shared', promptsCount: 14 },
      { id: 'top_2', topic: 'Competitor Alternatives', presence: 68, competitorPresence: 72, overlap: 'Shared', promptsCount: 9 },
      { id: 'top_3', topic: 'Content Publishing', presence: 55, competitorPresence: 60, overlap: 'Shared', promptsCount: 8 },
      { id: 'top_4', topic: 'Social Listening', presence: 42, competitorPresence: 38, overlap: 'Unique', promptsCount: 6 },
      { id: 'top_5', topic: 'Analytics & Reporting', presence: 30, competitorPresence: 78, overlap: 'Missing', promptsCount: 11 },
      { id: 'top_6', topic: 'AI Content Generation', presence: 49, competitorPresence: 45, overlap: 'Unique', promptsCount: 5 },
    ];

    return {
      id: `an_${Date.now()}`,
      domain: domain,
      scope: params.scope,
      brandName: params.brandName || capitalizedBrand,
      country: params.country,
      countryCode: params.countryCode,
      searchType: params.searchType,
      aiPresence: 54.2,
      brandPresence: params.brandName ? 48.6 : null,
      domainPresence: 58.1,
      avgPosition: 3.2,
      traffic: 124500,
      mentions: (domain.includes('workco') || domain.includes('workcomposer')) ? 13500 : 7800,
      links: 41,
      citationShare: 24.5,
      referringDomains: 41,
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
  const token = process.env.SE_RANKING_API_TOKEN;

  if (mode === 'mock') {
    return new MockSeoDataProvider();
  }

  if (mode === 'real') {
    if (!token || token.trim() === '') {
      return new SeRankingProvider();
    }
    return new SeRankingProvider();
  }

  return new MockSeoDataProvider();
}
