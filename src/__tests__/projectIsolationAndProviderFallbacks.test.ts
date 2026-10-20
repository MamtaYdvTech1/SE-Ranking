import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '../lib/db/prisma';
import { hashPassword, createSession, SESSION_COOKIE_NAME } from '../lib/server/auth';
import { GET as rankingsGet } from '../app/api/projects/[id]/rankings/route';
import { GET as seoPotentialGet, POST as seoPotentialPost } from '../app/api/analytics/seo-potential/route';
import { POST as backlinksPost } from '../app/api/projects/[id]/backlinks/route';
import { POST as auditStartPost } from '../app/api/projects/[id]/audit/start/route';
import { POST as keywordsPost } from '../app/api/seo/keywords/route';
import { POST as serpPost } from '../app/api/seo/serp/route';
import { getRankingProvider } from '../lib/rankings/provider';
import { SerperProvider } from '../lib/rankings/serper';
import { yepApiClient } from '../lib/yepapi';

describe('Project Isolation, Multi-User Authorization & Provider Fallbacks Regression Suite', () => {
  let userAlpha: any;
  let userBeta: any;
  let sessionAlphaToken: string;
  let sessionBetaToken: string;
  let projectAlpha: any;
  let projectBeta: any;
  let projectFresh: any;

  const createdUserIds: string[] = [];

  const cleanupTestData = async () => {
    try {
      if (createdUserIds.length > 0) {
        await prisma.session.deleteMany({ where: { userId: { in: createdUserIds } } });
        await prisma.activityLog.deleteMany({ where: { userId: { in: createdUserIds } } });
        await prisma.rankingHistory.deleteMany({
          where: { keyword: { project: { userId: { in: createdUserIds } } } },
        });
        await prisma.keyword.deleteMany({ where: { project: { userId: { in: createdUserIds } } } });
        await prisma.searchEngineConfig.deleteMany({ where: { project: { userId: { in: createdUserIds } } } });
        await prisma.projectIntegration.deleteMany({ where: { project: { userId: { in: createdUserIds } } } });
        await prisma.backlink.deleteMany({ where: { project: { userId: { in: createdUserIds } } } });
        await prisma.project.deleteMany({ where: { userId: { in: createdUserIds } } });
        await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
      }
    } catch {
      // ignore
    }
  };

  beforeEach(async () => {
    await cleanupTestData();

    const timestamp = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const emailAlpha = `user.alpha.${timestamp}@example.com`;
    const emailBeta = `user.beta.${timestamp}@example.com`;

    // 1. Create User Alpha and Project Alpha
    userAlpha = await prisma.user.create({
      data: {
        email: emailAlpha,
        name: 'User Alpha',
        passwordHash: hashPassword('AlphaPassword123#'),
        role: 'OWNER',
        status: 'active',
      },
    });
    createdUserIds.push(userAlpha.id);
    const sessionA = await createSession(userAlpha.id);
    sessionAlphaToken = sessionA.sessionToken;

    projectAlpha = await prisma.project.create({
      data: {
        userId: userAlpha.id,
        name: 'Alpha Project',
        domain: 'alpha-marketing.com',
        status: 'active',
        keywords: {
          create: [
            { keywordText: 'alpha keyword 1', currentPosition: 3, previousPosition: 5 },
            { keywordText: 'alpha keyword 2', currentPosition: 8, previousPosition: 9 },
          ],
        },
      },
      include: { keywords: true },
    });

    // 2. Create User Beta and Project Beta
    userBeta = await prisma.user.create({
      data: {
        email: emailBeta,
        name: 'User Beta',
        passwordHash: hashPassword('BetaPassword123#'),
        role: 'OWNER',
        status: 'active',
      },
    });
    createdUserIds.push(userBeta.id);
    const sessionB = await createSession(userBeta.id);
    sessionBetaToken = sessionB.sessionToken;

    projectBeta = await prisma.project.create({
      data: {
        userId: userBeta.id,
        name: 'Beta Project',
        domain: 'beta-tech.com',
        status: 'active',
        keywords: {
          create: [
            { keywordText: 'beta keyword exclusive', currentPosition: 1, previousPosition: 2 },
          ],
        },
      },
      include: { keywords: true },
    });

    // 3. Create Fresh New Project under User Alpha with NO data
    projectFresh = await prisma.project.create({
      data: {
        userId: userAlpha.id,
        name: 'Fresh New Project',
        domain: 'fresh-domain.com',
        status: 'active',
      },
    });
  }, 35000);

  afterAll(async () => {
    await cleanupTestData();
  }, 35000);

  // Helper to create authenticated requests
  const createAuthRequest = (url: string, token: string, options: any = {}) => {
    const { headers, ...rest } = options;
    return new NextRequest(url, {
      ...rest,
      headers: {
        ...(headers || {}),
        cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
    });
  };

  describe('1. Cross-Project Ownership and Access Control (User Isolation)', () => {
    it('User Alpha successfully accesses Project Alpha rankings', async () => {
      const req = createAuthRequest(
        `http://localhost:3000/api/projects/${projectAlpha.id}/rankings`,
        sessionAlphaToken
      );
      const res = await rankingsGet(req, { params: Promise.resolve({ id: projectAlpha.id }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.projectId).toBe(projectAlpha.id);
      expect(json.primaryDomain).toBe('alpha-marketing.com');
      expect(json.keywords.length).toBe(2);
      expect(json.keywords.map((k: any) => k.keyword)).toContain('alpha keyword 1');
    });

    it('rejects User Beta accessing Project Alpha rankings with 403 Forbidden', async () => {
      const req = createAuthRequest(
        `http://localhost:3000/api/projects/${projectAlpha.id}/rankings`,
        sessionBetaToken
      );
      const res = await rankingsGet(req, { params: Promise.resolve({ id: projectAlpha.id }) });
      expect(res.status).toBe(403);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('FORBIDDEN');
    });

    it('rejects User Beta accessing Project Alpha SEO potential with 403 Forbidden', async () => {
      const req = createAuthRequest(
        `http://localhost:3000/api/analytics/seo-potential?projectId=${projectAlpha.id}`,
        sessionBetaToken
      );
      const res = await seoPotentialGet(req);
      expect(res.status).toBe(403);
    });

    it('rejects User Beta saving SEO potential settings on Project Alpha with 403 Forbidden', async () => {
      const req = createAuthRequest(
        'http://localhost:3000/api/analytics/seo-potential',
        sessionBetaToken,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: projectAlpha.id,
            conversionRatio: '1:50',
            avgRevenue: 100,
          }),
        }
      );
      const res = await seoPotentialPost(req);
      expect(res.status).toBe(403);
    });

    it('rejects User Beta executing backlink sync on Project Alpha with 403 Forbidden', async () => {
      const req = createAuthRequest(
        `http://localhost:3000/api/projects/${projectAlpha.id}/backlinks`,
        sessionBetaToken,
        { method: 'POST' }
      );
      const res = await backlinksPost(req, { params: Promise.resolve({ id: projectAlpha.id }) });
      expect(res.status).toBe(403);
    });

    it('rejects User Beta initiating audit crawl on Project Alpha with 403 Forbidden', async () => {
      const req = createAuthRequest(
        `http://localhost:3000/api/projects/${projectAlpha.id}/audit/start`,
        sessionBetaToken,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ maxPages: 5 }),
        }
      );
      const res = await auditStartPost(req, { params: Promise.resolve({ id: projectAlpha.id }) });
      expect(res.status).toBe(403);
    });
  });

  describe('2. Project Switching and Data Isolation (No Cross-Contamination)', () => {
    it('Project Beta returns only Beta keywords and metrics with zero Alpha keywords', async () => {
      const req = createAuthRequest(
        `http://localhost:3000/api/projects/${projectBeta.id}/rankings`,
        sessionBetaToken
      );
      const res = await rankingsGet(req, { params: Promise.resolve({ id: projectBeta.id }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.projectId).toBe(projectBeta.id);
      expect(json.primaryDomain).toBe('beta-tech.com');
      expect(json.keywords.length).toBe(1);
      expect(json.keywords[0].keyword).toBe('beta keyword exclusive');

      // Verify NO Alpha keywords exist in Beta response
      const keywordNames = json.keywords.map((k: any) => k.keyword);
      expect(keywordNames).not.toContain('alpha keyword 1');
      expect(keywordNames).not.toContain('alpha keyword 2');
    });

    it('new project without data has empty state and does not inherit another project data', async () => {
      const req = createAuthRequest(
        `http://localhost:3000/api/projects/${projectFresh.id}/rankings`,
        sessionAlphaToken
      );
      const res = await rankingsGet(req, { params: Promise.resolve({ id: projectFresh.id }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.projectId).toBe(projectFresh.id);
      expect(json.primaryDomain).toBe('fresh-domain.com');
      expect(json.keywords).toEqual([]);
      expect(json.summary.totalKeywords).toBe(0);
      expect(json.summary.visibilityScore).toBe(0);
      expect(json.summary.top3).toBe(0);
      expect(json.summary.top10).toBe(0);
    });
  });

  describe('3. Date Range Filtering on Rankings', () => {
    it('supports 7D timeRange query parameter scoping correctly', async () => {
      const req = createAuthRequest(
        `http://localhost:3000/api/projects/${projectAlpha.id}/rankings?timeRange=7D`,
        sessionAlphaToken
      );
      const res = await rankingsGet(req, { params: Promise.resolve({ id: projectAlpha.id }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.timeRange).toBe('7D');
      expect(json.startDate).toBeDefined();
      expect(json.endDate).toBeDefined();
    });

    it('supports custom date range query parameters scoping correctly', async () => {
      const customStart = '2026-09-01T00:00:00.000Z';
      const customEnd = '2026-09-15T23:59:59.999Z';
      const req = createAuthRequest(
        `http://localhost:3000/api/projects/${projectAlpha.id}/rankings?timeRange=custom&startDate=${customStart}&endDate=${customEnd}`,
        sessionAlphaToken
      );
      const res = await rankingsGet(req, { params: Promise.resolve({ id: projectAlpha.id }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.timeRange).toBe('custom');
      expect(json.startDate).toBe(customStart);
    });
  });

  describe('4. Provider Selection & Fallback Mechanisms', () => {
    it('getRankingProvider honors RANKING_PROVIDER=serper when configured', () => {
      const originalEnv = process.env.RANKING_PROVIDER;
      try {
        process.env.RANKING_PROVIDER = 'serper';
        const provider = getRankingProvider();
        expect(provider.name).toBe('Serper.dev Google SERP');
        expect(provider instanceof SerperProvider).toBe(true);
      } finally {
        process.env.RANKING_PROVIDER = originalEnv;
      }
    });

    it('/api/seo/keywords returns HTTP 402 with actionable message when YepAPI runs out of credits', async () => {
      const originalGetKeywords = yepApiClient.getKeywords;
      yepApiClient.getKeywords = vi.fn().mockResolvedValue({
        ok: false,
        error: { code: 'NO_CREDITS', statusCode: 402, message: 'Account out of credits' },
      });

      try {
        const req = createAuthRequest(
          'http://localhost:3000/api/seo/keywords',
          sessionAlphaToken,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keywords: ['digital marketing'] }),
          }
        );
        const res = await keywordsPost(req);
        expect(res.status).toBe(402);

        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.code).toBe('NO_CREDITS');
        expect(json.error).toMatch(/credits/i);
      } finally {
        yepApiClient.getKeywords = originalGetKeywords;
      }
    });

    it('/api/seo/serp falls back to Serper when YepAPI returns NO_CREDITS', async () => {
      const originalGetGoogleSerp = yepApiClient.getGoogleSerp;
      yepApiClient.getGoogleSerp = vi.fn().mockResolvedValue({
        ok: false,
        error: { code: 'NO_CREDITS', statusCode: 402, message: 'Account out of credits' },
      });

      // Mock fetch for Serper Google SERP API
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockImplementation((url: string | URL | Request) => {
        const urlStr = url.toString();
        if (urlStr.includes('google.serper.dev')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              searchParameters: { q: 'seo tools' },
              organic: [
                {
                  position: 1,
                  title: 'Top SEO Tools',
                  link: 'https://example.com/top-tools',
                  snippet: 'Best tools for SEO in 2026',
                },
              ],
            }),
          } as Response);
        }
        return originalFetch(url);
      });

      try {
        const req = createAuthRequest(
          'http://localhost:3000/api/seo/serp',
          sessionAlphaToken,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'seo tools' }),
          }
        );
        const res = await serpPost(req);
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.provider).toBe('Serper.dev');
        expect(json.data.results.length).toBeGreaterThan(0);
        expect(json.data.results[0].title).toBe('Top SEO Tools');
      } finally {
        yepApiClient.getGoogleSerp = originalGetGoogleSerp;
        global.fetch = originalFetch;
      }
    });
  });

  describe('5. Keyword Research and Competitors Request Validation', () => {
    it('rejects unauthenticated keyword research requests with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/seo/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: ['test'] }),
      });
      const res = await keywordsPost(req);
      expect(res.status).toBe(401);
    });

    it('rejects empty keyword payload with 400 Validation Error', async () => {
      const req = createAuthRequest(
        'http://localhost:3000/api/seo/keywords',
        sessionAlphaToken,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords: [] }),
        }
      );
      const res = await keywordsPost(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it('rejects invalid JSON request body with 400', async () => {
      const req = createAuthRequest(
        'http://localhost:3000/api/seo/keywords',
        sessionAlphaToken,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'not-json-content',
        }
      );
      const res = await keywordsPost(req);
      expect(res.status).toBe(400);
    });
  });
});
