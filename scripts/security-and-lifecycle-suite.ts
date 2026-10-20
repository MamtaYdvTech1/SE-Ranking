(process.env as any).NODE_ENV = 'test';

import { prisma } from '../src/lib/db/prisma';
import { hashPassword, createSession, SESSION_COOKIE_NAME } from '../src/lib/server/auth';
import { NextRequest } from 'next/server';

// Imports of the actual route handlers
import { POST as signupHandler } from '../src/app/api/auth/signup/route';
import { POST as loginHandler } from '../src/app/api/auth/login/route';
import { PATCH as adminUserPatch } from '../src/app/api/admin/users/[id]/route';
import { GET as rankingsGet } from '../src/app/api/projects/[id]/rankings/route';
import { GET as projectByIdGet } from '../src/app/api/projects/[id]/route';

async function runSecurityAndLifecycleSuite() {
  console.log('========================================================');
  console.log('🛡️ RUNNING COMPREHENSIVE SECURITY & LIFECYCLE QA SUITE');
  console.log('========================================================\n');

  const testEmail = `qa.audit.${Date.now()}@example.com`;
  const victimEmail = `victim.${Date.now()}@example.com`;
  const attackerEmail = `attacker.${Date.now()}@example.com`;
  const adminEmail = `superadmin.qa.${Date.now()}@example.com`;

  const cleanupIds: string[] = [];

  try {
    // 0. Bootstrap an isolated Admin User
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'QA Super Admin',
        role: 'SUPERADMIN',
        status: 'approved',
        passwordHash: hashPassword('SecureAdminPass999!'),
      },
    });
    cleanupIds.push(adminUser.id);
    const adminSession = await createSession(adminUser.id);

    console.log('1. REGISTRATION & PENDING APPROVAL WORKFLOW:');
    // Test 1: Registration
    const signupReq = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestUserPassword123!',
        name: 'QA Lifecycle Test User',
      }),
    });
    const signupRes = await signupHandler(signupReq);
    const signupData = await signupRes.json();
    console.log(`   Signup Response Status: ${signupRes.status} (Expected: 200)`);
    console.log(`   User Status: ${signupData.user?.status} (Expected: pending)`);
    if (signupRes.status !== 200 || signupData.user?.status !== 'pending') {
      throw new Error(`Signup failed: ${JSON.stringify(signupData)}`);
    }
    cleanupIds.push(signupData.user.id);

    // Test 2: Unapproved Login Rejection
    const unapprovedLoginReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestUserPassword123!',
      }),
    });
    const unapprovedLoginRes = await loginHandler(unapprovedLoginReq);
    const unapprovedData = await unapprovedLoginRes.json();
    console.log(`   Unapproved Login Status: ${unapprovedLoginRes.status} (Expected: 403)`);
    console.log(`   Unapproved Login Message: "${unapprovedData.error?.message}"`);
    if (unapprovedLoginRes.status !== 403) {
      throw new Error('Pending user was allowed to log in!');
    }
    console.log('   ✅ PASS: Pending user cannot log in.\n');

    console.log('2. ADMIN APPROVAL WORKFLOW:');
    // Test 3: Admin Approves User
    const approveReq = new NextRequest(`http://localhost:3000/api/admin/users/${signupData.user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${SESSION_COOKIE_NAME}=${adminSession.sessionToken}`,
      },
      body: JSON.stringify({
        status: 'approved',
      }),
    });
    const approveRes = await adminUserPatch(approveReq, { params: Promise.resolve({ id: signupData.user.id }) });
    const approveData = await approveRes.json();
    console.log(`   Admin Approve Status: ${approveRes.status} (Expected: 200)`);
    console.log(`   User New Status: ${approveData.data?.status} (Expected: active)`);
    if (approveRes.status !== 200 || approveData.data?.status !== 'active') {
      throw new Error(`Admin failed to approve user: ${JSON.stringify(approveData)}`);
    }
    console.log('   ✅ PASS: Admin successfully approves user.\n');

    console.log('3. POST-APPROVAL LOGIN & SESSION:');
    // Test 4: Login after approval
    const approvedLoginReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestUserPassword123!',
      }),
    });
    const approvedLoginRes = await loginHandler(approvedLoginReq);
    const approvedLoginData = await approvedLoginRes.json();
    console.log(`   Approved Login Status: ${approvedLoginRes.status} (Expected: 200)`);
    if (approvedLoginRes.status !== 200 || !approvedLoginData.user) {
      throw new Error('Approved user failed to log in');
    }
    const userSession = await createSession(signupData.user.id);
    console.log('   ✅ PASS: Approved user establishes session.\n');

    console.log('4. ROLE ESCALATION DEFENSE:');
    // Test 5: Regular user attempts to call Admin API to escalate themselves to SUPERADMIN
    const escalateReq = new NextRequest(`http://localhost:3000/api/admin/users/${signupData.user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${SESSION_COOKIE_NAME}=${userSession.sessionToken}`,
      },
      body: JSON.stringify({
        role: 'SUPERADMIN',
      }),
    });
    const escalateRes = await adminUserPatch(escalateReq, { params: Promise.resolve({ id: signupData.user.id }) });
    console.log(`   Privilege Escalation Attempt Status: ${escalateRes.status} (Expected: 403)`);
    if (escalateRes.status !== 403) {
      throw new Error('Privilege escalation was not blocked!');
    }
    console.log('   ✅ PASS: Privilege escalation strictly rejected with 403 Forbidden.\n');

    console.log('5. CROSS-TENANT DATA ISOLATION (IDOR DEFENSE):');
    // Test 6: Create Victim and Project
    const victim = await prisma.user.create({
      data: {
        email: victimEmail,
        name: 'Victim User',
        role: 'OWNER',
        status: 'approved',
      },
    });
    cleanupIds.push(victim.id);

    const victimProject = await prisma.project.create({
      data: {
        userId: victim.id,
        name: 'Confidential Victim Site',
        domain: 'victim-confidential.com',
      },
    });

    // Attacker session
    const attacker = await prisma.user.create({
      data: {
        email: attackerEmail,
        name: 'Attacker User',
        role: 'OWNER',
        status: 'approved',
      },
    });
    cleanupIds.push(attacker.id);
    const attackerSession = await createSession(attacker.id);

    // Attacker tries to read victim project via API
    const idorReq = new NextRequest(`http://localhost:3000/api/projects/${victimProject.id}`, {
      method: 'GET',
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${attackerSession.sessionToken}`,
      },
    });
    const idorRes = await projectByIdGet(idorReq, { params: Promise.resolve({ id: victimProject.id }) });
    console.log(`   Attacker IDOR Access Attempt Status: ${idorRes.status} (Expected: 403)`);
    if (idorRes.status !== 403) {
      throw new Error(`IDOR vulnerability! Attacker received status: ${idorRes.status}`);
    }

    // Attacker tries to read victim project rankings
    const idorRankingsReq = new NextRequest(`http://localhost:3000/api/projects/${victimProject.id}/rankings`, {
      method: 'GET',
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${attackerSession.sessionToken}`,
      },
    });
    const idorRankingsRes = await rankingsGet(idorRankingsReq, { params: Promise.resolve({ id: victimProject.id }) });
    console.log(`   Attacker Rankings Access Status: ${idorRankingsRes.status} (Expected: 403)`);
    if (idorRankingsRes.status !== 403) {
      throw new Error(`IDOR vulnerability on rankings! Status: ${idorRankingsRes.status}`);
    }
    console.log('   ✅ PASS: Cross-tenant IDOR access strictly blocked with 403 Forbidden.\n');

    console.log('6. ADMIN SUSPENSION WORKFLOW:');
    // Test 7: Admin suspends the user
    const suspendReq = new NextRequest(`http://localhost:3000/api/admin/users/${signupData.user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        cookie: `${SESSION_COOKIE_NAME}=${adminSession.sessionToken}`,
      },
      body: JSON.stringify({
        status: 'suspended',
        suspendedReason: 'Terms violation testing',
      }),
    });
    const suspendRes = await adminUserPatch(suspendReq, { params: Promise.resolve({ id: signupData.user.id }) });
    const suspendData = await suspendRes.json();
    console.log(`   Admin Suspend Status: ${suspendRes.status} (Expected: 200)`);
    console.log(`   User Suspended Status: ${suspendData.data?.status} (Expected: suspended)`);
    if (suspendRes.status !== 200 || suspendData.data?.status !== 'suspended') {
      throw new Error(`Admin failed to suspend user: ${JSON.stringify(suspendData)}`);
    }

    // Suspended user tries to login again
    const suspendedLoginReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestUserPassword123!',
      }),
    });
    const suspendedLoginRes = await loginHandler(suspendedLoginReq);
    console.log(`   Suspended Login Status: ${suspendedLoginRes.status} (Expected: 403)`);
    if (suspendedLoginRes.status !== 403) {
      throw new Error('Suspended user was allowed to log in!');
    }
    console.log('   ✅ PASS: Suspended user is locked out with 403 Forbidden.\n');

    console.log('========================================================');
    console.log('🎉 ALL 6 SECURITY & LIFECYCLE TESTS PASSED 100%!');
    console.log('========================================================');
  } finally {
    // Cleanup
    try {
      if (cleanupIds.length > 0) {
        await prisma.session.deleteMany({ where: { userId: { in: cleanupIds } } });
        await prisma.rankingHistory.deleteMany({ where: { project: { userId: { in: cleanupIds } } } });
        await prisma.keyword.deleteMany({ where: { project: { userId: { in: cleanupIds } } } });
        await prisma.project.deleteMany({ where: { userId: { in: cleanupIds } } });
        await prisma.userRole.deleteMany({ where: { userId: { in: cleanupIds } } });
        await prisma.auditLog.deleteMany({ where: { actorId: { in: cleanupIds } } });
        await prisma.user.deleteMany({ where: { id: { in: cleanupIds } } });
      }
    } catch (e) {
      console.warn('Cleanup warning:', e);
    }
  }
}

runSecurityAndLifecycleSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Security suite error:', err);
    process.exit(1);
  });
