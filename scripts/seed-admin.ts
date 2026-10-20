import { prisma } from '../src/lib/db/prisma';
import { hashPassword } from '../src/lib/server/auth';

async function main() {
  console.log('🌱 Starting Enterprise Admin Seed...');

  const adminEmail = (process.env.DEMO_WORK_EMAIL || 'admin@seranking.com').toLowerCase().trim();
  const rawPassword = process.env.DEMO_PASSWORD || 'AdminPassword123#';
  const hashedPassword = hashPassword(rawPassword);

  // 1. Seed System Roles
  const roles = [
    {
      name: 'ADMIN',
      description: 'Full administrative access across all clients, projects, users, and platform settings.',
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
    {
      name: 'SEO_USER',
      description: 'Standard SEO practitioner with access restricted strictly to assigned projects.',
      permissions: JSON.stringify({
        manageUsers: false,
        viewAllProjects: false,
        createProjects: false,
        manageIntegrations: false,
        viewSpend: false,
        manageSettings: false,
        viewAuditLogs: false,
      }),
    },
    {
      name: 'CLIENT',
      description: 'Client guest with view-only access to assigned projects and white-label reports.',
      permissions: JSON.stringify({
        manageUsers: false,
        viewAllProjects: false,
        createProjects: false,
        manageIntegrations: false,
        viewSpend: false,
        manageSettings: false,
        viewAuditLogs: false,
        viewReports: true,
      }),
    },
  ];

  for (const roleData of roles) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        description: roleData.description,
        permissions: roleData.permissions,
      },
      create: roleData,
    });
  }
  console.log('✅ System roles seeded: ADMIN, SEO_USER, CLIENT');

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });

  // 2. Seed 1 Genuine Admin User (No fake projects or mock data)
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  let adminUser;
  if (!existingUser) {
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'System Administrator',
        role: 'ADMIN',
        status: 'active',
        passwordHash: hashedPassword,
        canCreateProject: true,
        canCreateClient: true,
      },
    });
    console.log(`✅ Created 1 Admin User: ${adminEmail}`);
  } else {
    adminUser = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: 'ADMIN',
        status: 'active',
        passwordHash: hashedPassword,
        canCreateProject: true,
        canCreateClient: true,
      },
    });
    console.log(`✅ Verified/Updated 1 Admin User: ${adminEmail}`);
  }

  // Assign user to role
  if (adminRole && adminUser) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
  }

  // 3. Create initial Audit Log for setup
  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      actorEmail: adminEmail,
      action: 'SYSTEM_BOOTSTRAP',
      entity: 'System',
      entityId: 'global',
      afterJson: JSON.stringify({ seededAt: new Date().toISOString(), adminEmail }),
      ipAddress: '127.0.0.1',
      userAgent: 'Seed-Script/1.0',
    },
  });

  console.log('✨ Seed complete. Strictly 1 Admin user initialized. Zero synthetic data.');
}

main()
  .catch((e) => {
    console.error('❌ Error in seed-admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
