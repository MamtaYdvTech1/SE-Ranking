import { prisma } from '../src/lib/db/prisma';
import { hashPassword } from '../src/lib/server/auth';
import { PLAN_CONFIGS } from '../src/lib/server/permissions';

async function bootstrapSuperAdmin() {
  const args = process.argv.slice(2);
  const emailArg = args[0] || process.env.SUPERADMIN_EMAIL;
  const passwordArg = args[1] || process.env.SUPERADMIN_PASSWORD;
  const nameArg = args[2] || process.env.SUPERADMIN_NAME || 'Platform Administrator';

  if (!emailArg || !passwordArg) {
    console.error('❌ Security Error: Superadmin email and password must be explicitly provided.');
    console.error('   Usage: npx tsx scripts/bootstrap-superadmin.ts <email> <password> [name]');
    console.error('   Or set env vars: SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD.');
    process.exit(1);
  }

  if (passwordArg.length < 12) {
    console.error('❌ Security Error: Superadmin password must be at least 12 characters long.');
    process.exit(1);
  }

  const normalizedEmail = emailArg.toLowerCase().trim();

  console.log('====================================================');
  console.log('🚀 SE Ranking SaaS - Secure Super-Admin Bootstrap');
  console.log('====================================================');
  console.log(`Target Email: ${normalizedEmail}`);
  console.log(`Target Name:  ${nameArg}`);
  console.log(`Plan Tier:    ENTERPRISE`);
  console.log(`Status:       ACTIVE (Approved)`);
  console.log('----------------------------------------------------');

  const hashedPassword = hashPassword(passwordArg);

  // 1. Ensure ADMIN Role Exists
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {
      description: 'Super administrative control over users, approval workflow, plans, tools, and audit logs.',
      permissions: JSON.stringify({
        manageUsers: true,
        viewAllProjects: true,
        createProjects: true,
        manageIntegrations: true,
        viewSpend: true,
        manageSettings: true,
        viewAuditLogs: true,
      }),
    },
    create: {
      name: 'ADMIN',
      description: 'Super administrative control over users, approval workflow, plans, tools, and audit logs.',
      permissions: JSON.stringify({
        manageUsers: true,
        viewAllProjects: true,
        createProjects: true,
        manageIntegrations: true,
        viewSpend: true,
        manageSettings: true,
        viewAuditLogs: true,
      }),
    },
  });

  // 2. All 7 tool permissions enabled for SuperAdmin
  const allToolPermissions = {
    audits: true,
    rankings: true,
    keywords: true,
    backlinks: true,
    ai_visibility: true,
    competitor_research: true,
    reports: true,
  };

  const enterpriseLimits = PLAN_CONFIGS.ENTERPRISE.limits;

  // 3. Upsert Super-Admin User
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  let user;
  if (existingUser) {
    user = await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        name: nameArg,
        role: 'ADMIN',
        status: 'active',
        passwordHash: hashedPassword,
        planTier: 'ENTERPRISE',
        approvedAt: new Date(),
        approvedBy: 'SYSTEM_BOOTSTRAP',
        rejectionReason: null,
        suspendedAt: null,
        suspendedReason: null,
        canCreateProject: true,
        canCreateClient: true,
        toolPermissions: JSON.stringify(allToolPermissions),
        usageLimits: JSON.stringify(enterpriseLimits),
      },
    });
    console.log(`✅ Existing user upgraded to active ENTERPRISE SuperAdmin: ${normalizedEmail}`);
  } else {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: nameArg,
        role: 'ADMIN',
        status: 'active',
        passwordHash: hashedPassword,
        planTier: 'ENTERPRISE',
        approvedAt: new Date(),
        approvedBy: 'SYSTEM_BOOTSTRAP',
        canCreateProject: true,
        canCreateClient: true,
        toolPermissions: JSON.stringify(allToolPermissions),
        usageLimits: JSON.stringify(enterpriseLimits),
      },
    });
    console.log(`✅ Brand new active ENTERPRISE SuperAdmin created: ${normalizedEmail}`);
  }

  // 4. Assign Admin Role in UserRole join table
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: adminRole.id,
    },
  });

  // 5. Write Immutable Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      actorEmail: normalizedEmail,
      action: 'SUPERADMIN_BOOTSTRAP',
      entity: 'User',
      entityId: user.id,
      afterJson: JSON.stringify({
        email: normalizedEmail,
        role: 'ADMIN',
        status: 'active',
        planTier: 'ENTERPRISE',
        toolPermissions: allToolPermissions,
        limits: enterpriseLimits,
        bootstrappedAt: new Date().toISOString(),
      }),
      ipAddress: '127.0.0.1',
      userAgent: 'Bootstrap-CLI/1.0',
    },
  });

  console.log('✅ Audit log created for SUPERADMIN_BOOTSTRAP');
  console.log('====================================================');
  console.log('🎉 SuperAdmin Bootstrap Successful!');
  console.log(`Email:    ${normalizedEmail}`);
  console.log(`Password: ${passwordArg.replace(/./g, '*')}`);
  console.log('You can now log in at /login with full access.');
  console.log('====================================================');
}

bootstrapSuperAdmin()
  .catch((err) => {
    console.error('❌ Bootstrap failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
