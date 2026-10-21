import pg from 'pg';
const { Client } = pg;

// Read DATABASE_URL or DIRECT_URL from environment or fallback
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('No connection string found in environment!');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log('Connected to PostgreSQL successfully.');

  // Set search_path to seranking
  await client.query('SET search_path TO seranking, public;');

  console.log('Applying schema updates to "seranking" schema...');

  const ddlStatements = [
    // 1. User table additions
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "approvedBy" TEXT;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3);`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "suspendedAt" TIMESTAMP(3);`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "suspendedReason" TEXT;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "toolPermissions" TEXT;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "planTier" TEXT NOT NULL DEFAULT 'FREE_TRIAL';`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "usageLimits" TEXT;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "usageCurrent" TEXT;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "canCreateProject" BOOLEAN NOT NULL DEFAULT TRUE;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "canCreateClient" BOOLEAN NOT NULL DEFAULT TRUE;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedBy" TEXT;`,

    // 2. Project table additions
    `ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "clientId" TEXT;`,
    `ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;`,
    `ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);`,
    `ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "deletedBy" TEXT;`,
    `ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;`,

    // 3. Keyword table additions
    `ALTER TABLE "Keyword" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);`,
    `ALTER TABLE "Keyword" ADD COLUMN IF NOT EXISTS "deletedBy" TEXT;`,

    // 4. ProjectCompetitor table additions
    `ALTER TABLE "ProjectCompetitor" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);`,
    `ALTER TABLE "ProjectCompetitor" ADD COLUMN IF NOT EXISTS "deletedBy" TEXT;`,

    // 5. Role table
    `CREATE TABLE IF NOT EXISTS "Role" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT UNIQUE NOT NULL,
      "description" TEXT,
      "permissions" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    // 6. UserRole table
    `CREATE TABLE IF NOT EXISTS "UserRole" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "roleId" TEXT NOT NULL REFERENCES "Role"("id") ON DELETE CASCADE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "UserRole_userId_roleId_key" UNIQUE ("userId", "roleId")
    );`,

    // 7. Client table
    `CREATE TABLE IF NOT EXISTS "Client" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "company" TEXT,
      "email" TEXT,
      "phone" TEXT,
      "status" TEXT NOT NULL DEFAULT 'active',
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    // 8. ProjectDomain table
    `CREATE TABLE IF NOT EXISTS "ProjectDomain" (
      "id" TEXT PRIMARY KEY,
      "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
      "domain" TEXT NOT NULL,
      "isPrimary" BOOLEAN NOT NULL DEFAULT FALSE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    // 9. ProjectMember table
    `CREATE TABLE IF NOT EXISTS "ProjectMember" (
      "id" TEXT PRIMARY KEY,
      "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "role" TEXT NOT NULL DEFAULT 'MEMBER',
      "canEdit" BOOLEAN NOT NULL DEFAULT TRUE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ProjectMember_projectId_userId_key" UNIQUE ("projectId", "userId")
    );`,

    // 10. Invitation table
    `CREATE TABLE IF NOT EXISTS "Invitation" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'SEO_USER',
      "token" TEXT UNIQUE NOT NULL,
      "invitedById" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
      "projectIds" TEXT,
      "canCreateProject" BOOLEAN NOT NULL DEFAULT TRUE,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "acceptedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    // 11. AuditLog table
    `CREATE TABLE IF NOT EXISTS "AuditLog" (
      "id" TEXT PRIMARY KEY,
      "actorId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
      "actorEmail" TEXT,
      "action" TEXT NOT NULL,
      "entity" TEXT NOT NULL,
      "entityId" TEXT NOT NULL,
      "beforeJson" TEXT,
      "afterJson" TEXT,
      "ipAddress" TEXT NOT NULL DEFAULT '127.0.0.1',
      "userAgent" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    // 12. NotificationPreference table
    `CREATE TABLE IF NOT EXISTS "NotificationPreference" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "emailAlerts" BOOLEAN NOT NULL DEFAULT TRUE,
      "auditReports" BOOLEAN NOT NULL DEFAULT TRUE,
      "rankingChanges" BOOLEAN NOT NULL DEFAULT TRUE,
      "securityAlerts" BOOLEAN NOT NULL DEFAULT TRUE,
      "weeklyDigest" BOOLEAN NOT NULL DEFAULT FALSE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    // 13. SystemSetting table
    `CREATE TABLE IF NOT EXISTS "SystemSetting" (
      "id" TEXT PRIMARY KEY,
      "key" TEXT UNIQUE NOT NULL,
      "value" TEXT NOT NULL,
      "description" TEXT,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedBy" TEXT
    );`,

    // 14. ProviderConfig table
    `CREATE TABLE IF NOT EXISTS "ProviderConfig" (
      "id" TEXT PRIMARY KEY,
      "provider" TEXT UNIQUE NOT NULL,
      "name" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
      "quotaLimit" INTEGER,
      "quotaUsed" INTEGER NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'active',
      "lastHealthCheck" TIMESTAMP(3),
      "errorReason" TEXT,
      "metadata" TEXT,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
  ];

  for (const stmt of ddlStatements) {
    try {
      await client.query(stmt);
      console.log('✓ Executed:', stmt.split('\n')[0].substring(0, 70));
    } catch (e) {
      console.error('✗ Error on statement:', stmt.split('\n')[0], e.message);
    }
  }

  // Create indexes
  const indexes = [
    `CREATE INDEX IF NOT EXISTS "idx_user_status_role" ON "User"("status", "role");`,
    `CREATE INDEX IF NOT EXISTS "idx_projectmember_user" ON "ProjectMember"("userId");`,
    `CREATE INDEX IF NOT EXISTS "idx_projectmember_project" ON "ProjectMember"("projectId");`,
    `CREATE INDEX IF NOT EXISTS "idx_auditlog_entity" ON "AuditLog"("entity", "entityId");`,
    `CREATE INDEX IF NOT EXISTS "idx_auditlog_actor" ON "AuditLog"("actorId");`,
    `CREATE INDEX IF NOT EXISTS "idx_auditlog_created" ON "AuditLog"("createdAt");`,
    `CREATE INDEX IF NOT EXISTS "idx_invitation_token" ON "Invitation"("token");`,
    `CREATE INDEX IF NOT EXISTS "idx_invitation_email" ON "Invitation"("email");`,
  ];

  for (const idx of indexes) {
    try {
      await client.query(idx);
      console.log('✓ Index created:', idx.substring(0, 60));
    } catch (e) {
      console.error('✗ Index error:', idx, e.message);
    }
  }

  // Insert standard roles if not present
  const standardRoles = [
    {
      id: 'role-admin',
      name: 'ADMIN',
      description: 'Full administrative access across all projects, users, provider settings, and audit logs.',
      permissions: JSON.stringify({
        manageUsers: true,
        viewAllProjects: true,
        createProject: true,
        assignTeamMembers: true,
        runAuditAndResearch: true,
        manageGlobalApiCredentials: true,
        viewSpendAndUsage: true,
        createProjectReports: true,
        changeGlobalSettings: true,
        viewAdminAuditLogs: true,
      }),
    },
    {
      id: 'role-seo-user',
      name: 'SEO_USER',
      description: 'Assigned projects only. Research, crawling, ranking checks, and reports within quotas.',
      permissions: JSON.stringify({
        manageUsers: false,
        viewAllProjects: false,
        createProject: false,
        assignTeamMembers: false,
        runAuditAndResearch: true,
        manageGlobalApiCredentials: false,
        viewSpendAndUsage: false,
        createProjectReports: true,
        changeGlobalSettings: false,
        viewAdminAuditLogs: false,
      }),
    },
    {
      id: 'role-client',
      name: 'CLIENT',
      description: 'Client viewer access. Read-only view of assigned project reports and dashboard.',
      permissions: JSON.stringify({
        manageUsers: false,
        viewAllProjects: false,
        createProject: false,
        assignTeamMembers: false,
        runAuditAndResearch: false,
        manageGlobalApiCredentials: false,
        viewSpendAndUsage: false,
        createProjectReports: false,
        changeGlobalSettings: false,
        viewAdminAuditLogs: false,
      }),
    },
  ];

  for (const r of standardRoles) {
    await client.query(
      `INSERT INTO "Role" ("id", "name", "description", "permissions", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT ("name") DO UPDATE 
       SET "description" = EXCLUDED."description", "permissions" = EXCLUDED."permissions";`,
      [r.id, r.name, r.description, r.permissions]
    );
    console.log(`✓ Role synced: ${r.name}`);
  }

  // Ensure admin@seranking.com has role 'ADMIN', planTier 'ENTERPRISE', status 'active'
  await client.query(
    `UPDATE "User" 
     SET "role" = 'ADMIN', "planTier" = 'ENTERPRISE', "status" = 'active', "canCreateProject" = TRUE, "canCreateClient" = TRUE
     WHERE "email" = 'admin@seranking.com';`
  );
  console.log('✓ Admin user updated with ADMIN role and ENTERPRISE tier.');

  // Populate ProjectMember for existing projects where userId is set
  const projectOwners = await client.query(`SELECT "id", "userId" FROM "Project" WHERE "userId" IS NOT NULL;`);
  for (const row of projectOwners.rows) {
    await client.query(
      `INSERT INTO "ProjectMember" ("id", "projectId", "userId", "role", "canEdit", "createdAt")
       VALUES ($1, $2, $3, 'OWNER', TRUE, NOW())
       ON CONFLICT ("projectId", "userId") DO NOTHING;`,
      [`pm-${row.id}-${row.userId}`, row.id, row.userId]
    );
  }
  console.log(`✓ Project ownership memberships synchronized (${projectOwners.rowCount} projects).`);

  await client.end();
  console.log('All migrations applied successfully! 🎉');
}

run().catch((err) => {
  console.error('Fatal migration failure:', err);
  process.exit(1);
});
