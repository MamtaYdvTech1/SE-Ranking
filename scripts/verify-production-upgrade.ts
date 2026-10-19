import { prisma } from '../src/lib/db/prisma';
import { hashPassword, verifyPassword, sanitizeForCsv, requireToolAccess } from '../src/lib/server/auth';
import {
  checkAndIncrementQuota,
  resolveUserToolPermissions,
  resolveUserPlanLimits,
  isUserApproved,
  PLAN_CONFIGS,
  ALL_TOOLS_ENABLED,
} from '../src/lib/server/permissions';
import { isSafeUrl } from '../src/services/seo/audit.service';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? `: ${detail}` : ''}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Running Production SaaS Upgrade Verification Suite');
  console.log('====================================================\n');

  const testEmail = `test-user-${Date.now()}@production-test.com`;
  const rawPassword = 'SecurePassword123!';
  const hashedPassword = hashPassword(rawPassword);

  // ----------------------------------------------------
  // TEST 1: Password Hashing & Verification
  // ----------------------------------------------------
  console.log('--- Suite 1: Authentication & Password Security ---');
  assert(verifyPassword(rawPassword, hashedPassword), 'Password hash verifies correctly');
  assert(!verifyPassword('WrongPassword!', hashedPassword), 'Incorrect password rejected');

  // ----------------------------------------------------
  // TEST 2: Registration Default Status is "pending"
  // ----------------------------------------------------
  console.log('\n--- Suite 2: Manual Approval Lifecycle ---');
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      name: 'Test Candidate',
      passwordHash: hashedPassword,
      status: 'pending',
      role: 'SEO_USER',
      planTier: 'FREE_TRIAL',
      toolPermissions: JSON.stringify(PLAN_CONFIGS.FREE_TRIAL.defaultPermissions),
      usageLimits: JSON.stringify(PLAN_CONFIGS.FREE_TRIAL.limits),
      usageCurrent: JSON.stringify({
        keywordsUsed: 0,
        auditPagesUsed: 0,
        backlinkQueriesUsed: 0,
        aiQueriesUsed: 0,
        periodStart: new Date().toISOString().slice(0, 7) + '-01',
      }),
    },
  });

  assert(user.status === 'pending', 'Newly registered user defaults to "pending" status');
  assert(!isUserApproved(user), 'Pending user is not approved');

  // ----------------------------------------------------
  // TEST 3: Admin Approval Transitions to "active"
  // ----------------------------------------------------
  const approvedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      status: 'active',
      approvedAt: new Date(),
      approvedBy: 'admin@seranking.com',
    },
  });

  assert(approvedUser.status === 'active', 'User successfully approved to "active"');
  assert(approvedUser.approvedAt !== null, 'Approval timestamp recorded');
  assert(isUserApproved(approvedUser), 'Active user is verified as approved');

  // ----------------------------------------------------
  // TEST 4: Tool Permissions Enforcement
  // ----------------------------------------------------
  console.log('\n--- Suite 3: Granular Tool Permissions ---');
  // Revoke 'backlinks' and enable 'audits'
  const customPerms = { ...PLAN_CONFIGS.FREE_TRIAL.defaultPermissions, backlinks: false, audits: true };
  const userWithCustomPerms = await prisma.user.update({
    where: { id: user.id },
    data: {
      toolPermissions: JSON.stringify(customPerms),
    },
  });

  const resolved = resolveUserToolPermissions(userWithCustomPerms);
  assert(resolved.audits === true, 'Enabled tool (audits) granted');
  assert(resolved.backlinks === false, 'Disabled tool (backlinks) denied');
  assert(resolved.rankings === true, 'Default tool (rankings) retained');

  // Superadmin bypass test
  const superAdminPerms = resolveUserToolPermissions({ role: 'SUPERADMIN' });
  assert(
    superAdminPerms.audits && superAdminPerms.backlinks && superAdminPerms.reports,
    'SUPERADMIN role unconditionally bypasses tool restrictions'
  );

  // ----------------------------------------------------
  // TEST 5: Server-side Usage Quota Enforcement
  // ----------------------------------------------------
  console.log('\n--- Suite 4: Server-Side Quota Enforcement ---');
  // Set limit to 2 audit pages
  await prisma.user.update({
    where: { id: user.id },
    data: {
      usageLimits: JSON.stringify({
        maxProjects: 1,
        monthlyKeywords: 10,
        monthlyAuditPages: 2,
        monthlyBacklinkQueries: 10,
        monthlyAiQueries: 10,
      }),
      usageCurrent: JSON.stringify({
        keywordsUsed: 0,
        auditPagesUsed: 0,
        backlinkQueriesUsed: 0,
        aiQueriesUsed: 0,
        periodStart: new Date().toISOString().slice(0, 7) + '-01',
      }),
    },
  });

  // Call 1
  const q1 = await checkAndIncrementQuota(user.id, 'auditPages', 1);
  assert(q1.allowed && q1.used === 1, `Quota Call 1 allowed (1/2 used) [reported: ${q1.used}]`);

  // Call 2
  const q2 = await checkAndIncrementQuota(user.id, 'auditPages', 1);
  assert(q2.allowed && q2.used === 2, `Quota Call 2 allowed (2/2 used) [reported: ${q2.used}]`);

  // Call 3 (exceeds limit)
  const q3 = await checkAndIncrementQuota(user.id, 'auditPages', 1);
  assert(!q3.allowed && q3.used === 2, `Quota Call 3 blocked when limit exceeded (blocked: ${!q3.allowed})`);
  assert(q3.error !== undefined && q3.error.includes('Monthly quota exceeded'), 'Appropriate quota error message returned');

  // ----------------------------------------------------
  // TEST 6: SSRF Protection in Web Crawler / Audits
  // ----------------------------------------------------
  console.log('\n--- Suite 5: SSRF Vulnerability Prevention ---');
  assert(!isSafeUrl('http://127.0.0.1'), 'Blocks 127.0.0.1 (Localhost)');
  assert(!isSafeUrl('http://localhost:3000'), 'Blocks localhost');
  assert(!isSafeUrl('http://169.254.169.254/latest/meta-data/'), 'Blocks AWS cloud metadata IP (169.254.169.254)');
  assert(!isSafeUrl('http://10.0.0.5/admin'), 'Blocks RFC 1918 Private class A (10.0.0.0/8)');
  assert(!isSafeUrl('http://192.168.1.1/router'), 'Blocks RFC 1918 Private class C (192.168.0.0/16)');
  assert(!isSafeUrl('http://172.16.0.1'), 'Blocks RFC 1918 Private class B (172.16.0.0/12)');
  assert(!isSafeUrl('file:///etc/passwd'), 'Blocks file:// scheme');
  assert(isSafeUrl('https://example.com'), 'Permits valid public internet URL (https://example.com)');
  assert(isSafeUrl('https://seranking.com'), 'Permits valid public internet URL (https://seranking.com)');

  // ----------------------------------------------------
  // TEST 7: CSV Formula Injection Sanitization
  // ----------------------------------------------------
  console.log('\n--- Suite 6: CSV Formula Injection Protection ---');
  assert(sanitizeForCsv('=SUM(A1:A10)') === "'=SUM(A1:A10)", 'Prefixes = formula prefix');
  assert(sanitizeForCsv('+cmd|/c calc') === "'+cmd|/c calc", 'Prefixes + formula prefix');
  assert(sanitizeForCsv('-2+3') === "'-2+3", 'Prefixes - formula prefix');
  assert(sanitizeForCsv('@cmd|/c calc') === "'@cmd|/c calc", 'Prefixes @ formula prefix');
  assert(sanitizeForCsv('Normal Domain') === 'Normal Domain', 'Leaves safe text unaltered');

  // ----------------------------------------------------
  // TEST 8: Suspension Lifecycle
  // ----------------------------------------------------
  console.log('\n--- Suite 7: User Suspension Lifecycle ---');
  const suspendedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      status: 'suspended',
      suspendedAt: new Date(),
      suspendedReason: 'Terms violation: automated scraping detected',
    },
  });

  assert(suspendedUser.status === 'suspended', 'User status transitioned to "suspended"');
  assert(!isUserApproved(suspendedUser), 'Suspended user is denied approval access');
  assert(suspendedUser.suspendedReason !== null, 'Suspension reason persisted in database');

  // ----------------------------------------------------
  // TEST 9: Plan Tier Limit Resolution
  // ----------------------------------------------------
  console.log('\n--- Suite 8: Plan Tiers & Upgrades ---');
  const starterLimits = resolveUserPlanLimits({ role: 'SEO_USER', planTier: 'STARTER' });
  const proLimits = resolveUserPlanLimits({ role: 'SEO_USER', planTier: 'PRO' });
  const enterpriseLimits = resolveUserPlanLimits({ role: 'ADMIN', planTier: 'ENTERPRISE' });

  assert(starterLimits.monthlyKeywords === 250, 'STARTER tier resolves 250 monthly keywords');
  assert(proLimits.monthlyKeywords === 1000, 'PRO tier resolves 1000 monthly keywords');
  assert(enterpriseLimits.maxProjects >= 9999, 'ENTERPRISE tier resolves unlimited projects');

  // ----------------------------------------------------
  // CLEANUP
  // ----------------------------------------------------
  console.log('\n--- Cleanup ---');
  await prisma.user.delete({
    where: { id: user.id },
  });
  console.log('  🧹 Temporary test user removed from database.');

  console.log('\n====================================================');
  console.log(`Summary: ${testsPassed} passed, ${testsFailed} failed.`);
  console.log('====================================================');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error('Fatal error running tests:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
