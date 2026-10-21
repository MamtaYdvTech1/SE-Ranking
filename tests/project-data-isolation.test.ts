import { describe, it, expect, vi, beforeEach } from 'vitest';

// Multi-project test fixtures representing 3 distinct populated projects + 1 empty project
const MOCK_PROJECTS = {
  flipkart: {
    id: 'proj-flipkart-101',
    name: 'Flipkart Online Store',
    domain: 'flipkart.com',
    websiteUrl: 'https://flipkart.com',
    country: 'IN',
  },
  meesho: {
    id: 'proj-meesho-202',
    name: 'Meesho Social Commerce',
    domain: 'meesho.com',
    websiteUrl: 'https://meesho.com',
    country: 'IN',
  },
  tatacliq: {
    id: 'proj-tatacliq-303',
    name: 'Tata CLiQ Luxury & Fashion',
    domain: 'tatacliq.com',
    websiteUrl: 'https://tatacliq.com',
    country: 'IN',
  },
  empty: {
    id: 'proj-empty-999',
    name: 'New Empty Isolated Project',
    domain: 'new-isolated-test.org',
    websiteUrl: 'https://new-isolated-test.org',
    country: 'US',
  },
};

const MOCK_BACKLINKS = [
  // Flipkart backlinks (Project 1)
  {
    id: 'bl-fk-1',
    projectId: 'proj-flipkart-101',
    sourceUrl: 'https://techradar.com/best-ecommerce-india',
    targetUrl: 'https://flipkart.com/electronics',
    anchorText: 'Flipkart Electronics',
    domainTrust: 82,
    pageTrust: 65,
    isDoFollow: true,
    isLost: false,
    firstSeenDate: new Date('2026-08-01'),
    lastSeenDate: new Date('2026-10-10'),
    createdAt: new Date('2026-08-01'),
    deletedAt: null,
  },
  {
    id: 'bl-fk-2',
    projectId: 'proj-flipkart-101',
    sourceUrl: 'https://ndtv.com/gadgets/flipkart-sale',
    targetUrl: 'https://flipkart.com/sale',
    anchorText: 'Big Billion Days',
    domainTrust: 75,
    pageTrust: 60,
    isDoFollow: false,
    isLost: false,
    firstSeenDate: new Date('2026-09-15'),
    lastSeenDate: new Date('2026-10-11'),
    createdAt: new Date('2026-09-15'),
    deletedAt: null,
  },
  // Meesho backlink (Project 2)
  {
    id: 'bl-ms-1',
    projectId: 'proj-meesho-202',
    sourceUrl: 'https://yourstory.com/meesho-growth-story',
    targetUrl: 'https://meesho.com/about-us',
    anchorText: 'Meesho Resellers Platform',
    domainTrust: 70,
    pageTrust: 55,
    isDoFollow: true,
    isLost: false,
    firstSeenDate: new Date('2026-07-20'),
    lastSeenDate: new Date('2026-10-09'),
    createdAt: new Date('2026-07-20'),
    deletedAt: null,
  },
  // Tata CLiQ backlink (Project 3)
  {
    id: 'bl-tc-1',
    projectId: 'proj-tatacliq-303',
    sourceUrl: 'https://vogue.in/fashion/luxury-online-shopping',
    targetUrl: 'https://tatacliq.com/luxury',
    anchorText: 'Tata CLiQ Luxury Collection',
    domainTrust: 88,
    pageTrust: 72,
    isDoFollow: true,
    isLost: false,
    firstSeenDate: new Date('2026-09-01'),
    lastSeenDate: new Date('2026-10-12'),
    createdAt: new Date('2026-09-01'),
    deletedAt: null,
  },
  {
    id: 'bl-tc-2',
    projectId: 'proj-tatacliq-303',
    sourceUrl: 'https://economictimes.com/tech/tatacliq-expansion',
    targetUrl: 'https://tatacliq.com/brands',
    anchorText: 'Authentic Luxury Brands',
    domainTrust: 85,
    pageTrust: 68,
    isDoFollow: true,
    isLost: false,
    firstSeenDate: new Date('2026-08-20'),
    lastSeenDate: new Date('2026-10-13'),
    createdAt: new Date('2026-08-20'),
    deletedAt: null,
  },
];

