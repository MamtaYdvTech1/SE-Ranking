import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '../lib/db/prisma';
import {
  hashPassword,
  createSession,
  setSessionCookie,
  requireAdminAuth,
  invalidateAllSessionsForUser,
} from '../lib/server/auth';
import {
  hasRolePermission,
  normalizeRole,
  requirePermission,
  ROLE_PERMISSIONS,
} from '../lib/server/rbac';
import { verifyProjectAccess } from '../lib/server/projectAuth';
import { POST as createUserPost, GET as listUsersGet } from '../app/api/admin/users/route';
import { DELETE as deleteUserDelete } from '../app/api/admin/users/[id]/route';
import { POST as loginPost } from '../app/api/auth/login/route';
import { POST as providerPost } from '../app/api/admin/providers/route';
import { POST as jobPost } from '../app/api/admin/jobs/route';

describe('Enterprise RBAC, User Lifecycle & Security Test Suite', () => {
  let superAdminUser: { id: string; email: string };
  let adminSessionCookie: string;

  let testProjectId: string;
  let testProjectDomain: string;

  beforeAll(async () => {
    // 1. Create a Super Admin account
    superAdminUser = await prisma.user.create({
      data: {
        email: `ent.superadmin.${Date.now()}@example.com`,
        name: 'Enterprise Super Admin',
        role: 'SUPERADMIN',
        status: 'active',
        passwordHash: hashPassword('SuperAdminPass123!'),
      },
    });

    const session = await createSession(superAdminUser.id);
    const res = new (await import('next/server')).NextResponse();
    await setSessionCookie(res, session.sessionToken, session.expiresAt);
    adminSessionCookie = res.cookies.get('seranking_session')?.value || '';

    // 2. Create a reference project
    testProjectDomain = `enterprise-domain-${Date.now()}.com`;
    const project = await prisma.project.create({
      data: {
        name: 'Enterprise Test Project',
        domain: testProjectDomain,
        userId: superAdminUser.id,
        status: 'Active',
      },
    });
    testProjectId = project.id;
  });

  afterAll(async () => {
    // Cleanup reference project and test admin
    if (testProjectId) {
      await (prisma as any).projectMember.deleteMany({ where: { projectId: testProjectId } }).catch(() => {});
      await prisma.project.delete({ where: { id: testProjectId } }).catch(() => {});
    }
    if (superAdminUser?.id) {
      await prisma.session.deleteMany({ where: { userId: superAdminUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: superAdminUser.id } }).catch(() => {});
    }
  });

  describe('1. RBAC Unit Tests & Permission Logic', () => {
    it('normalizes legacy and enterprise roles correctly', () => {
      expect(normalizeRole('SUPERADMIN')).toBe('SUPER_ADMIN');
      expect(normalizeRole('OWNER')).toBe('SUPER_ADMIN');
      expect(normalizeRole('ADMIN')).toBe('ADMIN');
      expect(normalizeRole('SEO_MANAGER')).toBe('SEO_MANAGER');
      expect(normalizeRole('CLIENT')).toBe('CLIENT');
      expect(normalizeRole('UNKNOWN')).toBe('SEO_USER');
    });

    it('grants full permissions to SUPER_ADMIN and ADMIN', () => {
      for (const perm of ROLE_PERMISSIONS.SUPER_ADMIN) {
        expect(hasRolePermission('SUPER_ADMIN', perm)).toBe(true);
        expect(hasRolePermission('ADMIN', perm)).toBe(true);
      }
    });

    it('denies user management and system settings to SEO_MANAGER', () => {
      expect(hasRolePermission('SEO_MANAGER', 'users.create')).toBe(false);
      expect(hasRolePermission('SEO_MANAGER', 'users.delete')).toBe(false);
      expect(hasRolePermission('SEO_MANAGER', 'settings.manage')).toBe(false);
      expect(hasRolePermission('SEO_MANAGER', 'integrations.manage')).toBe(false);

      // But allows project creation and audit execution
      expect(hasRolePermission('SEO_MANAGER', 'projects.create')).toBe(true);
      expect(hasRolePermission('SEO_MANAGER', 'audit.run')).toBe(true);
    });

    it('strictly restricts CLIENT role to read-only project and export operations', () => {
      expect(hasRolePermission('CLIENT', 'projects.read')).toBe(true);
      expect(hasRolePermission('CLIENT', 'reports.export')).toBe(true);

      expect(hasRolePermission('CLIENT', 'projects.create')).toBe(false);
      expect(hasRolePermission('CLIENT', 'projects.update')).toBe(false);
      expect(hasRolePermission('CLIENT', 'projects.delete')).toBe(false);
      expect(hasRolePermission('CLIENT', 'audit.run')).toBe(false);
      expect(hasRolePermission('CLIENT', 'users.create')).toBe(false);
    });

    it('respects canCreateProject flag for SEO_USER', () => {
      expect(hasRolePermission('SEO_USER', 'projects.create', { canCreateProject: false })).toBe(false);
      expect(hasRolePermission('SEO_USER', 'projects.create', { canCreateProject: true })).toBe(true);
    });
  });

  describe('2. Server Permission Middleware (requirePermission)', () => {
    it('rejects unauthenticated requests with HTTP 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/users');
      const res = await requirePermission(req, 'users.create');
      expect(res.status).toBe(401);
      expect(res.auth).toBeNull();
    });

    it('allows Admin user to access users.create with HTTP 200', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { cookie: `seranking_session=${adminSessionCookie}` },
      });
      const res = await requirePermission(req, 'users.create');
      expect(res.status).toBe(200);
      expect(res.auth?.user.role).toBe('SUPERADMIN');
    });
  });

  describe('3. E2E Flow: Real User Lifecycle & Project Isolation', () => {
    let createdSeoUserId: string;
    let createdSeoUserEmail: string;
    let createdUserSessionCookie: string;

    const userRawPassword = 'EnterprisePassword99#';

    it('Flow Step 1: Admin creates user with direct credentials and assigns project', async () => {
      createdSeoUserEmail = `seo.specialist.${Date.now()}@example.com`;

      const req = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `seranking_session=${adminSessionCookie}`,
        },
        body: JSON.stringify({
          email: createdSeoUserEmail,
          name: 'SEO Specialist',
          password: userRawPassword,
          role: 'SEO_USER',
          status: 'active',
          projectIds: [testProjectId],
          canCreateProject: false,
          planTier: 'STARTER',
        }),
      });

      const res = await createUserPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.email).toBe(createdSeoUserEmail);
      expect(json.data.userId).toBeDefined();

      createdSeoUserId = json.data.userId;

      // Verify user was stored in PostgreSQL with hashed password
      const dbUser = await prisma.user.findUnique({ where: { id: createdSeoUserId } });
      expect(dbUser).toBeDefined();
      expect(dbUser?.passwordHash).not.toBe(userRawPassword);
      expect(dbUser?.passwordHash?.length).toBeGreaterThan(20);

      // Verify ProjectMember record was established
      const membership = await (prisma as any).projectMember.findFirst({
        where: { projectId: testProjectId, userId: createdSeoUserId },
      });
      expect(membership).toBeDefined();
    });

    it('Flow Step 2: Newly created user signs in and accesses assigned project', async () => {
      const loginReq = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createdSeoUserEmail,
          password: userRawPassword,
        }),
      });

      const loginRes = await loginPost(loginReq);
      expect(loginRes.status).toBe(200);

      createdUserSessionCookie = loginRes.cookies.get('seranking_session')?.value || '';
      expect(createdUserSessionCookie.length).toBeGreaterThan(10);

      // Access assigned project
      const projectReq = new NextRequest(`http://localhost:3000/api/projects/${testProjectId}`, {
        headers: { cookie: `seranking_session=${createdUserSessionCookie}` },
      });
      const access = await verifyProjectAccess(projectReq, testProjectId);
      expect(access.success).toBe(true);
      if (access.success) {
        expect(access.data.project.id).toBe(testProjectId);
      }
    });

    it('Flow Step 3: SEO User attempting another user project is strictly denied (HTTP 403 IDOR)', async () => {
      // Create a private unassigned project
      const otherProject = await prisma.project.create({
        data: {
          name: 'Private Client Project',
          domain: `private-${Date.now()}.org`,
          userId: superAdminUser.id,
          status: 'Active',
        },
      });

      try {
        const attemptReq = new NextRequest(`http://localhost:3000/api/projects/${otherProject.id}`, {
          headers: { cookie: `seranking_session=${createdUserSessionCookie}` },
        });

        const access = await verifyProjectAccess(attemptReq, otherProject.id);
        expect(access.success).toBe(false);
        if (!access.success) {
          expect(access.error.status).toBe(403);
        }
      } finally {
        await prisma.project.delete({ where: { id: otherProject.id } }).catch(() => {});
      }
    });

    it('Flow Step 4: Admin soft-deletes user and immediate session revocation occurs', async () => {
      const delReq = new NextRequest(`http://localhost:3000/api/admin/users/${createdSeoUserId}?force=true`, {
        method: 'DELETE',
        headers: { cookie: `seranking_session=${adminSessionCookie}` },
      });

      const delRes = await deleteUserDelete(delReq, { params: Promise.resolve({ id: createdSeoUserId }) });
      const delJson = await delRes.json();

      expect(delRes.status).toBe(200);
      expect(delJson.success).toBe(true);

      // Verify user in PostgreSQL is deactivated with deletedAt timestamp
      const dbUser = await prisma.user.findUnique({ where: { id: createdSeoUserId } });
      expect(dbUser?.status).toBe('deactivated');
      expect(dbUser?.deletedAt).not.toBeNull();

      // Verify sessions were revoked from PostgreSQL
      const activeSessions = await prisma.session.count({ where: { userId: createdSeoUserId } });
      expect(activeSessions).toBe(0);

      // Subsequent access with old session cookie must be blocked (HTTP 401)
      const afterReq = new NextRequest(`http://localhost:3000/api/projects/${testProjectId}`, {
        headers: { cookie: `seranking_session=${createdUserSessionCookie}` },
      });
      const access = await verifyProjectAccess(afterReq, testProjectId);
      expect(access.success).toBe(false);
      if (!access.success) {
        expect([401, 403]).toContain(access.error.status);
      }

      // Cleanup
      await prisma.user.delete({ where: { id: createdSeoUserId } }).catch(() => {});
    });
  });

  describe('4. Infrastructure & Integration Tests', () => {
    it('verifies live PostgreSQL database latency check via provider API', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `seranking_session=${adminSessionCookie}`,
        },
        body: JSON.stringify({ action: 'TEST_CONNECTION', providerId: 'database' }),
      });

      const res = await providerPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.status).toBe('CONNECTED');
      expect(typeof json.latencyMs).toBe('number');
      expect(json.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('handles background job lifecycle: triggers and cancels job without errors', async () => {
      // 1. Trigger job
      const triggerReq = new NextRequest('http://localhost:3000/api/admin/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `seranking_session=${adminSessionCookie}`,
        },
        body: JSON.stringify({ action: 'TRIGGER', type: 'SITE_AUDIT', projectId: testProjectId }),
      });

      const triggerRes = await jobPost(triggerReq);
      const triggerJson = await triggerRes.json();

      expect(triggerRes.status).toBe(200);
      expect(triggerJson.success).toBe(true);
      const jobId = triggerJson.data.id;
      expect(jobId).toBeDefined();

      // 2. Cancel job
      const cancelReq = new NextRequest('http://localhost:3000/api/admin/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: `seranking_session=${adminSessionCookie}`,
        },
        body: JSON.stringify({ action: 'CANCEL', jobId }),
      });

      const cancelRes = await jobPost(cancelReq);
      const cancelJson = await cancelRes.json();

      expect(cancelRes.status).toBe(200);
      expect(cancelJson.success).toBe(true);

      // Verify in DB
      const dbJob = await prisma.job.findUnique({ where: { id: jobId } });
      expect(dbJob?.status).toBe('cancelled');

      // Cleanup job
      await prisma.jobLog.deleteMany({ where: { jobId } }).catch(() => {});
      await prisma.job.delete({ where: { id: jobId } }).catch(() => {});
    });
  });
});
