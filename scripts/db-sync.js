/**
 * Database Switcher & Migration Sync Script
 * Seamlessly toggles between local SQLite and Supabase PostgreSQL.
 *
 * Usage:
 *   node scripts/db-sync.js --status
 *   node scripts/db-sync.js --supabase
 *   node scripts/db-sync.js --sqlite
 *   node scripts/db-sync.js --push
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const schemaPath = path.resolve(rootDir, 'prisma', 'schema.prisma');
const envPath = path.resolve(rootDir, '.env');

function readSchema() {
  return fs.readFileSync(schemaPath, 'utf8');
}

function writeSchema(content) {
  fs.writeFileSync(schemaPath, content, 'utf8');
}

const args = process.argv.slice(2);
const mode = args[0] || '--status';

const schemaContent = readSchema();
const isPostgres = schemaContent.includes('provider = "postgresql"') || schemaContent.includes('provider  = "postgresql"');
const isSqlite = schemaContent.includes('provider = "sqlite"') || schemaContent.includes('provider  = "sqlite"');

console.log('----------------------------------------------------');
console.log(' SE Ranking Database Provider Manager');
console.log('----------------------------------------------------');
console.log(`Current Schema Provider: ${isPostgres ? 'PostgreSQL (Supabase)' : isSqlite ? 'SQLite (dev.db)' : 'Unknown'}`);

if (mode === '--status') {
  console.log(`Schema file: ${schemaPath}`);
  console.log('\nAvailable actions:');
  console.log('  node scripts/db-sync.js --supabase   -> Configure for Supabase PostgreSQL');
  console.log('  node scripts/db-sync.js --sqlite     -> Configure for local SQLite');
  console.log('  node scripts/db-sync.js --push       -> Push Prisma schema directly to Supabase');
  process.exit(0);
}

if (mode === '--supabase' || mode === '--push') {
  console.log('\n[1/3] Updating datasource block for Supabase PostgreSQL...');
  let updated = schemaContent;
  
  // Replace datasource block
  const pgDatasource = `datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}`;
  
  updated = updated.replace(/datasource\s+db\s*\{[^}]+\}/s, pgDatasource);
  writeSchema(updated);

  console.log('[2/3] Generating Prisma Client for PostgreSQL...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit', cwd: rootDir });
  } catch (err) {
    console.warn('Prisma generate note:', err.message);
  }

  if (mode === '--push') {
    console.log('[3/3] Pushing schema to Supabase database...');
    try {
      execSync('npx prisma db push --skip-generate', { stdio: 'inherit', cwd: rootDir });
      console.log('✅ Supabase PostgreSQL schema synchronized successfully!');
    } catch (err) {
      console.warn('Prisma db push note:', err.message);
    }
  } else {
    console.log('✅ Prisma configured for Supabase PostgreSQL!');
  }
}

if (mode === '--sqlite') {
  console.log('\n[1/2] Updating datasource block for local SQLite...');
  let updated = schemaContent;
  
  const sqliteDatasource = `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`;
  
  updated = updated.replace(/datasource\s+db\s*\{[^}]+\}/s, sqliteDatasource);
  writeSchema(updated);

  console.log('[2/2] Generating Prisma Client for SQLite...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit', cwd: rootDir });
    console.log('✅ Prisma configured for local SQLite persistence!');
  } catch (err) {
    console.warn('Prisma generate note:', err.message);
  }
}