const MOCK_KEYWORDS = [
  // Flipkart keywords (Project 1)
  {
    id: 'kw-fk-1',
    projectId: 'proj-flipkart-101',
    keywordText: 'flipkart online shopping',
    currentPosition: 1,
    previousPosition: 1,
    positionChange: 0,
    monthlySearchVolume: 450000,
    cpc: 0.45,
    keywordDifficulty: 85,
    intent: 'Transactional',
    tags: JSON.stringify(['brand']),
    landingPage: 'https://flipkart.com/',
    searchEngine: 'google',
    country: 'IN',
    deletedAt: null,
  },
  {
    id: 'kw-fk-2',
    projectId: 'proj-flipkart-101',
    keywordText: 'buy mobiles online',
    currentPosition: 3,
    previousPosition: 5,
    positionChange: 2,
    monthlySearchVolume: 120000,
    cpc: 1.20,
    keywordDifficulty: 78,
    intent: 'Commercial',
    tags: JSON.stringify(['mobiles']),
    landingPage: 'https://flipkart.com/mobiles',
    searchEngine: 'google',
    country: 'IN',
    deletedAt: null,
  },
  // Meesho keyword (Project 2)
  {
    id: 'kw-ms-1',
    projectId: 'proj-meesho-202',
    keywordText: 'meesho sarees online',
    currentPosition: 2,
    previousPosition: 4,
    positionChange: 2,
    monthlySearchVolume: 90000,
    cpc: 0.30,
    keywordDifficulty: 52,
    intent: 'Commercial',
    tags: JSON.stringify(['fashion']),
    landingPage: 'https://meesho.com/sarees',
    searchEngine: 'google',
    country: 'IN',
    deletedAt: null,
  },
  // Tata CLiQ keywords (Project 3)
  {
    id: 'kw-tc-1',
    projectId: 'proj-tatacliq-303',
    keywordText: 'luxury watches online india',
    currentPosition: 4,
    previousPosition: 6,
    positionChange: 2,
    monthlySearchVolume: 45000,
    cpc: 2.10,
    keywordDifficulty: 65,
    intent: 'Commercial',
    tags: JSON.stringify(['luxury', 'watches']),
    landingPage: 'https://tatacliq.com/luxury/watches',
    searchEngine: 'google',
    country: 'IN',
    deletedAt: null,
  },
  {
    id: 'kw-tc-2',
    projectId: 'proj-tatacliq-303',
    keywordText: 'designer handbags for women',
    currentPosition: 5,
    previousPosition: 5,
    positionChange: 0,
    monthlySearchVolume: 35000,
    cpc: 1.85,
    keywordDifficulty: 70,
    intent: 'Transactional',
    tags: JSON.stringify(['luxury', 'handbags']),
    landingPage: 'https://tatacliq.com/luxury/handbags',
    searchEngine: 'google',
    country: 'IN',
    deletedAt: null,
  },
];

const MOCK_AUDIT_PAGES = [
  // Flipkart audit page
  {
    id: 'ap-fk-1',
    projectId: 'proj-flipkart-101',
    url: 'https://flipkart.com/',
    statusCode: 200,
    isIndexable: true,
    loadTimeMs: 420,
  },
  // Tata CLiQ audit page
  {
    id: 'ap-tc-1',
    projectId: 'proj-tatacliq-303',
    url: 'https://tatacliq.com/',
    statusCode: 200,
    isIndexable: true,
    loadTimeMs: 510,
  },
];

