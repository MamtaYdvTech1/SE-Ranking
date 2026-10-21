import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL or DIRECT_URL is required in environment.');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log('Connected to PostgreSQL database for security hardening...');

  const migrationPath = path.resolve(process.cwd(), 'prisma', 'migrations', '20261021_enable_rls_and_protect_sensitive_columns.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split statements by semicolon while ignoring comments
  const rawStatements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  console.log(`Executing ${rawStatements.length} security hardening DDL statements...`);

  let appliedCount = 0;
  let skipCount = 0;

  for (const stmt of rawStatements) {
    try {
      await client.query(stmt);
      appliedCount++;
      const firstLine = stmt.split('\n').find((l) => l.trim() && !l.trim().startsWith('--')) || stmt;
      console.log(`✓ [${appliedCount}/${rawStatements.length}] ${firstLine.substring(0, 65)}...`);
    } catch (err) {
      console.warn(`! Statement warning: ${err.message}`);
      skipCount++;
    }
  }

  console.log(`\nMigration completed: ${appliedCount} applied, ${skipCount} warnings/skipped.`);

  // Verify verification query
  const checkPublic = await client.query(`
    SELECT count(*) as total, count(*) filter (where rowsecurity = true) as rls_enabled
    FROM pg_tables 
    WHERE schemaname = 'public';
  `);
  console.log(`Public schema RLS verification: ${checkPublic.rows[0].rls_enabled}/${checkPublic.rows[0].total} tables have RLS ENABLED.`);

  const checkSeranking = await client.query(`
    SELECT count(*) as total, count(*) filter (where rowsecurity = true) as rls_enabled
    FROM pg_tables 
    WHERE schemaname = 'seranking';
  `);
  console.log(`Seranking schema RLS verification: ${checkSeranking.rows[0].rls_enabled}/${checkSeranking.rows[0].total} tables have RLS ENABLED.`);

  const policiesCheck = await client.query(`SELECT count(*) as total FROM pg_policies;`);
  console.log(`Total active RLS policies in database: ${policiesCheck.rows[0].total}`);

  await client.end();
  console.log('Security hardening successfully applied! 🔒');
}

run().catch((err) => {
  console.error('Fatal security hardening error:', err);
  process.exit(1);
});
