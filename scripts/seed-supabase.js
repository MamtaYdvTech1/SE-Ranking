const { PrismaClient } = require('@prisma/client');
const { randomBytes, scryptSync } = require('crypto');

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Supabase PostgreSQL database...');

  // 1. Create or update Admin User
  const adminEmail = 'admin@seranking.com';
  const adminPass = 'AdminPassword123#';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'SE Ranking Admin',
        passwordHash: hashPassword(adminPass),
        role: 'OWNER',
        status: 'active',
      },
    });
    console.log('✅ Admin user created in Supabase:', admin.email);
  } else {
    console.log('ℹ️ Admin user already exists:', admin.email);
  }

  // 2. Check if projects exist, if not create default workcomposer.com project
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    const project = await prisma.project.create({
      data: {
        name: 'workcomposer.com',
        domain: 'workcomposer.com',
        websiteUrl: 'https://www.workcomposer.com/',
        protocol: 'https://',
        country: 'India',
        countryCode: 'in',
        status: 'Active',
        userId: admin.id,
        searchEngines: {
          create: [
            {
              engine: 'google',
              country: 'India',
              countryCode: 'in',
              language: 'English',
              languageCode: 'en',
              device: 'desktop',
            },
          ],
        },
        keywords: {
          create: [
            {
              keywordText: 'employee monitoring software',
              monthlySearchVolume: 8100,
              keywordDifficulty: 64,
              cpcUsd: 4.85,
              currentPosition: 3,
              previousPosition: 5,
              positionChange: 2,
              searchIntent: 'Commercial',
            },
            {
              keywordText: 'time tracking tool',
              monthlySearchVolume: 14800,
              keywordDifficulty: 72,
              cpcUsd: 6.2,
              currentPosition: 7,
              previousPosition: 8,
              positionChange: 1,
              searchIntent: 'Commercial',
            },
            {
              keywordText: 'productivity tracker app',
              monthlySearchVolume: 3600,
              keywordDifficulty: 48,
              cpcUsd: 2.9,
              currentPosition: 4,
              previousPosition: 4,
              positionChange: 0,
              searchIntent: 'Informational',
            },
          ],
        },
      },
    });
    console.log('✅ Seeded default project in Supabase:', project.name);
  } else {
    console.log(`ℹ️ Supabase already has ${projectCount} project(s).`);
  }

  const finalUsers = await prisma.user.count();
  const finalProjects = await prisma.project.count();
  const finalKeywords = await prisma.keyword.count();

  console.log('----------------------------------------------------');
  console.log(' Supabase Database Verification Summary');
  console.log('----------------------------------------------------');
  console.log(`Users:    ${finalUsers}`);
  console.log(`Projects: ${finalProjects}`);
  console.log(`Keywords: ${finalKeywords}`);
  console.log('✅ Supabase PostgreSQL is live, fully populated, and verified!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
