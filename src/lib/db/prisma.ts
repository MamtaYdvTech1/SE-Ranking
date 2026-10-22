import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import os from 'os';

function resolveDatabaseUrl(): string {
  const rawUrl = process.env.DATABASE_URL || '';
  const isPostgresUrl = rawUrl.startsWith('postgres://') || rawUrl.startsWith('postgresql://');

  if (rawUrl && isPostgresUrl) {
    let tunedUrl = rawUrl;
    if (!tunedUrl.includes('connection_limit=')) {
      const sep = tunedUrl.includes('?') ? '&' : '?';
      tunedUrl = `${tunedUrl}${sep}connection_limit=15`;
    }
    if (!tunedUrl.includes('pool_timeout=')) {
      const sep = tunedUrl.includes('?') ? '&' : '?';
      tunedUrl = `${tunedUrl}${sep}pool_timeout=30`;
    }
    return tunedUrl;
  }

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const tmpDbPath = path.join(os.tmpdir(), 'dev.db');
    try {
      if (!fs.existsSync(tmpDbPath)) {
        const srcDb = path.join(process.cwd(), 'prisma', 'dev.db');
        if (fs.existsSync(srcDb)) {
          fs.copyFileSync(srcDb, tmpDbPath);
        }
      }
    } catch (err) {
      console.warn('Could not copy SQLite database to /tmp:', err);
    }
    return `file:${tmpDbPath}`;
  }

  // Ensure SQLite always resolves to absolute path with forward slashes on Windows and Unix
  const localPrismaDb = path.resolve(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/');
  const nestedPrismaDb = path.resolve(process.cwd(), 'prisma', 'prisma', 'dev.db').replace(/\\/g, '/');

  try {
    const stat1 = fs.existsSync(localPrismaDb) ? fs.statSync(localPrismaDb) : null;
    const stat2 = fs.existsSync(nestedPrismaDb) ? fs.statSync(nestedPrismaDb) : null;

    if ((!stat1 || stat1.size === 0) && stat2 && stat2.size > 0) {
      try {
        fs.copyFileSync(nestedPrismaDb, localPrismaDb);
      } catch {}
      return `file:${nestedPrismaDb}`;
    }
  } catch (e) {
    console.warn('Database path check error:', e);
  }

  return `file:${localPrismaDb}`;
}

const resolvedDbUrl = resolveDatabaseUrl();
process.env.DATABASE_URL = resolvedDbUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolvedDbUrl,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
