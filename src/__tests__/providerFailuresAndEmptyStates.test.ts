import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { SerperProvider } from '../lib/rankings/serper';
import { YepApiRankingProvider } from '../lib/rankings/yepapi';
import { calculateDateBoundaries } from '../services/seo/ranking.service';
import { calculateSeoHealthScore } from '../services/seo/audit.service';
import { GET as analyticsGet } from '../app/api/projects/[id]/analytics/route';
import { GET as competitorsGet } from '../app/api/projects/[id]/competitors/route';
import { GET as backlinksGet } from '../app/api/projects/[id]/backlinks/route';
import { GET as aiSearchGet } from '../app/api/projects/[id]/ai-search/route';
import { GET as historyGet } from '../app/api/projects/history/route';

describe('Provider Failures, Empty States & Authorization Suite', () => {
  describe('1. Unauthenticated Project API Rejections', () => {
    it('rejects unauthenticated GET /api/projects/[id]/analytics with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/projects/nonexistent-id/analytics');
      const res = await analyticsGet(req, { params: Promise.resolve({ id: 'nonexistent-id' }) });
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated GET /api/projects/[id]/competitors with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/projects/nonexistent-id/competitors');
      const res = await competitorsGet(req, { params: Promise.resolve({ id: 'nonexistent-id' }) });
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated GET /api/projects/[id]/backlinks with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/projects/nonexistent-id/backlinks');
      const res = await backlinksGet(req, { params: Promise.resolve({ id: 'nonexistent-id' }) });
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated GET /api/projects/[id]/ai-search with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/projects/nonexistent-id/ai-search');
      const res = await aiSearchGet(req, { params: Promise.resolve({ id: 'nonexistent-id' }) });
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated GET /api/projects/history with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/projects/history?ids=proj1');
      const res = await historyGet(req);
      expect(res.status).toBe(401);
    });
  });

  describe('2. Provider Error Handling & Status Code Mapping', () => {
    it('SerperProvider handles unconfigured state gracefully without throwing', async () => {
      const provider = new SerperProvider();
      // Temporarily override apiKey to simulate unconfigured
      (provider as unknown as { apiKey?: string }).apiKey = undefined;
      expect(provider.isConfigured()).toBe(false);

      const res = await provider.checkRankings([{ keyword: 'test', targetDomain: 'example.com' }]);
      expect(res.success).toBe(false);
      expect(res.error?.code).toBe('PROVIDER_UNCONFIGURED');
      expect(res.error?.statusCode).toBe(400);
      expect(res.results).toEqual([]);
    });

    it('SerperProvider maps HTTP 401 / 403 to INVALID_API_KEY', async () => {
      const provider = new SerperProvider();
      (provider as unknown as { apiKey?: string }).apiKey = 'test-key-invalid';

      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        status: 401,
        ok: false,
      } as unknown as Response);

      try {
        const res = await provider.checkRankings([{ keyword: 'test', targetDomain: 'example.com' }]);
        expect(res.success).toBe(false);
        expect(res.error?.code).toBe('INVALID_API_KEY');
        expect(res.error?.statusCode).toBe(401);
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('SerperProvider maps HTTP 429 to RATE_LIMITED', async () => {
      const provider = new SerperProvider();
      (provider as unknown as { apiKey?: string }).apiKey = 'test-key-limited';

      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        status: 429,
        ok: false,
      } as unknown as Response);

      try {
        const res = await provider.checkRankings([{ keyword: 'test', targetDomain: 'example.com' }]);
        expect(res.success).toBe(false);
        expect(res.error?.code).toBe('RATE_LIMITED');
        expect(res.error?.statusCode).toBe(429);
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('YepApiRankingProvider handles unconfigured state without throwing', async () => {
      const provider = new YepApiRankingProvider();
      const originalIsConfigured = provider.isConfigured;
      provider.isConfigured = () => false;

      const res = await provider.checkRankings([{ keyword: 'test', targetDomain: 'example.com' }]);
      expect(res.success).toBe(false);
      expect(res.error?.code).toBe('PROVIDER_UNCONFIGURED');
      expect(res.error?.statusCode).toBe(503);

      provider.isConfigured = originalIsConfigured;
    });

    it('YepApiRankingProvider maps NO_CREDITS / HTTP 402 to CREDITS_EXHAUSTED', async () => {
      const provider = new YepApiRankingProvider();
      const originalIsConfigured = provider.isConfigured;
      provider.isConfigured = () => true;

      const { yepApiClient } = await import('../lib/yepapi');
      const originalGetGoogleSerp = yepApiClient.getGoogleSerp;
      yepApiClient.getGoogleSerp = vi.fn().mockResolvedValue({
        ok: false,
        error: { code: 'NO_CREDITS', statusCode: 402, message: 'Account out of credits' },
      });

      const originalSerperKey = process.env.SERPER_API_KEY;
      delete process.env.SERPER_API_KEY;

      try {
        const res = await provider.checkRankings([{ keyword: 'test', targetDomain: 'example.com' }]);
        expect(res.success).toBe(false);
        expect(res.error?.code).toBe('CREDITS_EXHAUSTED');
        expect(res.error?.statusCode).toBe(402);
      } finally {
        if (originalSerperKey) process.env.SERPER_API_KEY = originalSerperKey;
        provider.isConfigured = originalIsConfigured;
        yepApiClient.getGoogleSerp = originalGetGoogleSerp;
      }
    });
  });

  describe('3. Date Range Boundary Integrity', () => {
    const fixedNow = new Date('2026-10-15T12:00:00.000Z');

    it('calculates 7D boundary spanning 7 days inclusive through 23:59:59.999', () => {
      const { startDate, endDate, resolvedRange } = calculateDateBoundaries('7D', null, null, fixedNow);
      expect(resolvedRange).toBe('7D');
      expect(endDate.getUTCHours()).toBe(23);
      expect(endDate.getUTCMinutes()).toBe(59);
      expect(endDate.getUTCSeconds()).toBe(59);
      expect(endDate.getUTCMilliseconds()).toBe(999);

      const diffDays = Math.round((endDate.getTime() - startDate!.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(7);
    });

    it('calculates 30D boundary spanning 30 days inclusive', () => {
      const { startDate, endDate, resolvedRange } = calculateDateBoundaries('30D', null, null, fixedNow);
      expect(resolvedRange).toBe('30D');
      const diffDays = Math.round((endDate.getTime() - startDate!.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(30);
    });

    it('handles "all" timeRange returning undefined startDate', () => {
      const { startDate, resolvedRange } = calculateDateBoundaries('all', null, null, fixedNow);
      expect(resolvedRange).toBe('all');
      expect(startDate).toBeUndefined();
    });

    it('parses valid custom start and end date bounds', () => {
      const customStart = '2026-09-01T00:00:00Z';
      const customEnd = '2026-09-15T00:00:00Z';
      const { startDate, endDate, resolvedRange } = calculateDateBoundaries('custom', customStart, customEnd, fixedNow);
      expect(resolvedRange).toBe('custom');
      expect(startDate?.getUTCFullYear()).toBe(2026);
      expect(startDate?.getUTCMonth()).toBe(8); // September is 8
      expect(startDate?.getUTCDate()).toBe(1);
      expect(endDate.getUTCDate()).toBe(15);
      expect(endDate.getUTCHours()).toBe(23);
    });
  });

  describe('4. Genuine Empty State Invariants', () => {
    it('calculateSeoHealthScore returns null for 0 crawled pages', () => {
      expect(calculateSeoHealthScore([], 0, 0)).toBeNull();
      expect(calculateSeoHealthScore([], 0, 10)).toBeNull();
    });

    it('calculateSeoHealthScore calculates real weighted score when pages are crawled', () => {
      const scoreNoIssues = calculateSeoHealthScore([], 10, 10);
      expect(scoreNoIssues).toBe(100);

      const scoreWithErrors = calculateSeoHealthScore(
        [{ severity: 'Error' }, { severity: 'Error' }],
        10,
        10
      );
      // 100 - (2 * 6) + 5 (all pages 200 pass bonus) = 93
      expect(scoreWithErrors).toBe(93);
    });
  });
});
