import { describe, it, expect, beforeEach } from 'vitest';
import { POST as loginPost } from '@/app/api/auth/login/route';
import { POST as signupPost } from '@/app/api/auth/signup/route';
import { POST as logoutPost } from '@/app/api/auth/logout/route';
import { POST as googlePost } from '@/app/api/auth/google/route';
import { GET as getProjects, POST as createProject } from '@/app/api/projects/route';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, verifyPassword, createSession, SESSION_COOKIE_NAME } from '@/lib/server/auth';
import { NextRequest } from 'next/server';

describe('Real Authentication and Fresh Workspace Isolation', () => {
  beforeEach(async () => {
    // Clean test tables
    await prisma.session.deleteMany();
    await prisma.keyword.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: { not: 'admin@seranking.com' },
      },
    });
  });

  it('rejects invalid email and password with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent.user@example.com',
        password: 'WrongPassword123#',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await loginPost(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toMatch(/Invalid email or password/i);
  });

  it('authenticates real registered user with correct password', async () => {
    const email = 'real.user@example.com';
    const password = 'RealPassword123#';
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Real User',
        passwordHash: hashPassword(password),
        role: 'OWNER',
        status: 'active',
      },
    });

    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await loginPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe(email);
    expect(data.token).toBeDefined();
  });

  it('rejects real registered user with wrong password', async () => {
    const email = 'real.user2@example.com';
    const password = 'RealPassword123#';
    await prisma.user.create({
      data: {
        email,
        name: 'Real User 2',
        passwordHash: hashPassword(password),
        role: 'OWNER',
        status: 'active',
      },
    });

    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password: 'IncorrectPassword999#',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await loginPost(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toMatch(/Invalid email or password/i);
  });

  it('signs in with Google account and creates real user session in DB', async () => {
    const googleEmail = 'google.tester@gmail.com';
    const googleName = 'Google Tester';
    const req = new NextRequest('http://localhost:3000/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        email: googleEmail,
        name: googleName,
        googleId: 'gid_123456789',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await googlePost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe(googleEmail);
    expect(data.token).toBeDefined();

    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({ where: { email: googleEmail } });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.googleSubjectId).toBe('gid_123456789');

    // Verify session was persisted in DB
    const dbSession = await prisma.session.findUnique({ where: { sessionToken: data.token } });
    expect(dbSession).not.toBeNull();
  });

  it('fresh account starts with 0 projects and empty workspace', async () => {
    // Create new fresh user
    const user = await prisma.user.create({
      data: {
        email: 'fresh.workspace@example.com',
        name: 'Fresh Account',
        role: 'OWNER',
        status: 'active',
      },
    });

    const { sessionToken } = await createSession(user.id);

    const req = new NextRequest('http://localhost:3000/api/projects', {
      method: 'GET',
      headers: {
        cookie: `seranking_session=${sessionToken}`,
        authorization: `Bearer ${sessionToken}`,
      },
    });

    const res = await getProjects(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.projects).toEqual([]);
    expect(data.projects.length).toBe(0);
  });

  it('isolates projects between different user accounts', async () => {
    // User 1
    const user1 = await prisma.user.create({
      data: { email: 'user1@example.com', name: 'User 1', role: 'OWNER', status: 'active' },
    });
    const s1 = await createSession(user1.id);

    // User 2
    const user2 = await prisma.user.create({
      data: { email: 'user2@example.com', name: 'User 2', role: 'OWNER', status: 'active' },
    });
    const s2 = await createSession(user2.id);

    // Create a project under User 1
    const createReq = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        websiteUrl: 'https://workcomposer.com',
        name: 'WorkComposer',
        searchEngines: [{ engine: 'google', country: 'India', countryCode: 'in', language: 'English' }],
        keywords: ['time tracking', 'employee monitoring'],
      }),
      headers: {
        'Content-Type': 'application/json',
        cookie: `seranking_session=${s1.sessionToken}`,
        authorization: `Bearer ${s1.sessionToken}`,
      },
    });

    const createRes = await createProject(createReq);
    expect(createRes.status).toBe(200);
    const createdData = await createRes.json();
    expect(createdData.project.domain).toBe('workcomposer.com');

    // User 1 GET -> sees 1 project
    const u1Req = new NextRequest('http://localhost:3000/api/projects', {
      method: 'GET',
      headers: {
        cookie: `seranking_session=${s1.sessionToken}`,
        authorization: `Bearer ${s1.sessionToken}`,
      },
    });
    const u1Res = await getProjects(u1Req);
    const u1Data = await u1Res.json();
    expect(u1Data.projects.length).toBe(1);
    expect(u1Data.projects[0].domain).toBe('workcomposer.com');

    // User 2 GET -> sees 0 projects (completely fresh and isolated!)
    const u2Req = new NextRequest('http://localhost:3000/api/projects', {
      method: 'GET',
      headers: {
        cookie: `seranking_session=${s2.sessionToken}`,
        authorization: `Bearer ${s2.sessionToken}`,
      },
    });
    const u2Res = await getProjects(u2Req);
    const u2Data = await u2Res.json();
    expect(u2Data.projects.length).toBe(0);

    const project1Id = createdData.project.id;

    // User 2 direct IDOR attempt on User 1's project -> MUST return 403 Forbidden
    const idorReq = new NextRequest(`http://localhost:3000/api/projects/${project1Id}`, {
      method: 'GET',
      headers: {
        cookie: `seranking_session=${s2.sessionToken}`,
        authorization: `Bearer ${s2.sessionToken}`,
      },
    });
    const { GET: getProjectById } = await import('@/app/api/projects/[id]/route');
    const idorRes = await getProjectById(idorReq, { params: Promise.resolve({ id: project1Id }) });
    expect(idorRes.status).toBe(403);
    const idorData = await idorRes.json();
    expect(idorData.error?.code).toBe('FORBIDDEN');

    // User 2 direct attempt on User 1's project overview -> MUST return 403 Forbidden
    const { GET: getProjectOverview } = await import('@/app/api/projects/[id]/overview/route');
    const overviewReq = new NextRequest(`http://localhost:3000/api/projects/${project1Id}/overview`, {
      method: 'GET',
      headers: {
        cookie: `seranking_session=${s2.sessionToken}`,
        authorization: `Bearer ${s2.sessionToken}`,
      },
    });
    const overviewRes = await getProjectOverview(overviewReq, { params: Promise.resolve({ id: project1Id }) });
    expect(overviewRes.status).toBe(403);

    // User 2 direct attempt on User 1's rankings -> MUST return 403 Forbidden
    const { GET: getProjectRankings } = await import('@/app/api/projects/[id]/rankings/route');
    const rankingsReq = new NextRequest(`http://localhost:3000/api/projects/${project1Id}/rankings`, {
      method: 'GET',
      headers: {
        cookie: `seranking_session=${s2.sessionToken}`,
        authorization: `Bearer ${s2.sessionToken}`,
      },
    });
    const rankingsRes = await getProjectRankings(rankingsReq, { params: Promise.resolve({ id: project1Id }) });
    expect(rankingsRes.status).toBe(403);

    // User 2 direct attempt on User 1's competitor keywords -> MUST return 403 Forbidden
    const { GET: getCompetitorKeywords } = await import('@/app/api/projects/[id]/competitors/keywords/route');
    const compKwReq = new NextRequest(`http://localhost:3000/api/projects/${project1Id}/competitors/keywords`, {
      method: 'GET',
      headers: {
        cookie: `seranking_session=${s2.sessionToken}`,
        authorization: `Bearer ${s2.sessionToken}`,
      },
    });
    const compKwRes = await getCompetitorKeywords(compKwReq, { params: Promise.resolve({ id: project1Id }) });
    expect(compKwRes.status).toBe(403);

    // Global dashboard isolation check
    const { GET: getGlobalDashboard } = await import('@/app/api/dashboard/global/route');
    const u2DashReq = new NextRequest('http://localhost:3000/api/dashboard/global', {
      headers: {
        cookie: `seranking_session=${s2.sessionToken}`,
        authorization: `Bearer ${s2.sessionToken}`,
      },
    });
    const u2DashRes = await getGlobalDashboard(u2DashReq);
    expect(u2DashRes.status).toBe(200);
    const u2DashData = await u2DashRes.json();
    expect(u2DashData.data.totalProjects).toBe(0);
    expect(u2DashData.data.projects.length).toBe(0);

    const u1DashReq = new NextRequest('http://localhost:3000/api/dashboard/global', {
      headers: {
        cookie: `seranking_session=${s1.sessionToken}`,
        authorization: `Bearer ${s1.sessionToken}`,
      },
    });
    const u1DashRes = await getGlobalDashboard(u1DashReq);
    expect(u1DashRes.status).toBe(200);
    const u1DashData = await u1DashRes.json();
    expect(u1DashData.data.totalProjects).toBe(1);
    expect(u1DashData.data.projects[0].primaryDomain).toBe('workcomposer.com');
  }, 45000);

  it('verifies DataForSEO provider credentials and prevents fabricated numbers', async () => {
    const { dataForSeoClient } = await import('@/services/seo/dataforseo.client');
    // Without valid DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD env vars, isConfigured must be false
    const isConfigured = dataForSeoClient.isConfigured();
    if (!process.env.DATAFORSEO_LOGIN || process.env.DATAFORSEO_LOGIN.includes('your_')) {
      expect(isConfigured).toBe(false);
    }

    // Keyword suggestions endpoint handles unconfigured provider without claiming mock is real
    const { GET: getSuggestions } = await import('@/app/api/keywords/suggestions/route');
    const suggReq = new NextRequest('http://localhost:3000/api/keywords/suggestions?query=seo');
    const suggRes = await getSuggestions(suggReq);
    expect(suggRes.status).toBe(200);
    const suggData = await suggRes.json();
    expect(suggData.success).toBe(true);
    expect(Array.isArray(suggData.suggestions)).toBe(true);
    if (!isConfigured) {
      expect(suggData.providerConfigured).toBe(false);
    }
  });

  it('rejects invalid email formats during login', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email-format-without-at',
        password: 'ValidPassword123#',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await loginPost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/valid/i);
  });

  it('registers a new user with password hashing and prevents plain-text storage', async () => {
    const email = 'new.signup.user@example.com';
    const password = 'StrongPassword123#';

    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        email,
        password,
        confirmPassword: password,
        captchaToken: 'recaptcha_test_pass',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await signupPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe(email);

    // Verify user in DB has passwordHash and NEVER plain text
    const dbUser = await prisma.user.findUnique({ where: { email } });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.passwordHash).not.toBe(password);
    expect(dbUser?.passwordHash).toContain(':'); // scrypt salt:hash format
    expect(verifyPassword(password, dbUser!.passwordHash!)).toBe(true);
  });

  it('rejects duplicate email registration with 409 Conflict', async () => {
    const email = 'duplicate.user@example.com';
    const password = 'StrongPassword123#';

    await prisma.user.create({
      data: {
        email,
        name: 'Existing User',
        passwordHash: hashPassword(password),
        role: 'OWNER',
        status: 'active',
      },
    });

    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Duplicate',
        lastName: 'User',
        email,
        password,
        confirmPassword: password,
        captchaToken: 'recaptcha_test_pass',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await signupPost(req);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toMatch(/already exists/i);
  });

  it('rejects invalid or failed CAPTCHA token on login', async () => {
    const email = 'captcha.test@example.com';
    const password = 'RealPassword123#';

    await prisma.user.create({
      data: {
        email,
        name: 'Captcha Test User',
        passwordHash: hashPassword(password),
        role: 'OWNER',
        status: 'active',
      },
    });

    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        captchaToken: 'invalid_expired_captcha_token',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await loginPost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/reCAPTCHA/i);
  });

  it('handles logout and invalidates session token from DB', async () => {
    const email = 'logout.test@example.com';
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Logout User',
        passwordHash: hashPassword('Password123#'),
        role: 'OWNER',
        status: 'active',
      },
    });

    const { sessionToken } = await createSession(user.id);
    expect(await prisma.session.findUnique({ where: { sessionToken } })).not.toBeNull();

    const logoutReq = new NextRequest('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
      },
    });

    const logoutRes = await logoutPost(logoutReq);
    expect(logoutRes.status).toBe(200);

    // Verify session was destroyed in DB
    const deletedSession = await prisma.session.findUnique({ where: { sessionToken } });
    expect(deletedSession).toBeNull();
  });

  it('rejects unauthenticated request to protected project API with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects', {
      method: 'GET',
    });

    const res = await getProjects(req);
    expect(res.status).toBe(401);
  });
});
