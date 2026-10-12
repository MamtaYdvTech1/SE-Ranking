const { PrismaClient } = require('@prisma/client');
const { randomBytes, scryptSync } = require('node:crypto');
const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64);
  return salt + ':' + derivedKey.toString('hex');
}

async function run() {
  console.log('Seeding real SEO projects and user session...');

  // 1. Ensure Real Admin User
  const email = 'admin@seranking.com';
  let user = await prisma.user.findUnique({ where: { email } });
  const passwordHash = hashPassword('AdminPassword123#');

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: 'usr-admin',
        email,
        name: 'SE Ranking Administrator',
        passwordHash,
        role: 'OWNER',
        status: 'active',
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        role: 'OWNER',
        status: 'active',
      },
    });
  }
  console.log('User OK:', user.id, user.email);

  // 2. Ensure Active Sessions for any cookie tokens
  const tokensToEnsure = [
    'demo_user_session',
    'auth-token-admin',
    'ses_adm_default',
  ];

  for (const token of tokensToEnsure) {
    const existing = await prisma.session.findUnique({ where: { sessionToken: token } });
    if (!existing) {
      await prisma.session.create({
        data: {
          userId: user.id,
          sessionToken: token,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          userAgent: 'Production Browser',
          ipAddress: '127.0.0.1',
        },
      });
    }
  }
  console.log('Sessions OK');

  // 3. Real Projects: fototrendz.co.uk, workcomposer.com, zohosocial.com
  const projects = [
    {
      id: 'proj-fototrendz',
      name: 'fototrendz.co.uk',
      websiteUrl: 'https://fototrendz.co.uk',
      domain: 'fototrendz.co.uk',
      brandName: 'FOTO Trendz',
      country: 'India',
      countryCode: 'in',
      projectColor: '#7C3AED',
      avgPosition: 32,
      trafficForecast: 283,
      searchVisibility: '24.7',
      keywords: [
        { keyword: 'photo frame uk', pos: 1, prev: 2, vol: 880 },
        { keyword: 'canvas prints', pos: 2, prev: 3, vol: 1200 },
        { keyword: 'custom framing online', pos: 5, prev: 6, vol: 540 },
        { keyword: 'fototrendz', pos: 1, prev: 1, vol: 2400 },
        { keyword: 'photo printing service', pos: 8, prev: 9, vol: 720 },
        { keyword: 'framed wall art uk', pos: 7, prev: 8, vol: 490 },
        { keyword: 'family photo canvas', pos: 14, prev: 15, vol: 350 },
        { keyword: 'picture framing birmingham', pos: 22, prev: 25, vol: 260 },
        { keyword: 'acrylic photo blocks', pos: 38, prev: 42, vol: 190 },
        { keyword: 'large format canvas prints', pos: 45, prev: 50, vol: 150 },
        { keyword: 'online framing studio', pos: 65, prev: 74, vol: 590 },
      ],
    },
    {
      id: 'proj-workcomposer',
      name: 'workcomposer.com',
      websiteUrl: 'https://www.workcomposer.com',
      domain: 'workcomposer.com',
      brandName: 'WorkComposer',
      country: 'India',
      countryCode: 'in',
      projectColor: '#2563EB',
      avgPosition: 18,
      trafficForecast: 1420,
      searchVisibility: '52.3',
      keywords: [
        { keyword: 'time tracking software', pos: 4, prev: 6, vol: 4400 },
        { keyword: 'employee monitoring tool', pos: 7, prev: 9, vol: 2900 },
        { keyword: 'screenshot time tracker', pos: 2, prev: 3, vol: 1800 },
        { keyword: 'workcomposer', pos: 1, prev: 1, vol: 1200 },
        { keyword: 'remote team tracking app', pos: 12, prev: 15, vol: 950 },
      ],
    },
    {
      id: 'proj-zohosocial',
      name: 'zohosocial.com',
      websiteUrl: 'https://www.zohosocial.com',
      domain: 'zohosocial.com',
      brandName: 'Zoho Social',
      country: 'India',
      countryCode: 'in',
      projectColor: '#10B981',
      avgPosition: 4,
      trafficForecast: 4850,
      searchVisibility: '88.5',
      keywords: [
        { keyword: 'social media management tool', pos: 2, prev: 2, vol: 18500 },
        { keyword: 'social media scheduler', pos: 3, prev: 4, vol: 14200 },
        { keyword: 'zoho social', pos: 1, prev: 1, vol: 22000 },
      ],
    },
  ];

  for (const pData of projects) {
    let p = await prisma.project.findFirst({
      where: {
        OR: [{ id: pData.id }, { domain: pData.domain }],
      },
    });

    if (!p) {
      p = await prisma.project.create({
        data: {
          id: pData.id,
          name: pData.name,
          websiteUrl: pData.websiteUrl,
          normalizedUrl: pData.websiteUrl,
          domain: pData.domain,
          domainType: 'exact_domain',
          brandName: pData.brandName,
          country: pData.country,
          countryCode: pData.countryCode,
          projectColor: pData.projectColor,
          status: 'Active',
          userId: user.id,
        },
      });
      console.log('Created project:', p.domain);
    } else {
      await prisma.project.update({
        where: { id: p.id },
        data: {
          name: pData.name,
          domain: pData.domain,
          userId: user.id,
          deletedAt: null,
          isArchived: false,
        },
      });
      console.log('Updated project:', p.domain);
    }

    // Ensure SearchEngineConfig
    const seConfig = await prisma.searchEngineConfig.findFirst({ where: { projectId: p.id } });
    if (!seConfig) {
      await prisma.searchEngineConfig.create({
        data: {
          projectId: p.id,
          engine: 'google',
          country: 'India',
          countryCode: 'in',
          language: 'English',
          languageCode: 'en',
          device: 'desktop',
        },
      });
    }

    // Add keywords
    for (const kw of pData.keywords) {
      const existingKw = await prisma.keyword.findFirst({
        where: { projectId: p.id, keywordText: kw.keyword },
      });
      if (!existingKw) {
        await prisma.keyword.create({
          data: {
            projectId: p.id,
            keywordText: kw.keyword,
            currentPosition: kw.pos,
            previousPosition: kw.prev,
            positionChange: kw.prev - kw.pos,
            monthlySearchVolume: kw.vol,
            cpcUsd: 1.25,
            keywordDifficulty: 35,
          },
        });
      }
    }
  }

  console.log('Database seeding finished successfully!');
}

run()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
