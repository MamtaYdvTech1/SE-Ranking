import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '../src/lib/db/prisma';
import { hashPassword, createSession, setSessionCookie, requireAdminAuth } from '../src/lib/server/auth';
import { verifyProjectAccess } from '../src/lib/server/projectAuth';

describe('Supabase & PostgreSQL Security Hardening Suite', () => {
  let adminUser: { id: string; email: string };
  let seoUser1: { id: string; email: string };
  let seoUser2: { id: string; email: string };
  let testProject: { id: string; name: string; domain: string };

  let adminSessionCookie: string;
  let seoUser1SessionCookie: string;
  let seoUser2SessionCookie: string;

  beforeAll(async () => {
    // 1. Create test admin
    adminUser = await prisma.user.create({
      data: {
        email: `sec.admin.${Date.now()}@example.com`,
        name: 'Sec Admin',
        role: 'ADMIN',
        status: 'active',
        passwordHash: hashPassword('AdminSecurePass123#'),
      },
    });
    const sAdmin = await createSession(adminUser.id);
    const rAdmin = new (await import('next/server')).NextResponse();
    await setSessionCookie(rAdmin, sAdmin.sessionToken, sAdmin.expiresAt);
    adminSessionCookie = rAdmin.cookies.get('seranking_session')?.value || '';

    // 2. Create SEO User 1 (Assigned to project)
    seoUser1 = await prisma.user.create({
      data: {
        email: `sec.user1.${Date.now()}@example.com`,
        name: 'SEO User 1',
        role: 'SEO_USER',
        status: 'active',
        canCreateProject: false,
        passwordHash: hashPassword('User1SecurePass123#'),
      },
    });
    const s1 = await createSession(seoUser1.id);
    const r1 = new (await import('next/server')).NextResponse();
    await setSessionCookie(r1, s1.sessionToken, s1.expiresAt);
    seoUser1SessionCookie = r1.cookies.get('seranking_session')?.value || '';

    // 3. Create SEO User 2 (Unassigned to project)
    seoUser2 = await prisma.user.create({
      data: {
        email: `sec.user2.${Date.now()}@example.com`,
        name: 'SEO User 2',
        role: 'SEO_USER',
        status: 'active',
        canCreateProject: false,
        passwordHash: hashPassword('User2SecurePass123#'),
      },
    });
    const s2 = await createSession(seoUser2.id);
    const r2 = new (await import('next/server')).NextResponse();
    await setSessionCookie(r2, s2.sessionToken, s2.expiresAt);
    seoUser2SessionCookie = r2.cookies.get('seranking_session')?.value || '';

    // 4. Create Project owned by User 1
    testProject = await prisma.project.create({
      data: {
        name: 'Security Test Domain',
        domain: `sec-test-${Date.now()}.org`,
        userId: seoUser1.id,
        status: 'Active',
      },
    });

    // Add User 1 as project member
    await (prisma as any).projectMember.create({
      data: {
        projectId: testProject.id,
        userId: seoUser1.id,
        role: 'OWNER',
        canEdit: true,
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    if (testProject) {
      await (prisma as any).projectMember.deleteMany({ where: { projectId: testProject.id } }).catch(() => {});
      await prisma.project.delete({ where: { id: testProject.id } }).catch(() => {});
    }
    const ids = [adminUser?.id, seoUser1?.id, seoUser2?.id].filter(Boolean);
    if (ids.length > 0) {
      await prisma.session.deleteMany({ where: { userId: { in: ids } } }).catch(() => {});
      await prisma.user.deleteMany({ where: { id: { in: ids } } }).catch(() => {});
    }
  });

  describe('1. RLS & Sensitive Columns Protection (Database Layer)', () => {
    it('verifies 100% of tables in public schema have Row Level Security enabled', async () => {
      const res = await prisma.$queryRaw<Array<{ disabled_count: bigint }>>`
        SELECT count(*) as disabled_count 
        FROM pg_tables 
        WHERE schemaname = 'public' AND rowsecurity = false;
      `;
      expect(Number(res[0].disabled_count)).toBe(0);
    });

    it('verifies 100% of tables in seranking schema have Row Level Security enabled', async () => {
      const res = await prisma.$queryRaw<Array<{ disabled_count: bigint }>>`
        SELECT count(*) as disabled_count 
        FROM pg_tables 
        WHERE schemaname = 'seranking' AND rowsecurity = false;
      `;
      expect(Number(res[0].disabled_count)).toBe(0);
    });

    it('verifies passwordHash is never returned or leaked in sanitized user profiles', async () => {
      const user = await prisma.user.findUnique({
        where: { id: seoUser1.id },
      });
      expect(user).toBeDefined();

      const { sanitizeUser } = await import('../src/lib/server/auth');
      const safe = sanitizeUser(user!);
      expect((safe as any).passwordHash).toBeUndefined();
    });
  });

  describe('2. Multi-Tenant Project Authorization & IDOR Defense', () => {
    it('allows project owner (User 1) to access the project', async () => {
      const req = new NextRequest(`http://localhost:3000/api/projects/${testProject.id}`, {
        headers: { cookie: `seranking_session=${seoUser1SessionCookie}` },
      });
      const access = await verifyProjectAccess(req, testProject.id);
      expect(access.success).toBe(true);
      if (access.success) {
        expect(access.data.project.id).toBe(testProject.id);
      }
    });

    it('strictly denies unassigned SEO User (User 2) from accessing User 1 project (HTTP 403)', async () => {
      const req = new NextRequest(`http://localhost:3000/api/projects/${testProject.id}`, {
        headers: { cookie: `seranking_session=${seoUser2SessionCookie}` },
      });
      const access = await verifyProjectAccess(req, testProject.id);
      expect(access.success).toBe(false);
      if (!access.success) {
        expect(access.error.status).toBe(403);
      }
    });

    it('allows Admin user to access any project platform-wide', async () => {
      const req = new NextRequest(`http://localhost:3000/api/projects/${testProject.id}`, {
        headers: { cookie: `seranking_session=${adminSessionCookie}` },
      });
      const access = await verifyProjectAccess(req, testProject.id);
      expect(access.success).toBe(true);
      if (access.success) {
        expect(access.data.project.id).toBe(testProject.id);
      }
    });
  });

  describe('3. Admin Operations & Privilege Escalation Prevention', () => {
    it('allows legitimate Admin to pass requireAdminAuth', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { cookie: `seranking_session=${adminSessionCookie}` },
      });
      const check = await requireAdminAuth(req);
      expect(check.error).toBeNull();
      expect(check.status).toBe(200);
      expect(check.auth?.user.role).toBe('ADMIN');
    });

    it('rejects SEO User from accessing admin endpoints with HTTP 403 Forbidden', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/users', {
        headers: { cookie: `seranking_session=${seoUser1SessionCookie}` },
      });
      const check = await requireAdminAuth(req);
      expect(check.error).toBeDefined();
      expect(check.status).toBe(403);
      expect(check.auth).toBeNull();
    });

    it('rejects unauthenticated requests to admin endpoints with HTTP 401 Unauthorized', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/users');
      const check = await requireAdminAuth(req);
      expect(check.error).toBeDefined();
      expect(check.status).toBe(401);
      expect(check.auth).toBeNull();
    });
  });

  describe('4. Deactivated & Suspended Account Enforcement', () => {
    it('blocks suspended accounts from accessing protected resources', async () => {
      // Temporarily suspend User 1 using standard auth invalidation
      await prisma.user.update({
        where: { id: seoUser1.id },
        data: { status: 'suspended' },
      });
      const { invalidateAllSessionsForUser } = await import('../src/lib/server/auth');
      await invalidateAllSessionsForUser(seoUser1.id);

      const req = new NextRequest(`http://localhost:3000/api/projects/${testProject.id}`, {
        headers: { cookie: `seranking_session=${seoUser1SessionCookie}` },
      });
      const access = await verifyProjectAccess(req, testProject.id);
      expect(access.success).toBe(false);
      if (!access.success) {
        expect([401, 403]).toContain(access.error.status);
      }

      // Restore user 1 status and re-issue session
      await prisma.user.update({
        where: { id: seoUser1.id },
        data: { status: 'active' },
      });
      const s1Restored = await createSession(seoUser1.id);
      const r1Restored = new (await import('next/server')).NextResponse();
      await setSessionCookie(r1Restored, s1Restored.sessionToken, s1Restored.expiresAt);
      seoUser1SessionCookie = r1Restored.cookies.get('seranking_session')?.value || '';
    });
  });
});
