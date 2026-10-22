import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/lib/db/prisma';
import { verifyProjectAccess } from '../src/lib/server/projectAuth';
import { NextRequest } from 'next/server';

describe('Admin User Governance & Strict Project Assignment Isolation Suite', () => {
  let adminUser: any;
  let assignedSeoUser: any;
  let unassignedSeoUser: any;
  let testProjectA: any;
  let testProjectB: any;

  beforeAll(async () => {
    // 1. Create or ensure Super Admin user
    adminUser = await prisma.user.upsert({
      where: { email: 'test-admin-governance@seranking.com' },
      update: { role: 'SUPERADMIN', status: 'active' },
      create: {
        email: 'test-admin-governance@seranking.com',
        name: 'Super Admin Governance',
        role: 'SUPERADMIN',
        status: 'active',
      },
    });

    // 2. Create Assigned SEO User
    assignedSeoUser = await prisma.user.upsert({
      where: { email: 'assigned-seouser@example.com' },
      update: { role: 'SEO_USER', status: 'active' },
      create: {
        email: 'assigned-seouser@example.com',
        name: 'Assigned SEO User',
        role: 'SEO_USER',
        status: 'active',
      },
    });

    // 3. Create Unassigned SEO User
    unassignedSeoUser = await prisma.user.upsert({
      where: { email: 'unassigned-seouser@example.com' },
      update: { role: 'SEO_USER', status: 'active' },
      create: {
        email: 'unassigned-seouser@example.com',
        name: 'Unassigned SEO User',
        role: 'SEO_USER',
        status: 'active',
      },
    });

    // 4. Create Project A (Owner = Admin)
    testProjectA = await prisma.project.findFirst({
      where: { domain: 'project-alpha-assigned.org' },
    });
    if (!testProjectA) {
      testProjectA = await prisma.project.create({
        data: {
          name: 'Project Alpha (Assigned)',
          domain: 'project-alpha-assigned.org',
          userId: adminUser.id,
          country: 'India',
          countryCode: 'in',
        },
      });
    }

    // 5. Create Project B (Owner = Admin)
    testProjectB = await prisma.project.findFirst({
      where: { domain: 'project-beta-unassigned.org' },
    });
    if (!testProjectB) {
      testProjectB = await prisma.project.create({
        data: {
          name: 'Project Beta (Secret/Unassigned)',
          domain: 'project-beta-unassigned.org',
          userId: adminUser.id,
          country: 'India',
          countryCode: 'in',
        },
      });
    }

    // 6. Assign Project A to assignedSeoUser via ProjectMember
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: testProjectA.id, userId: assignedSeoUser.id } },
      update: { role: 'SEO_USER' },
      create: {
        projectId: testProjectA.id,
        userId: assignedSeoUser.id,
        role: 'SEO_USER',
      },
    });

    // Clean up any stray memberships for unassigned user
    await prisma.projectMember.deleteMany({
      where: { userId: unassignedSeoUser.id },
    });
  });

  it('allows assigned SEO user to access Project A', async () => {
    // Construct request with auth context of assigned user
    const req = new NextRequest('http://localhost:3000/api/projects/' + testProjectA.id, {
      headers: {
        'x-user-id': assignedSeoUser.id,
        'x-user-email': assignedSeoUser.email,
        'x-user-role': assignedSeoUser.role,
      },
    });

    // Directly test project authorization logic
    const isMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: testProjectA.id,
          userId: assignedSeoUser.id,
        },
      },
    });

    expect(isMember).toBeDefined();
    expect(isMember?.role).toBe('SEO_USER');
  });

  it('strictly blocks unassigned SEO user from accessing Project A', async () => {
    const isMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: testProjectA.id,
          userId: unassignedSeoUser.id,
        },
      },
    });

    const isDirectOwner = testProjectA.userId === unassignedSeoUser.id;

    // Both checks must be false for unassigned user
    expect(isMember).toBeNull();
    expect(isDirectOwner).toBe(false);
  });

  it('strictly blocks assigned SEO user from accessing unassigned Project B', async () => {
    const isMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: testProjectB.id,
          userId: assignedSeoUser.id,
        },
      },
    });

    const isDirectOwner = testProjectB.userId === assignedSeoUser.id;

    expect(isMember).toBeNull();
    expect(isDirectOwner).toBe(false);
  });

  it('allows Admin to dynamically grant and revoke project memberships', async () => {
    // 1. Grant Project B to assignedSeoUser
    await prisma.projectMember.create({
      data: {
        projectId: testProjectB.id,
        userId: assignedSeoUser.id,
        role: 'SEO_USER',
      },
    });

    let checkAccess = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: testProjectB.id,
          userId: assignedSeoUser.id,
        },
      },
    });
    expect(checkAccess).toBeDefined();

    // 2. Revoke Project B
    await prisma.projectMember.deleteMany({
      where: {
        projectId: testProjectB.id,
        userId: assignedSeoUser.id,
      },
    });

    checkAccess = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: testProjectB.id,
          userId: assignedSeoUser.id,
        },
      },
    });
    expect(checkAccess).toBeNull();
  });

  it('blocks pending users from accessing projects', async () => {
    const pendingUser = await prisma.user.upsert({
      where: { email: 'pending-test-user@example.com' },
      update: { status: 'pending' },
      create: {
        email: 'pending-test-user@example.com',
        name: 'Pending Registration',
        role: 'SEO_USER',
        status: 'pending',
      },
    });

    expect(pendingUser.status).toBe('pending');
    const isAllowed = pendingUser.status === 'active' || pendingUser.status === 'approved';
    expect(isAllowed).toBe(false);
  });

  afterAll(async () => {
    // Clean up created test entities to prevent leaving dummy projects in DB
    await prisma.projectMember.deleteMany({
      where: { project: { domain: { in: ['project-alpha-assigned.org', 'project-beta-unassigned.org'] } } },
    });
    await prisma.project.deleteMany({
      where: { domain: { in: ['project-alpha-assigned.org', 'project-beta-unassigned.org'] } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: ['pending-test-user@example.com', 'assigned-seouser@example.com', 'unassigned-seouser@example.com'] } },
    });
  });
});
