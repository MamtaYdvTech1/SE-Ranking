import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as uploadLogoPost } from '../app/api/agency-pack/upload-logo/route';
import { GET as reportBuilderGet, POST as reportBuilderPost } from '../app/api/agency-pack/report-builder/route';
import { GET as usersGet, POST as usersPost } from '../app/api/users/route';
import { POST as serpPost } from '../app/api/seo/serp/route';
import { POST as keywordsPost } from '../app/api/seo/keywords/route';
import { POST as keywordIdeasPost } from '../app/api/seo/keyword-ideas/route';
import { POST as keywordDifficultyPost } from '../app/api/seo/keyword-difficulty/route';
import { POST as competitorsPost } from '../app/api/seo/competitors/route';
import { POST as backlinksPost } from '../app/api/seo/backlinks/route';
import { GET as projectsGet } from '../app/api/projects/route';
import { prisma } from '../lib/db/prisma';
import { createSession, setSessionCookie, hashPassword } from '../lib/server/auth';

describe('Phase 1 Critical Security Hotfixes Suite', () => {
  let testUser: { id: string; email: string };
  let testSessionCookie: string;

  beforeEach(async () => {
    // Clean up any test users from prior runs
    await prisma.session.deleteMany({
      where: { user: { email: { startsWith: 'sec.test.' } } },
    }).catch(() => {});
    await prisma.project.deleteMany({
      where: { user: { email: { startsWith: 'sec.test.' } } },
    }).catch(() => {});
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'sec.test.' } },
    }).catch(() => {});

    // Create an authenticated OWNER user for testing
    testUser = await prisma.user.create({
      data: {
        email: `sec.test.${Date.now()}@example.com`,
        name: 'Security Test User',
        role: 'OWNER',
        status: 'active',
        passwordHash: hashPassword('TestSecurePass123#'),
      },
    });

    const dummyReq = new NextRequest('http://localhost:3000');
    const { sessionToken, expiresAt } = await createSession(testUser.id, dummyReq);
    const dummyRes = new (await import('next/server')).NextResponse();
    await setSessionCookie(dummyRes, sessionToken, expiresAt);
    testSessionCookie = dummyRes.cookies.get('seranking_session')?.value || '';
  });

  describe('1. SEO Routes Auth Enforcement (isDev Bypass Removal)', () => {
    it('rejects unauthenticated POST /api/seo/serp with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/seo/serp', {
        method: 'POST',
        body: JSON.stringify({ query: 'seo audit' }),
      });
      const res = await serpPost(req);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated POST /api/seo/keywords with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/seo/keywords', {
        method: 'POST',
        body: JSON.stringify({ query: 'seo audit' }),
      });
      const res = await keywordsPost(req);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated POST /api/seo/keyword-ideas with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/seo/keyword-ideas', {
        method: 'POST',
        body: JSON.stringify({ query: 'seo audit' }),
      });
      const res = await keywordIdeasPost(req);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated POST /api/seo/keyword-difficulty with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/seo/keyword-difficulty', {
        method: 'POST',
        body: JSON.stringify({ keywords: ['rank tracking'] }),
      });
      const res = await keywordDifficultyPost(req);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated POST /api/seo/competitors with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/seo/competitors', {
        method: 'POST',
        body: JSON.stringify({ domain: 'example.com' }),
      });
      const res = await competitorsPost(req);
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated POST /api/seo/backlinks with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/seo/backlinks', {
        method: 'POST',
        body: JSON.stringify({ target: 'example.com' }),
      });
      const res = await backlinksPost(req);
      expect(res.status).toBe(401);
    });
  });

  describe('2. Upload Logo Route Security', () => {
    it('rejects unauthenticated uploads with 401', async () => {
      const formData = new FormData();
      formData.append('file', new File(['fake image'], 'logo.png', { type: 'image/png' }));
      const req = new NextRequest('http://localhost:3000/api/agency-pack/upload-logo', {
        method: 'POST',
      });
      req.formData = async () => formData;
      const res = await uploadLogoPost(req);
      expect(res.status).toBe(401);
    });

    it('rejects non-image MIME types and executable extensions with 400', async () => {
      const formData = new FormData();
      formData.append('file', new File(['<?php echo "evil"; ?>'], 'script.php', { type: 'application/x-php' }));
      const req = new NextRequest('http://localhost:3000/api/agency-pack/upload-logo', {
        method: 'POST',
        headers: {
          cookie: `seranking_session=${testSessionCookie}`,
        },
      });
      req.formData = async () => formData;
      const res = await uploadLogoPost(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/Invalid file type/i);
    });
  });

  describe('3. Report Builder Config Security & Isolation', () => {
    it('rejects unauthenticated GET /api/agency-pack/report-builder with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/agency-pack/report-builder', {
        method: 'GET',
      });
      const res = await reportBuilderGet(req);
      expect(res.status).toBe(401);
    });

    it('allows authenticated user to retrieve and update private settings', async () => {
      const getReq = new NextRequest('http://localhost:3000/api/agency-pack/report-builder', {
        method: 'GET',
        headers: {
          cookie: `seranking_session=${testSessionCookie}`,
        },
      });
      const getRes = await reportBuilderGet(getReq);
      expect(getRes.status).toBe(200);
      const getData = await getRes.json();
      expect(getData.success).toBe(true);

      const postReq = new NextRequest('http://localhost:3000/api/agency-pack/report-builder', {
        method: 'POST',
        body: JSON.stringify({ companyName: 'Custom Isolated Agency' }),
        headers: {
          cookie: `seranking_session=${testSessionCookie}`,
          'Content-Type': 'application/json',
        },
      });
      const postRes = await reportBuilderPost(postReq);
      expect(postRes.status).toBe(200);
      const postData = await postRes.json();
      expect(postData.data.companyName).toBe('Custom Isolated Agency');
    });
  });

  describe('4. Users API Database Backing & Authorization', () => {
    it('rejects unauthenticated GET /api/users with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/users', {
        method: 'GET',
      });
      const res = await usersGet(req);
      expect(res.status).toBe(401);
    });

    it('returns sanitized user list without passwordHash', async () => {
      const req = new NextRequest('http://localhost:3000/api/users', {
        method: 'GET',
        headers: {
          cookie: `seranking_session=${testSessionCookie}`,
        },
      });
      const res = await usersGet(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.users)).toBe(true);
      for (const u of data.users) {
        expect((u as Record<string, unknown>).passwordHash).toBeUndefined();
      }
    });

    it('prevents non-admin MEMBER role from adding new users (403)', async () => {
      const memberUser = await prisma.user.create({
        data: {
          email: `sec.test.member.${Date.now()}@example.com`,
          name: 'Regular Member',
          role: 'MEMBER',
          status: 'active',
          passwordHash: hashPassword('MemberPass123#'),
        },
      });
      const dummyReq = new NextRequest('http://localhost:3000');
      const { sessionToken, expiresAt } = await createSession(memberUser.id, dummyReq);
      const dummyRes = new (await import('next/server')).NextResponse();
      await setSessionCookie(dummyRes, sessionToken, expiresAt);
      const memberCookie = dummyRes.cookies.get('seranking_session')?.value || '';

      const req = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          accountType: 'CLIENT',
        }),
        headers: {
          cookie: `seranking_session=${memberCookie}`,
          'Content-Type': 'application/json',
        },
      });
      const res = await usersPost(req);
      expect(res.status).toBe(403);
    });
  });

  describe('5. Prevention of Ownerless Project Auto-Claiming', () => {
    it('ensures a user with 0 projects does NOT automatically steal projects with userId: null', async () => {
      // Create a dummy unassigned project (userId: null)
      const unassignedDomain = `unassigned-${Date.now()}.com`;
      const unassignedProject = await (prisma.project.create as unknown as (args: { data: Record<string, unknown> }) => Promise<{ id: string }> )({
        data: {
          name: 'Legacy Unassigned Project',
          domain: unassignedDomain,
          userId: null,
          status: 'Active',
        },
      });

      // Query projects with our testUser (who currently has 0 assigned projects)
      const req = new NextRequest('http://localhost:3000/api/projects', {
        method: 'GET',
        headers: {
          cookie: `seranking_session=${testSessionCookie}`,
        },
      });
      const res = await projectsGet(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      // The test user should see 0 projects, NOT have stolen the unassigned project
      expect(data.projects.length).toBe(0);

      // Verify in DB that the project remains unassigned (not hijacked)
      const freshProject = await prisma.project.findUnique({
        where: { id: unassignedProject.id },
      });
      expect(freshProject?.userId).toBeNull();

      // Clean up
      await prisma.project.delete({ where: { id: unassignedProject.id } }).catch(() => {});
    });
  });
});