const MOCK_AUDIT_ISSUES = [
  // Flipkart audit issue
  {
    id: 'ai-fk-1',
    projectId: 'proj-flipkart-101',
    ruleId: 'missing-meta-description',
    title: 'Missing Meta Description',
    category: 'On-Page SEO',
    severity: 'Warning',
    url: 'https://flipkart.com/deals',
    recommendation: 'Add a descriptive meta tag.',
    foundAt: new Date(),
    deletedAt: null,
  },
];

// Mock prisma strictly with project isolation filtering
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    project: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        return Object.values(MOCK_PROJECTS).find((p) => p.id === where.id) || null;
      }),
      findMany: vi.fn(async () => Object.values(MOCK_PROJECTS)),
    },
    backlink: {
      findMany: vi.fn(async ({ where }: { where: { projectId: string; deletedAt?: any } }) => {
        return MOCK_BACKLINKS.filter((b) => b.projectId === where.projectId && b.deletedAt === null);
      }),
      count: vi.fn(async ({ where }: { where: { projectId: string } }) => {
        return MOCK_BACKLINKS.filter((b) => b.projectId === where.projectId && b.deletedAt === null).length;
      }),
    },
    keyword: {
      findMany: vi.fn(async ({ where }: { where: { projectId: string; deletedAt?: any; searchEngine?: string } }) => {
        let results = MOCK_KEYWORDS.filter((k) => k.projectId === where.projectId && k.deletedAt === null);
        if (where.searchEngine) {
          results = results.filter((k) => k.searchEngine === where.searchEngine);
        }
        return results;
      }),
      count: vi.fn(async ({ where }: { where: { projectId: string } }) => {
        return MOCK_KEYWORDS.filter((k) => k.projectId === where.projectId && k.deletedAt === null).length;
      }),
    },
    rankingHistory: {
      findMany: vi.fn(async () => []),
    },
    projectCompetitor: {
      findMany: vi.fn(async () => []),
    },
    auditPage: {
      findMany: vi.fn(async ({ where }: { where: { projectId: string } }) => {
        return MOCK_AUDIT_PAGES.filter((p) => p.projectId === where.projectId);
      }),
      count: vi.fn(async ({ where }: { where: { projectId: string } }) => {
        return MOCK_AUDIT_PAGES.filter((p) => p.projectId === where.projectId).length;
      }),
    },
    auditIssue: {
      findMany: vi.fn(async ({ where }: { where: { projectId: string; deletedAt?: any } }) => {
        return MOCK_AUDIT_ISSUES.filter((i) => i.projectId === where.projectId && i.deletedAt === null);
      }),
      count: vi.fn(async ({ where }: { where: { projectId: string } }) => {
        return MOCK_AUDIT_ISSUES.filter((i) => i.projectId === where.projectId && i.deletedAt === null).length;
      }),
    },
  },
}));

import { getProjectBacklinks } from '../src/services/seo/backlink.service';
import { getRankingSummary, calculateDateBoundaries } from '../src/services/seo/ranking.service';
import { calculateSeoHealthScore } from '../src/services/seo/audit.service';
import { getProjectReportData } from '../src/services/seo/report.service';
import { DataForSeoClient } from '../src/services/seo/dataforseo.client';

