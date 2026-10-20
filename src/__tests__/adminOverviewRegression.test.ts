import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '../lib/db/prisma';
import { hashPassword, createSession, SESSION_COOKIE_NAME } from '../lib/server/auth';
import { GET as overviewGet } from '../app/api/admin/overview/route';

describe('Admin Overview Metrics Regression Suite', () => {
  let adminUserId: string;
  let adminSessionToken: string;

  beforeAll(async () => {
    // 1. Create a transient admin user for this test
    const adminUser = await prisma.user.create({
      data: {
        email: `overview-admin-test-${Date.now()}@example.com`,
        name: 'Overview Regression Admin',
        role: 'ADMIN',
        status: 'active',
        passwordHash: hashPassword('TestAdminPassword123#'),
      },
    });
    adminUserId = adminUser.id;

    const session = await createSession(adminUser.id);
    adminSessionToken = session.sessionToken;
  });

  afterAll(async () => {
    // Thorough cleanup
    if (adminUserId) {
      await prisma.session.deleteMany({ where: { userId: adminUserId } }).catch(() => {});
      await prisma.activityLog.deleteMany({ where: { userId: adminUserId } }).catch(() => {});
      await prisma.user.delete({ where: { id: adminUserId } }).catch(() => {});
    }
  });

  it('rejects unauthenticated requests with 401/403', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/overview?timeRange=all');
    const res = await overviewGet(req);
    expect([401, 403]).toContain(res.status);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('returns genuine, live database-backed metrics that match Prisma query results', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/overview?timeRange=all', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${adminSessionToken}`,
        authorization: `Bearer ${adminSessionToken}`,
      },
    });

    const res = await overviewGet(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    const { data } = json;

    // 1. Compare directly with raw Prisma counts
    const expectedUserCount = await prisma.user.count();
    const expectedProjectCount = await prisma.project.count({ where: { deletedAt: null } });
    const expectedUniqueDomains = await prisma.project.findMany({
      where: { deletedAt: null },
      select: { domain: true },
      distinct: ['domain'],
    });
    const expectedKeywordCount = await prisma.keyword.count({ where: { deletedAt: null } });
    const expectedAuditPageCount = await prisma.auditPage.count();
    const expectedAuditIssueCount = await prisma.auditIssue.count({ where: { deletedAt: null } });
    const expectedBacklinkCount = await prisma.backlink.count({ where: { deletedAt: null } });

    expect(Math.abs(data.users.total - expectedUserCount)).toBeLessThanOrEqual(5);
    expect(Math.abs(data.projects.total - expectedProjectCount)).toBeLessThanOrEqual(5);
    expect(Math.abs(data.projects.uniqueDomains - expectedUniqueDomains.length)).toBeLessThanOrEqual(5);
    expect(Math.abs(data.seo.keywords - expectedKeywordCount)).toBeLessThanOrEqual(10);
    expect(Math.abs(data.seo.auditPages - expectedAuditPageCount)).toBeLessThanOrEqual(5);
    expect(Math.abs(data.seo.auditIssues.total - expectedAuditIssueCount)).toBeLessThanOrEqual(5);
    expect(Math.abs(data.seo.backlinks - expectedBacklinkCount)).toBeLessThanOrEqual(5);

    // 2. Verify all 6 providers exist with truthful status
    const providerIds = data.providers.map((p: any) => p.id);
    expect(providerIds).toContain('serper');
    expect(providerIds).toContain('yepapi');
    expect(providerIds).toContain('pagespeed');
    expect(providerIds).toContain('openai');
    expect(providerIds).toContain('google-ai');
    expect(providerIds).toContain('database');

    // 3. Verify PageSpeed operates with healthy status (public quota or key)
    const pageSpeedProvider = data.providers.find((p: any) => p.id === 'pagespeed');
    expect(pageSpeedProvider.status).toBe('HEALTHY');
    expect(pageSpeedProvider.configured).toBe(true);

    // 4. Verify YepAPI honestly reports BLOCKED_CREDITS when key is configured but balance is $0
    const yepapiProvider = data.providers.find((p: any) => p.id === 'yepapi');
    if (process.env.YEPAPI_KEY) {
      expect(yepapiProvider.status).toBe('BLOCKED_CREDITS');
      expect(yepapiProvider.details).toMatch(/402|Quota|Insufficient/i);
    }

    // 5. Verify OpenAI presence
    const openAiProvider = data.providers.find((p: any) => p.id === 'openai');
    expect(openAiProvider).toBeDefined();
    if (process.env.OPENAI_KEY || process.env.OPENAI_API_KEY) {
      expect(openAiProvider.status).toBe('HEALTHY');
    }

    // 6. Verify job reconciliation
    const sumJobStatuses =
      data.jobs.queued +
      data.jobs.running +
      data.jobs.completed +
      data.jobs.failed +
      data.jobs.cancelled;
    expect(data.jobs.total).toBe(sumJobStatuses);
  });
});
