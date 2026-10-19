import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { POST as loginPost } from '../app/api/auth/login/route';
import { POST as signupPost } from '../app/api/auth/signup/route';
import { POST as logoutPost } from '../app/api/auth/logout/route';
import { POST as googlePost } from '../app/api/auth/google/route';
import { GET as getProjects, POST as createProject } from '../app/api/projects/route';
import { prisma } from '../lib/db/prisma';
import { hashPassword, verifyPassword, createSession, SESSION_COOKIE_NAME } from '../lib/server/auth';
import { NextRequest } from 'next/server';

const TEST_EMAILS = [
  'nonexistent.user@example.com',
  'real.user@example.com',
  'real.user2@example.com',
  'google.tester@gmail.com',
  'fresh.workspace@example.com',
  'user1@example.com',
  'user2@example.com',
  'new.signup.user@example.com',
  'duplicate.user@example.com',
  'temp.test@example.com',
  'logout.test@example.com',
];

const cleanupTestRecords = async () => {
  try {
    const testUsers = await prisma.user.findMany({
      where: { email: { in: TEST_EMAILS } },
      select: { id: true },
    });
    const userIds = testUsers.map((u: { id: string }) => u.id);
    if (userIds.length > 0) {
      await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.keyword.deleteMany({ where: { project: { userId: { in: userIds } } } });
      await prisma.project.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
  } catch {
    // ignore
  }
};

describe('Real Authentication and Fresh Workspace Isolation', () => {
  beforeEach(async () => {
    await cleanupTestRecords();
  }, 30000);

  afterAll(async () => {
    await cleanupTestRecords();
  }, 30000);

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
    let user1Id: string | null = null;
    let user2Id: string | null = null;
    let project1Id: string | null = null;

    try {
      // User 1
      const user1 = await prisma.user.create({
        data: { email: `user1.${Date.now()}@example.com`, name: 'User 1', role: 'OWNER', status: 'active' },
      });
      user1Id = user1.id;
      const s1 = await createSession(user1.id);

      // User 2
      const user2 = await prisma.user.create({
        data: { email: `user2.${Date.now()}@example.com`, name: 'User 2', role: 'OWNER', status: 'active' },
      });
      user2Id = user2.id;
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
      project1Id = createdData.project.id;

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

      // User 2 direct IDOR attempt on User 1's project -> MUST return 403 Forbidden
      const idorReq = new NextRequest(`http://localhost:3000/api/projects/${project1Id}`, {
        method: 'GET',
        headers: {
          cookie: `seranking_session=${s2.sessionToken}`,
          authorization: `Bearer ${s2.sessionToken}`,
        },
      });
      const { GET: getProjectById } = await import('../app/api/projects/[id]/route');
      const idorRes = await getProjectById(idorReq, { params: Promise.resolve({ id: project1Id! }) });
      expect(idorRes.status).toBe(403);
      const idorData = await idorRes.json();
      expect(idorData.error?.code).toBe('FORBIDDEN');
    } finally {
      if (project1Id) {
        await prisma.searchEngineConfig.deleteMany({ where: { projectId: project1Id } }).catch(() => {});
        await prisma.keyword.deleteMany({ where: { projectId: project1Id } }).catch(() => {});
        await prisma.project.delete({ where: { id: project1Id } }).catch(() => {});
      }
      if (user1Id) {
        await prisma.activityLog.deleteMany({ where: { userId: user1Id } }).catch(() => {});
        await prisma.session.deleteMany({ where: { userId: user1Id } }).catch(() => {});
        await prisma.user.delete({ where: { id: user1Id } }).catch(() => {});
      }
      if (user2Id) {
        await prisma.activityLog.deleteMany({ where: { userId: user2Id } }).catch(() => {});
        await prisma.session.deleteMany({ where: { userId: user2Id } }).catch(() => {});
        await prisma.user.delete({ where: { id: user2Id } }).catch(() => {});
      }
    }
  }, 75000);

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
    expect(dbUser?.passwordHash).toMatch(/^\$argon2id\$/); // Argon2id format
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
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await signupPost(req);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toMatch(/already exists/i);
  });

  it('rejects disposable and temporary email domains during registration', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Temp',
        lastName: 'User',
        email: 'spammer@tempmail.com',
        password: 'StrongPassword123#',
        confirmPassword: 'StrongPassword123#',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await signupPost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/temporary|disposable/i);
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