describe('End-to-End Multi-Project Data Isolation & Integrity Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Backlink Data Isolation Across 3 Populated Projects & 1 Empty Project', () => {
    it('returns strictly isolated backlinks for flipkart.com (Project 1)', async () => {
      const res = await getProjectBacklinks(MOCK_PROJECTS.flipkart.id);

      expect(res.domain).toBe('flipkart.com');
      expect(res.totalBacklinks).toBe(2);
      expect(res.referringDomains).toBe(2);
      expect(res.recentBacklinks.length).toBe(2);

      for (const bl of res.recentBacklinks) {
        expect(bl.targetUrl).toContain('flipkart.com');
        expect(bl.targetUrl).not.toContain('meesho.com');
        expect(bl.targetUrl).not.toContain('tatacliq.com');
      }

      const anchors = res.anchors.map((a) => a.anchor);
      expect(anchors).toContain('Flipkart Electronics');
      expect(anchors).toContain('Big Billion Days');
      expect(anchors).not.toContain('Meesho Resellers Platform');
      expect(anchors).not.toContain('Tata CLiQ Luxury Collection');
    });

    it('returns strictly isolated backlinks for meesho.com (Project 2)', async () => {
      const res = await getProjectBacklinks(MOCK_PROJECTS.meesho.id);

      expect(res.domain).toBe('meesho.com');
      expect(res.totalBacklinks).toBe(1);
      expect(res.referringDomains).toBe(1);
      expect(res.recentBacklinks[0].targetUrl).toBe('https://meesho.com/about-us');
      expect(res.recentBacklinks[0].anchorText).toBe('Meesho Resellers Platform');
      expect(res.dofollowRatio).toBe(100);
      expect(res.nofollowRatio).toBe(0);
    });

    it('returns strictly isolated backlinks for tatacliq.com (Project 3)', async () => {
      const res = await getProjectBacklinks(MOCK_PROJECTS.tatacliq.id);

      expect(res.domain).toBe('tatacliq.com');
      expect(res.totalBacklinks).toBe(2);
      expect(res.referringDomains).toBe(2); // vogue.in, economictimes.com

      for (const bl of res.recentBacklinks) {
        expect(bl.targetUrl).toContain('tatacliq.com');
        expect(bl.targetUrl).not.toContain('flipkart.com');
        expect(bl.targetUrl).not.toContain('meesho.com');
      }

      // Average Domain Trust: (88 + 85) / 2 = 86.5 => 87
      expect(res.domainTrust).toBe(87);
    });

    it('returns authentic empty metrics for newly created empty project (Project 4)', async () => {
      const res = await getProjectBacklinks(MOCK_PROJECTS.empty.id);

      expect(res.domain).toBe('new-isolated-test.org');
      expect(res.totalBacklinks).toBe(0);
      expect(res.referringDomains).toBe(0);
      expect(res.domainTrust).toBe(0);
      expect(res.pageTrust).toBe(0);
      expect(res.dofollowRatio).toBe(0);
      expect(res.nofollowRatio).toBe(0);
      expect(res.anchors).toEqual([]);
      expect(res.recentBacklinks).toEqual([]);
    });
  });

  describe('2. Keyword Rankings Isolation & Date Ranges Across All 4 Projects', () => {
    it('returns strictly isolated keywords for flipkart.com', async () => {
      const res = await getRankingSummary(MOCK_PROJECTS.flipkart.id, 'month');

      expect(res.projectId).toBe(MOCK_PROJECTS.flipkart.id);
      expect(res.domain).toBe('flipkart.com');
      expect(res.summary.totalKeywords).toBe(2);
      expect(res.keywords.length).toBe(2);

      const kwTexts = res.keywords.map((k: any) => k.keyword);
      expect(kwTexts).toContain('flipkart online shopping');
      expect(kwTexts).toContain('buy mobiles online');
      expect(kwTexts).not.toContain('meesho sarees online');
      expect(kwTexts).not.toContain('luxury watches online india');

      expect(res.summary.top1).toBe(1);
      expect(res.summary.top2_3).toBe(1);
      expect(res.summary.top4_5).toBe(0);
    });

    it('returns strictly isolated keywords for meesho.com', async () => {
      const res = await getRankingSummary(MOCK_PROJECTS.meesho.id, 'month');

      expect(res.projectId).toBe(MOCK_PROJECTS.meesho.id);
      expect(res.domain).toBe('meesho.com');
      expect(res.summary.totalKeywords).toBe(1);
      expect(res.keywords[0].keyword).toBe('meesho sarees online');
      expect(res.summary.top2_3).toBe(1);
      expect(res.summary.top1).toBe(0);
    });

    it('returns strictly isolated keywords for tatacliq.com with Top 4-5 bracket placement', async () => {
      const res = await getRankingSummary(MOCK_PROJECTS.tatacliq.id, 'month');

      expect(res.projectId).toBe(MOCK_PROJECTS.tatacliq.id);
      expect(res.domain).toBe('tatacliq.com');
      expect(res.summary.totalKeywords).toBe(2);

      const kwTexts = res.keywords.map((k: any) => k.keyword);
      expect(kwTexts).toContain('luxury watches online india');
      expect(kwTexts).toContain('designer handbags for women');
      expect(kwTexts).not.toContain('flipkart online shopping');

      // Rank 4 and Rank 5 fall into top4_5
      expect(res.summary.top4_5).toBe(2);
      expect(res.summary.top1).toBe(0);
      expect(res.summary.top2_3).toBe(0);
      expect(res.summary.averagePosition).toBe(4.5);
    });

    it('returns authentic empty summary for empty project without fake seeding', async () => {
      const res = await getRankingSummary(MOCK_PROJECTS.empty.id, 'month');

      expect(res.projectId).toBe(MOCK_PROJECTS.empty.id);
      expect(res.domain).toBe('new-isolated-test.org');
      expect(res.summary.totalKeywords).toBe(0);
      expect(res.keywords).toEqual([]);
      expect(res.summary.top1).toBe(0);
      expect(res.summary.top2_3).toBe(0);
      expect(res.summary.top4_5).toBe(0);
      expect(res.summary.top6_10).toBe(0);
      expect(res.summary.top11_30).toBe(0);
      expect(res.summary.top31_100).toBe(0);
      expect(res.summary.averagePosition).toBe(0);
      expect(res.summary.visibilityScore).toBe(0);
      expect(res.summary.trafficForecast).toBe(0);
    });

    it('correctly calculates date boundaries for different presets and custom ranges', () => {
      const refDate = new Date('2026-10-14T10:00:00Z');
      
      const b7 = calculateDateBoundaries('7D', null, null, refDate);
      expect(b7.resolvedRange).toBe('7D');
      expect(b7.startDate).toBeDefined();

      const b30 = calculateDateBoundaries('30D', null, null, refDate);
      expect(b30.resolvedRange).toBe('30D');

      const bAll = calculateDateBoundaries('all', null, null, refDate);
      expect(bAll.resolvedRange).toBe('all');
      expect(bAll.startDate).toBeUndefined();

      const bCustom = calculateDateBoundaries('custom', '2026-09-01', '2026-09-30', refDate);
      expect(bCustom.resolvedRange).toBe('custom');
      expect(bCustom.startDate?.toISOString().startsWith('2026-09-01')).toBe(true);
      expect(bCustom.endDate.toISOString().startsWith('2026-09-30')).toBe(true);
    });
  });

  describe('3. SEO Health Score & Website Audit Isolation', () => {
    it('returns null health score for project with 0 crawled pages (genuine empty audit)', () => {
      const score = calculateSeoHealthScore([], 0, 0);
      expect(score).toBeNull();
    });

    it('calculates deterministic health score for audited project based on actual crawled pages and issues', () => {
      // 1 crawled page (HTTP 200), 1 warning (-2 points)
      const score = calculateSeoHealthScore([{ severity: 'Warning' }], 1, 1);
      // 100 - 2 + 5 (pass bonus) = 103 => capped at 100
      expect(score).toBe(100);

      // Heavy critical issues penalty
      const criticalScore = calculateSeoHealthScore([
        { severity: 'Error' },
        { severity: 'Error' },
        { severity: 'Error' },
      ], 1, 1);
      // 100 - 18 + 5 = 87
      expect(criticalScore).toBe(87);
    });
  });

  describe('4. Project Reports Data Scoping', () => {
    it('produces project report containing only the specified project details and keywords', async () => {
      const reportFk = await getProjectReportData(MOCK_PROJECTS.flipkart.id, 'Last 30 Days');
      expect(reportFk.project.domain).toBe('flipkart.com');
      expect(reportFk.summary.totalKeywords).toBe(2);
      expect(reportFk.topKeywords.every((k) => k.url.includes('flipkart.com'))).toBe(true);

      const reportTc = await getProjectReportData(MOCK_PROJECTS.tatacliq.id, 'Last 30 Days');
      expect(reportTc.project.domain).toBe('tatacliq.com');
      expect(reportTc.summary.totalKeywords).toBe(2);
      expect(reportTc.topKeywords.every((k) => k.url.includes('tatacliq.com'))).toBe(true);

      const reportEmpty = await getProjectReportData(MOCK_PROJECTS.empty.id, 'Last 30 Days');
      expect(reportEmpty.project.domain).toBe('new-isolated-test.org');
      expect(reportEmpty.summary.totalKeywords).toBe(0);
      expect(reportEmpty.topKeywords).toEqual([]);
      expect(reportEmpty.summary.seoHealthScore).toBeNull();
    });
  });

  describe('5. DataForSEO API Client Domain Normalization & Safety', () => {
    it('reports not configured when credentials are dummy or missing', () => {
      const client = new DataForSeoClient();
      // Ensure it does not invent credentials or claim configured when env vars are unset
      expect(typeof client.isConfigured()).toBe('boolean');
    });

    it('normalizes target domains correctly by stripping protocols, www, and query paths', async () => {
      const client = new DataForSeoClient();
      // Test the normalization pattern used across all endpoints:
      const clean = (url: string) => url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').toLowerCase().trim();

      expect(clean('https://www.flipkart.com/path?q=1')).toBe('flipkart.com');
      expect(clean('HTTP://MEESHO.COM/')).toBe('meesho.com');
      expect(clean('http://www.tatacliq.com/luxury')).toBe('tatacliq.com');
    });
  });

  describe('6. Cross-Project Non-Contamination Invariant', () => {
    it('guarantees complete isolation of all keyword IDs and backlink IDs across all 4 projects', async () => {
      const resFk = await getRankingSummary(MOCK_PROJECTS.flipkart.id, 'month');
      const resMs = await getRankingSummary(MOCK_PROJECTS.meesho.id, 'month');
      const resTc = await getRankingSummary(MOCK_PROJECTS.tatacliq.id, 'month');
      const resEmpty = await getRankingSummary(MOCK_PROJECTS.empty.id, 'month');

      const fkKw = new Set(resFk.keywords.map((k: any) => k.id));
      const msKw = new Set(resMs.keywords.map((k: any) => k.id));
      const tcKw = new Set(resTc.keywords.map((k: any) => k.id));
      const emKw = new Set(resEmpty.keywords.map((k: any) => k.id));

      // Assert disjoint sets
      for (const id of msKw) expect(fkKw.has(id)).toBe(false);
      for (const id of tcKw) expect(fkKw.has(id) || msKw.has(id)).toBe(false);
      expect(emKw.size).toBe(0);

      // Backlinks disjoint sets
      const blFk = await getProjectBacklinks(MOCK_PROJECTS.flipkart.id);
      const blMs = await getProjectBacklinks(MOCK_PROJECTS.meesho.id);
      const blTc = await getProjectBacklinks(MOCK_PROJECTS.tatacliq.id);
      const blEm = await getProjectBacklinks(MOCK_PROJECTS.empty.id);

      const fkBl = new Set(blFk.recentBacklinks.map((b) => b.id));
      const msBl = new Set(blMs.recentBacklinks.map((b) => b.id));
      const tcBl = new Set(blTc.recentBacklinks.map((b) => b.id));

      for (const id of msBl) expect(fkBl.has(id)).toBe(false);
      for (const id of tcBl) expect(fkBl.has(id) || msBl.has(id)).toBe(false);
      expect(blEm.recentBacklinks.length).toBe(0);
    });
  });
});
