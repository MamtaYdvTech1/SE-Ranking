const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const dbPath = path.resolve(__dirname, '..', 'prisma', 'dev.db');
const db = new DatabaseSync(dbPath);

function readAll(table) {
  try {
    return db.prepare(`SELECT * FROM "${table}"`).all();
  } catch (err) {
    console.warn(`Could not read ${table}:`, err.message);
    return [];
  }
}

function parseDate(val) {
  if (!val) return null;
  if (typeof val === 'number') return new Date(val);
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function parseBool(val) {
  if (val === null || val === undefined) return false;
  return Boolean(val === 1 || val === true || val === '1');
}

async function migrate() {
  console.log('================================================================');
  console.log(' Batch Migrating Full Dataset from SQLite to Supabase');
  console.log('================================================================');

  // 1. Users
  const users = readAll('User');
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role || 'OWNER',
        status: u.status || 'active',
        passwordHash: u.passwordHash,
        avatarUrl: u.avatarUrl,
        lastLoginAt: parseDate(u.lastLoginAt),
      },
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role || 'OWNER',
        status: u.status || 'active',
        passwordHash: u.passwordHash,
        avatarUrl: u.avatarUrl,
        lastLoginAt: parseDate(u.lastLoginAt),
        createdAt: parseDate(u.createdAt) || new Date(),
        updatedAt: parseDate(u.updatedAt) || new Date(),
      },
    });
  }
  console.log(`✅ Users: ${users.length}`);

  // 2. ProjectGroup
  const groups = readAll('ProjectGroup');
  for (const g of groups) {
    await prisma.projectGroup.upsert({
      where: { id: g.id },
      update: { name: g.name, color: g.color },
      create: {
        id: g.id,
        name: g.name,
        color: g.color,
        createdAt: parseDate(g.createdAt) || new Date(),
        updatedAt: parseDate(g.updatedAt) || new Date(),
      },
    });
  }

  // 3. Projects
  const projects = readAll('Project');
  const adminUser = await prisma.user.findFirst();
  for (const p of projects) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        domain: p.domain,
        websiteUrl: p.websiteUrl,
        normalizedUrl: p.normalizedUrl,
        domainType: p.domainType || 'exact_domain',
        projectColor: p.projectColor,
        accessLevel: p.accessLevel || 'OWNER',
        status: p.status || 'Active',
        weeklyReport: parseBool(p.weeklyReport),
        websiteAudit: parseBool(p.websiteAudit),
        backlinkReport: parseBool(p.backlinkReport),
        brandName: p.brandName,
        protocol: p.protocol || 'https://',
        country: p.country || 'India',
        countryCode: p.countryCode || 'in',
        primaryLocation: p.primaryLocation,
        languageCode: p.languageCode || 'en',
        timezone: p.timezone || 'UTC',
        defaultSearchEngine: p.defaultSearchEngine || 'google',
        defaultDevice: p.defaultDevice || 'desktop',
        rankingFrequency: p.rankingFrequency || 'Daily',
        lastRankingCheckAt: parseDate(p.lastRankingCheckAt),
        isArchived: parseBool(p.isArchived),
        deletedAt: parseDate(p.deletedAt),
        deletedBy: p.deletedBy,
        createdBy: p.createdBy,
        userId: adminUser?.id,
      },
      create: {
        id: p.id,
        name: p.name,
        domain: p.domain,
        websiteUrl: p.websiteUrl,
        normalizedUrl: p.normalizedUrl,
        domainType: p.domainType || 'exact_domain',
        projectColor: p.projectColor,
        accessLevel: p.accessLevel || 'OWNER',
        status: p.status || 'Active',
        weeklyReport: parseBool(p.weeklyReport),
        websiteAudit: parseBool(p.websiteAudit),
        backlinkReport: parseBool(p.backlinkReport),
        brandName: p.brandName,
        protocol: p.protocol || 'https://',
        country: p.country || 'India',
        countryCode: p.countryCode || 'in',
        primaryLocation: p.primaryLocation,
        languageCode: p.languageCode || 'en',
        timezone: p.timezone || 'UTC',
        defaultSearchEngine: p.defaultSearchEngine || 'google',
        defaultDevice: p.defaultDevice || 'desktop',
        rankingFrequency: p.rankingFrequency || 'Daily',
        lastRankingCheckAt: parseDate(p.lastRankingCheckAt),
        isArchived: parseBool(p.isArchived),
        deletedAt: parseDate(p.deletedAt),
        deletedBy: p.deletedBy,
        createdBy: p.createdBy,
        userId: adminUser?.id,
        createdAt: parseDate(p.createdAt) || new Date(),
        updatedAt: parseDate(p.updatedAt) || new Date(),
      },
    });
  }
  console.log(`✅ Projects: ${projects.length}`);

  // 4. SearchEngineConfig
  const engines = readAll('SearchEngineConfig');
  for (const e of engines) {
    await prisma.searchEngineConfig.upsert({
      where: { id: e.id },
      update: {
        engine: e.engine,
        country: e.country,
        countryCode: e.countryCode,
        language: e.language,
        languageCode: e.languageCode,
        device: e.device,
        location: e.location,
        isActive: parseBool(e.isActive),
      },
      create: {
        id: e.id,
        projectId: e.projectId,
        engine: e.engine,
        country: e.country,
        countryCode: e.countryCode,
        language: e.language,
        languageCode: e.languageCode,
        device: e.device,
        location: e.location,
        isActive: parseBool(e.isActive),
        createdAt: parseDate(e.createdAt) || new Date(),
        updatedAt: parseDate(e.updatedAt) || new Date(),
      },
    });
  }
  console.log(`✅ Search Engines: ${engines.length}`);

  // 5. Keywords
  const keywords = readAll('Keyword');
  for (const k of keywords) {
    await prisma.keyword.upsert({
      where: { id: k.id },
      update: {
        keywordText: k.keywordText,
        searchEngine: k.searchEngine || 'google',
        countryCode: k.countryCode || 'in',
        language: k.language || 'en',
        device: k.device || 'desktop',
        targetUrl: k.targetUrl,
        searchIntent: k.searchIntent,
        monthlySearchVolume: k.monthlySearchVolume,
        keywordDifficulty: k.keywordDifficulty,
        cpcUsd: k.cpcUsd,
        isActive: parseBool(k.isActive),
        currentPosition: k.currentPosition,
        previousPosition: k.previousPosition,
        positionChange: k.positionChange,
        bestPosition: k.bestPosition,
        worstPosition: k.worstPosition,
        rankedUrl: k.rankedUrl,
        serpFeatures: k.serpFeatures,
        groupId: k.groupId,
        groupName: k.groupName,
        tags: k.tags,
        deletedAt: parseDate(k.deletedAt),
        deletedBy: k.deletedBy,
      },
      create: {
        id: k.id,
        projectId: k.projectId,
        keywordText: k.keywordText,
        searchEngine: k.searchEngine || 'google',
        countryCode: k.countryCode || 'in',
        language: k.language || 'en',
        device: k.device || 'desktop',
        targetUrl: k.targetUrl,
        searchIntent: k.searchIntent,
        monthlySearchVolume: k.monthlySearchVolume,
        keywordDifficulty: k.keywordDifficulty,
        cpcUsd: k.cpcUsd,
        isActive: parseBool(k.isActive),
        currentPosition: k.currentPosition,
        previousPosition: k.previousPosition,
        positionChange: k.positionChange,
        bestPosition: k.bestPosition,
        worstPosition: k.worstPosition,
        rankedUrl: k.rankedUrl,
        serpFeatures: k.serpFeatures,
        groupId: k.groupId,
        groupName: k.groupName,
        tags: k.tags,
        deletedAt: parseDate(k.deletedAt),
        deletedBy: k.deletedBy,
        createdAt: parseDate(k.createdAt) || new Date(),
        updatedAt: parseDate(k.updatedAt) || new Date(),
      },
    });
  }
  console.log(`✅ Keywords: ${keywords.length}`);

  // 6. ProjectCompetitor
  const competitors = readAll('ProjectCompetitor');
  for (const c of competitors) {
    await prisma.projectCompetitor.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        domain: c.domain,
        visibilityScore: c.visibilityScore,
        avgPosition: c.avgPosition,
        commonKeywordsCount: c.commonKeywordsCount,
        totalKeywords: c.totalKeywords,
        organicTraffic: c.organicTraffic,
        notes: c.notes,
        isActive: parseBool(c.isActive),
      },
      create: {
        id: c.id,
        projectId: c.projectId,
        name: c.name,
        domain: c.domain,
        visibilityScore: c.visibilityScore,
        avgPosition: c.avgPosition,
        commonKeywordsCount: c.commonKeywordsCount,
        totalKeywords: c.totalKeywords,
        organicTraffic: c.organicTraffic,
        notes: c.notes,
        isActive: parseBool(c.isActive),
        createdAt: parseDate(c.createdAt) || new Date(),
        updatedAt: parseDate(c.updatedAt) || new Date(),
      },
    });
  }
  console.log(`✅ Competitors: ${competitors.length}`);

  // 7. Bulk RankingHistory with createMany in batches
  const history = readAll('RankingHistory');
  console.log(`Bulk inserting ${history.length} RankingHistory points...`);
  const formattedHistory = history.map((h) => ({
    id: h.id,
    projectId: h.projectId,
    keywordId: h.keywordId,
    searchEngine: h.searchEngine || 'google',
    country: h.country || 'in',
    language: h.language || 'en',
    device: h.device || 'desktop',
    position: h.position,
    previousPosition: h.previousPosition,
    positionChange: h.positionChange || 0,
    searchVolume: h.searchVolume || 0,
    url: h.url,
    serpFeatures: h.serpFeatures,
    checkedAt: parseDate(h.checkedAt) || new Date(),
  }));

  const batchSize = 500;
  for (let i = 0; i < formattedHistory.length; i += batchSize) {
    const batch = formattedHistory.slice(i, i + batchSize);
    await prisma.rankingHistory.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }
  console.log(`✅ Ranking History bulk inserted: ${history.length}`);

  // 8. Bulk CompetitorRanking
  const compRankings = readAll('CompetitorRanking');
  console.log(`Bulk inserting ${compRankings.length} CompetitorRanking points...`);
  const formattedCR = compRankings.map((cr) => ({
    id: cr.id,
    projectId: cr.projectId,
    competitorId: cr.competitorId,
    keywordId: cr.keywordId,
    searchEngine: cr.searchEngine || 'google',
    position: cr.position,
    previousPosition: cr.previousPosition,
    positionChange: cr.positionChange || 0,
    url: cr.url,
    checkedAt: parseDate(cr.checkedAt) || new Date(),
  }));

  for (let i = 0; i < formattedCR.length; i += batchSize) {
    const batch = formattedCR.slice(i, i + batchSize);
    await prisma.competitorRanking.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }
  console.log(`✅ Competitor Rankings bulk inserted: ${compRankings.length}`);

  // 9. Bulk AuditPage
  const auditPages = readAll('AuditPage');
  const formattedAP = auditPages.map((ap) => ({
    id: ap.id,
    projectId: ap.projectId,
    url: ap.url,
    statusCode: ap.statusCode || 200,
    loadTimeMs: ap.loadTimeMs,
    title: ap.title,
    titleLength: ap.titleLength,
    metaDescription: ap.metaDescription,
    descriptionLength: ap.descriptionLength,
    h1Count: ap.h1Count || 0,
    h1Text: ap.h1Text,
    h2Count: ap.h2Count || 0,
    canonicalUrl: ap.canonicalUrl,
    isIndexable: parseBool(ap.isIndexable),
    robotsDirectives: ap.robotsDirectives,
    inSitemap: parseBool(ap.inSitemap),
    depth: ap.depth || 0,
    internalLinksCount: ap.internalLinksCount || 0,
    externalLinksCount: ap.externalLinksCount || 0,
    brokenLinksCount: ap.brokenLinksCount || 0,
    imagesCount: ap.imagesCount || 0,
    imagesMissingAlt: ap.imagesMissingAlt || 0,
    issuesCount: ap.issuesCount || 0,
    crawledAt: parseDate(ap.crawledAt) || new Date(),
  }));
  await prisma.auditPage.createMany({
    data: formattedAP,
    skipDuplicates: true,
  });
  console.log(`✅ Audit Pages bulk inserted: ${auditPages.length}`);

  // 10. Bulk AuditIssue
  const issues = readAll('AuditIssue');
  const formattedIssues = issues.map((is) => ({
    id: is.id,
    projectId: is.projectId,
    ruleId: is.ruleId,
    title: is.title,
    category: is.category,
    severity: is.severity,
    url: is.url,
    description: is.description,
    recommendation: is.recommendation,
    status: is.status || 'Open',
    foundAt: parseDate(is.foundAt) || new Date(),
  }));
  await prisma.auditIssue.createMany({
    data: formattedIssues,
    skipDuplicates: true,
  });
  console.log(`✅ Audit Issues bulk inserted: ${issues.length}`);

  // 11. Bulk AiSearchRecord
  const aiRecords = readAll('AiSearchRecord');
  const formattedAI = aiRecords.map((r) => ({
    id: r.id,
    projectId: r.projectId,
    query: r.query,
    engine: r.engine,
    domain: r.domain,
    mentioned: parseBool(r.mentioned),
    citedUrl: r.citedUrl,
    citationPosition: r.citationPosition,
    mentionStatus: r.mentionStatus || 'Not Mentioned',
    visibilityScore: r.visibilityScore || 0,
    snippet: r.snippet,
    checkedAt: parseDate(r.checkedAt) || new Date(),
  }));
  await prisma.aiSearchRecord.createMany({
    data: formattedAI,
    skipDuplicates: true,
  });
  console.log(`✅ AI Search Records bulk inserted: ${aiRecords.length}`);

  // 12. Locations & Reviews
  const locs = readAll('Location');
  for (const l of locs) {
    await prisma.location.upsert({
      where: { id: l.id },
      update: { name: l.name },
      create: {
        id: l.id,
        projectId: l.projectId,
        name: l.name,
        countryCode: l.countryCode || 'us',
        region: l.region,
        city: l.city,
        postalCode: l.postalCode,
        address: l.address,
        rating: l.rating,
        reviewsCount: l.reviewsCount || 0,
        status: l.status || 'Active',
        createdAt: parseDate(l.createdAt) || new Date(),
        updatedAt: parseDate(l.updatedAt) || new Date(),
      },
    });
  }
  const reviews = readAll('Review');
  const formattedReviews = reviews.map((rv) => ({
    id: rv.id,
    projectId: rv.projectId,
    locationId: rv.locationId,
    source: rv.source || 'Google',
    author: rv.author,
    rating: rv.rating,
    text: rv.text,
    reply: rv.reply,
    status: rv.status || 'Not read',
    createdAt: parseDate(rv.createdAt) || new Date(),
    updatedAt: parseDate(rv.updatedAt) || new Date(),
  }));
  await prisma.review.createMany({
    data: formattedReviews,
    skipDuplicates: true,
  });
  console.log(`✅ Locations (${locs.length}) & Reviews (${reviews.length}) bulk inserted`);

  // 13. Backlinks
  const backlinks = readAll('Backlink');
  const formattedBacklinks = backlinks.map((b) => ({
    id: b.id,
    projectId: b.projectId,
    sourceUrl: b.sourceUrl,
    targetUrl: b.targetUrl,
    anchorText: b.anchorText,
    domainTrust: b.domainTrust || 50,
    pageTrust: b.pageTrust || 50,
    isDoFollow: parseBool(b.isDoFollow),
    isLost: parseBool(b.isLost),
    firstSeenDate: parseDate(b.firstSeenDate) || new Date(),
    lastSeenDate: parseDate(b.lastSeenDate) || new Date(),
    createdAt: parseDate(b.createdAt) || new Date(),
  }));
  await prisma.backlink.createMany({
    data: formattedBacklinks,
    skipDuplicates: true,
  });
  console.log(`✅ Backlinks bulk inserted: ${backlinks.length}`);

  // 14. Tasks & Reports
  const tasks = readAll('Task');
  const formattedTasks = tasks.map((t) => ({
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    description: t.description,
    priority: t.priority || 'Medium',
    status: t.status || 'Todo',
    assignedToName: t.assignedToName,
    createdAt: parseDate(t.createdAt) || new Date(),
    updatedAt: parseDate(t.updatedAt) || new Date(),
  }));
  await prisma.task.createMany({
    data: formattedTasks,
    skipDuplicates: true,
  });

  const reports = readAll('Report');
  const formattedReports = reports.map((rp) => ({
    id: rp.id,
    projectId: rp.projectId,
    name: rp.name,
    type: rp.type || 'Overview',
    format: rp.format || 'PDF',
    status: rp.status || 'Ready',
    createdAt: parseDate(rp.createdAt) || new Date(),
    updatedAt: parseDate(rp.updatedAt) || new Date(),
  }));
  await prisma.report.createMany({
    data: formattedReports,
    skipDuplicates: true,
  });
  console.log(`✅ Tasks (${tasks.length}) & Reports (${reports.length}) bulk inserted`);

  console.log('================================================================');
  console.log(' ALL DATA IS NOW LIVE IN SUPABASE POSTGRESQL!');
  console.log('================================================================');
}

migrate()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
