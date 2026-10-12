/**
 * Production-Grade SEO Data Seeding Engine
 * Generates comprehensive, realistic, domain-tailored SEO datasets across all
 * database models (Keywords, 30-Day Ranking History, Competitor Rankings,
 * Technical Audit Pages, Issues, Backlinks, AI Search Mentions, Local Reviews, Tasks, Reports).
 */

import { prisma } from '@/lib/db/prisma';

export async function seedProjectData(
  projectId: string,
  domain: string,
  brandName?: string,
  userKeywords?: string[]
): Promise<void> {
  const cleanDomain = domain
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '')
    .toLowerCase()
    .trim();

  const brand = brandName || cleanDomain.split('.')[0].toUpperCase();

  // 1. Determine relevant keyword seed list based on domain or user inputs
  const keywordsToSeed: Array<{
    text: string;
    vol: number;
    kd: number;
    cpc: number;
    intent: string;
    rank: number;
    change: number;
  }> = [];

  if (userKeywords && userKeywords.length > 0) {
    userKeywords.forEach((kw, idx) => {
      const trimmed = kw.trim();
      if (!trimmed) return;
      const baseVol = Math.max(150, Math.round(14800 / (idx + 1) + (idx % 3) * 500));
      const rank = idx === 0 ? 2 : idx === 1 ? 3 : idx === 2 ? 8 : idx === 3 ? 12 : Math.min(65, 14 + idx * 4);
      const change = idx === 0 ? 1 : idx === 1 ? 2 : idx === 2 ? -1 : (idx % 2 === 0 ? 3 : -2);
      keywordsToSeed.push({
        text: trimmed,
        vol: baseVol,
        kd: 20 + ((idx * 7) % 45),
        cpc: Number((1.5 + (idx % 5) * 0.85).toFixed(2)),
        intent: idx % 3 === 0 ? 'Commercial' : idx % 3 === 1 ? 'Informational' : 'Transactional',
        rank,
        change,
      });
    });
  }

  // If fewer than 8 keywords, add contextual high-value keywords for the domain
  if (keywordsToSeed.length < 8) {
    const domainPrefix = cleanDomain.split('.')[0];
    const defaultNicheKeywords = [
      { text: `${domainPrefix} official platform`, vol: 18200, kd: 22, cpc: 3.8, intent: 'Navigational', rank: 1, change: 0 },
      { text: `${domainPrefix} login online`, vol: 9400, kd: 18, cpc: 2.1, intent: 'Navigational', rank: 2, change: 1 },
      { text: `${domainPrefix} reviews and ratings`, vol: 6200, kd: 31, cpc: 4.2, intent: 'Commercial', rank: 3, change: 2 },
      { text: `best ${domainPrefix} alternatives 2026`, vol: 5400, kd: 44, cpc: 5.1, intent: 'Commercial', rank: 7, change: 3 },
      { text: `${domainPrefix} pricing and plans`, vol: 4800, kd: 29, cpc: 3.5, intent: 'Commercial', rank: 8, change: -1 },
      { text: `how to use ${domainPrefix} guide`, vol: 3600, kd: 24, cpc: 1.8, intent: 'Informational', rank: 11, change: 4 },
      { text: `top software tools like ${domainPrefix}`, vol: 2900, kd: 39, cpc: 4.6, intent: 'Commercial', rank: 14, change: -2 },
      { text: `${domainPrefix} cloud features`, vol: 2100, kd: 26, cpc: 2.4, intent: 'Informational', rank: 18, change: 1 },
      { text: `free ${domainPrefix} trial setup`, vol: 1800, kd: 21, cpc: 3.2, intent: 'Transactional', rank: 22, change: 5 },
      { text: `${domainPrefix} integrations support`, vol: 1400, kd: 33, cpc: 2.9, intent: 'Informational', rank: 29, change: -3 },
    ];

    for (const kw of defaultNicheKeywords) {
      if (!keywordsToSeed.some((k) => k.text.toLowerCase() === kw.text.toLowerCase())) {
        keywordsToSeed.push(kw);
      }
    }
  }

  // 2. Insert or update Keywords & build 30-day RankingHistory
  const now = new Date();
  for (const kwData of keywordsToSeed) {
    let kwRecord = await prisma.keyword.findFirst({
      where: { projectId, keywordText: kwData.text, deletedAt: null },
    });

    const slug = kwData.text.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
    const rankedUrl = `https://${cleanDomain}/${slug}`;
    const serpFeatures = JSON.stringify(['Featured Snippet', 'People Also Ask', 'SiteLinks', 'Reviews']);

    if (!kwRecord) {
      kwRecord = await prisma.keyword.create({
        data: {
          projectId,
          keywordText: kwData.text,
          searchEngine: 'google',
          countryCode: 'in',
          language: 'en',
          device: 'desktop',
          targetUrl: `https://${cleanDomain}`,
          rankedUrl,
          searchIntent: kwData.intent,
          monthlySearchVolume: kwData.vol,
          keywordDifficulty: kwData.kd,
          cpcUsd: kwData.cpc,
          currentPosition: kwData.rank,
          previousPosition: kwData.rank + kwData.change,
          positionChange: -kwData.change, // positive change means rank improved (e.g. from 5 to 3 is +2 change)
          bestPosition: Math.max(1, kwData.rank - 2),
          worstPosition: kwData.rank + 12,
          serpFeatures,
          groupName: 'General',
          isActive: true,
        },
      });
    } else {
      await prisma.keyword.update({
        where: { id: kwRecord.id },
        data: {
          monthlySearchVolume: kwData.vol,
          keywordDifficulty: kwData.kd,
          cpcUsd: kwData.cpc,
          currentPosition: kwData.rank,
          previousPosition: kwData.rank + kwData.change,
          positionChange: -kwData.change,
          rankedUrl,
          serpFeatures,
        },
      });
    }

    // 30 Days of Historical Daily Ranks for this keyword
    const existingHistoryCount = await prisma.rankingHistory.count({
      where: { keywordId: kwRecord.id },
    });

    if (existingHistoryCount < 10) {
      const historyRows = [];
      const basePos = kwData.rank;
      for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
        const checkDate = new Date(now.getTime() - dayOffset * 86400000);
        // Realistic subtle fluctuation reaching today's rank
        const dayNoise = Math.sin((dayOffset + kwData.vol) * 0.4) * 2;
        const trendShift = (dayOffset / 29) * kwData.change;
        const historicalPos = Math.max(1, Math.min(100, Math.round(basePos + trendShift + dayNoise)));

        historyRows.push({
          projectId,
          keywordId: kwRecord.id,
          searchEngine: 'google',
          country: 'in',
          language: 'en',
          device: 'desktop',
          position: historicalPos,
          previousPosition: historicalPos + 1,
          positionChange: -1,
          searchVolume: kwData.vol,
          url: rankedUrl,
          serpFeatures,
          checkedAt: checkDate,
        });
      }

      await prisma.rankingHistory.createMany({
        data: historyRows,
      });
    }
  }

  // 3. Competitors & Competitor Rankings
  const defaultCompetitors = [
    {
      domain: `competitor-${cleanDomain.split('.')[0]}.com`,
      name: `${brand} Global Rival`,
      visibilityScore: 38.5,
      avgPosition: 12.4,
      commonKeywordsCount: Math.min(keywordsToSeed.length, 12),
      totalKeywords: 3420,
      organicTraffic: '45.2K',
    },
    {
      domain: `lead-${cleanDomain.split('.')[0]}.io`,
      name: `Apex Industry Leader`,
      visibilityScore: 52.1,
      avgPosition: 7.8,
      commonKeywordsCount: Math.min(keywordsToSeed.length, 10),
      totalKeywords: 5890,
      organicTraffic: '82.6K',
    },
    {
      domain: `benchmark-${cleanDomain.split('.')[0]}.org`,
      name: `Benchmark Rival Network`,
      visibilityScore: 24.3,
      avgPosition: 18.6,
      commonKeywordsCount: Math.min(keywordsToSeed.length, 8),
      totalKeywords: 1980,
      organicTraffic: '18.4K',
    },
  ];

  for (const comp of defaultCompetitors) {
    let compRecord = await prisma.projectCompetitor.findFirst({
      where: { projectId, domain: comp.domain, deletedAt: null },
    });

    if (!compRecord) {
      compRecord = await prisma.projectCompetitor.create({
        data: {
          projectId,
          name: comp.name,
          domain: comp.domain,
          visibilityScore: comp.visibilityScore,
          avgPosition: comp.avgPosition,
          commonKeywordsCount: comp.commonKeywordsCount,
          totalKeywords: comp.totalKeywords,
          organicTraffic: comp.organicTraffic,
          isActive: true,
        },
      });

      // Seed competitor rankings for top keywords
      const projectKeywords = await prisma.keyword.findMany({
        where: { projectId, deletedAt: null },
        take: 8,
      });

      const compRankRows = [];
      for (const kw of projectKeywords) {
        for (let dayOffset = 29; dayOffset >= 0; dayOffset -= 5) {
          const checkDate = new Date(now.getTime() - dayOffset * 86400000);
          const compPos = Math.max(1, Math.min(100, Math.round((kw.currentPosition || 10) + (comp.avgPosition < 10 ? -2 : 4) + Math.sin(dayOffset) * 2)));
          compRankRows.push({
            projectId,
            competitorId: compRecord.id,
            keywordId: kw.id,
            searchEngine: 'google',
            position: compPos,
            previousPosition: compPos + 1,
            positionChange: -1,
            url: `https://${comp.domain}/${kw.keywordText.replace(/\s+/g, '-')}`,
            checkedAt: checkDate,
          });
        }
      }

      if (compRankRows.length > 0) {
        await prisma.competitorRanking.createMany({ data: compRankRows });
      }
    }
  }

  // 4. Website Audit Crawled Pages & Issues
  const existingAuditPagesCount = await prisma.auditPage.count({ where: { projectId } });
  if (existingAuditPagesCount < 5) {
    const pagesToSeed = [
      { path: '/', title: `${brand} - Official Website`, statusCode: 200, loadTimeMs: 220, h1Count: 1, h2Count: 6, words: 1450, links: 42, images: 14, inSitemap: true },
      { path: '/features', title: `Platform Features & Capabilities - ${brand}`, statusCode: 200, loadTimeMs: 310, h1Count: 1, h2Count: 8, words: 1120, links: 28, images: 8, inSitemap: true },
      { path: '/pricing', title: `Pricing Plans & Subscriptions - ${brand}`, statusCode: 200, loadTimeMs: 190, h1Count: 1, h2Count: 4, words: 680, links: 18, images: 4, inSitemap: true },
      { path: '/about', title: `About Us & Mission - ${brand}`, statusCode: 200, loadTimeMs: 250, h1Count: 1, h2Count: 3, words: 540, links: 12, images: 6, inSitemap: true },
      { path: '/blog', title: `SEO Insights & Articles - ${brand}`, statusCode: 200, loadTimeMs: 420, h1Count: 1, h2Count: 12, words: 2100, links: 56, images: 18, inSitemap: true },
      { path: '/blog/industry-guide-2026', title: `Complete 2026 Industry Guide - ${brand}`, statusCode: 200, loadTimeMs: 380, h1Count: 1, h2Count: 7, words: 1850, links: 24, images: 9, inSitemap: true },
      { path: '/docs', title: `Developer Documentation & API - ${brand}`, statusCode: 200, loadTimeMs: 170, h1Count: 1, h2Count: 9, words: 1300, links: 34, images: 5, inSitemap: true },
      { path: '/contact', title: `Contact Support & Sales - ${brand}`, statusCode: 200, loadTimeMs: 210, h1Count: 1, h2Count: 2, words: 380, links: 14, images: 2, inSitemap: true },
      { path: '/integrations', title: `Software Integrations & Ecosystem - ${brand}`, statusCode: 200, loadTimeMs: 340, h1Count: 1, h2Count: 5, words: 890, links: 22, images: 12, inSitemap: true },
      { path: '/security', title: `Enterprise Security & Compliance - ${brand}`, statusCode: 200, loadTimeMs: 230, h1Count: 1, h2Count: 4, words: 750, links: 16, images: 3, inSitemap: true },
      { path: '/old-roadmap', title: `Redirected Resource`, statusCode: 301, loadTimeMs: 110, h1Count: 0, h2Count: 0, words: 0, links: 1, images: 0, inSitemap: false },
      { path: '/legacy-download-v1', title: `Not Found 404`, statusCode: 404, loadTimeMs: 140, h1Count: 1, h2Count: 0, words: 45, links: 4, images: 1, inSitemap: false },
    ];

    await prisma.auditPage.createMany({
      data: pagesToSeed.map((p) => ({
        projectId,
        url: `https://${cleanDomain}${p.path}`,
        statusCode: p.statusCode,
        loadTimeMs: p.loadTimeMs,
        title: p.title,
        titleLength: p.title.length,
        metaDescription: `Explore comprehensive insights, features, and tools for ${brand} on ${p.path}.`,
        descriptionLength: 115,
        h1Count: p.h1Count,
        h1Text: p.title,
        h2Count: p.h2Count,
        canonicalUrl: `https://${cleanDomain}${p.path}`,
        isIndexable: p.statusCode === 200,
        inSitemap: p.inSitemap,
        depth: p.path === '/' ? 0 : 1,
        internalLinksCount: p.links,
        externalLinksCount: 3,
        brokenLinksCount: p.statusCode === 404 ? 1 : 0,
        imagesCount: p.images,
        imagesMissingAlt: p.images > 5 ? 2 : 0,
        issuesCount: p.statusCode === 404 ? 2 : p.loadTimeMs > 400 ? 1 : 0,
        crawledAt: now,
      })),
    });

    // Seed Real Categorized Technical Issues
    const issuesToSeed = [
      {
        ruleId: 'SEC_BROKEN_404',
        title: 'Broken link returning 404 HTTP status',
        category: 'Links',
        severity: 'Error',
        url: `https://${cleanDomain}/legacy-download-v1`,
        description: 'Page returns 404 Not Found error to search crawlers and users.',
        recommendation: 'Update all internal links or configure a 301 redirect to the active download page.',
      },
      {
        ruleId: 'IMG_MISSING_ALT',
        title: 'Images without alt descriptive attributes',
        category: 'Content',
        severity: 'Warning',
        url: `https://${cleanDomain}/blog`,
        description: '2 images on this page lack the alt attribute required for accessibility and image search SEO.',
        recommendation: 'Add clear, descriptive alt text to all visual elements.',
      },
      {
        ruleId: 'META_DESC_LENGTH',
        title: 'Meta description exceeds recommended 160 characters',
        category: 'Content',
        severity: 'Notice',
        url: `https://${cleanDomain}/features`,
        description: 'Meta description contains 178 characters and may be truncated in search snippets.',
        recommendation: 'Shorten the meta description to between 120 and 155 characters.',
      },
      {
        ruleId: 'PERF_SLOW_TTFB',
        title: 'Server response time TTFB exceeds 350ms',
        category: 'Performance',
        severity: 'Warning',
        url: `https://${cleanDomain}/blog`,
        description: 'Time to First Byte is 420ms on blog archive due to unoptimized database queries.',
        recommendation: 'Enable edge caching and optimize database indexes.',
      },
      {
        ruleId: 'LINK_REDIRECT_CHAIN',
        title: 'Internal link targets a 301 redirect',
        category: 'Crawlability',
        severity: 'Notice',
        url: `https://${cleanDomain}/old-roadmap`,
        description: 'Internal navigation links still point to /old-roadmap which redirects to /features.',
        recommendation: 'Update internal links directly to /features to save crawl budget.',
      },
      {
        ruleId: 'SEC_HTTPS_CERT',
        title: 'SSL / TLS certificate is valid and modern',
        category: 'Security',
        severity: 'Notice',
        url: `https://${cleanDomain}/`,
        description: 'HTTPS is fully enforced with TLS 1.3 and HSTS headers.',
        recommendation: 'Maintain automatic certificate renewal before expiration.',
      },
    ];

    await prisma.auditIssue.createMany({
      data: issuesToSeed.map((i) => ({
        projectId,
        ruleId: i.ruleId,
        title: i.title,
        category: i.category,
        severity: i.severity,
        url: i.url,
        description: i.description,
        recommendation: i.recommendation,
        status: 'Open',
        foundAt: now,
      })),
    });
  }

  // 5. Backlinks Intelligence
  const existingBacklinksCount = await prisma.backlink.count({ where: { projectId } });
  if (existingBacklinksCount < 10) {
    const authorityDonors = [
      { domain: 'github.com', dt: 96, pt: 88, anchor: `${brand} official repository`, dofollow: true },
      { domain: 'medium.com', dt: 89, pt: 74, anchor: `how we scaled using ${cleanDomain}`, dofollow: true },
      { domain: 'techcrunch.com', dt: 92, pt: 81, anchor: brand, dofollow: true },
      { domain: 'producthunt.com', dt: 91, pt: 79, anchor: `visit ${brand}`, dofollow: true },
      { domain: 'dev.to', dt: 84, pt: 68, anchor: `best architecture tools`, dofollow: true },
      { domain: 'capterra.com', dt: 88, pt: 72, anchor: `${brand} user reviews`, dofollow: true },
      { domain: 'g2.com', dt: 89, pt: 75, anchor: `top verified platform`, dofollow: true },
      { domain: 'reddit.com', dt: 90, pt: 65, anchor: `https://${cleanDomain}`, dofollow: false },
      { domain: 'forbes.com', dt: 94, pt: 84, anchor: `${cleanDomain} innovation`, dofollow: true },
      { domain: 'trustpilot.com', dt: 87, pt: 70, anchor: `${brand} customer feedback`, dofollow: true },
      { domain: 'linkedin.com', dt: 95, pt: 82, anchor: `learn more here`, dofollow: false },
      { domain: 'quora.com', dt: 86, pt: 63, anchor: `recommended platform`, dofollow: false },
      { domain: 'hackernews.com', dt: 85, pt: 69, anchor: `${cleanDomain}`, dofollow: true },
      { domain: 'hubspot.com', dt: 93, pt: 80, anchor: `leading tool for productivity`, dofollow: true },
    ];

    const backlinkRows = authorityDonors.map((d, idx) => ({
      projectId,
      sourceUrl: `https://${d.domain}/articles/showcase-${idx + 1}`,
      targetUrl: `https://${cleanDomain}/${idx % 2 === 0 ? '' : 'features'}`,
      anchorText: d.anchor,
      domainTrust: d.dt,
      pageTrust: d.pt,
      isDoFollow: d.dofollow,
      isLost: idx === 11, // 1 lost link
      firstSeenDate: new Date(now.getTime() - (idx + 1) * 7 * 86400000),
      lastSeenDate: now,
    }));

    await prisma.backlink.createMany({ data: backlinkRows });
  }

  // 6. AI Search & LLM Visibility Records
  const existingAiRecords = await prisma.aiSearchRecord.count({ where: { projectId } });
  if (existingAiRecords < 5) {
    const aiQueries = [
      { q: `What are the top software tools for ${cleanDomain.split('.')[0]}?`, eng: 'chatgpt', mentioned: true, pos: 2, cite: `https://${cleanDomain}/features` },
      { q: `Best enterprise alternatives to ${brand}`, eng: 'google-ai-overview', mentioned: true, pos: 1, cite: `https://${cleanDomain}` },
      { q: `How does ${brand} compare against market competitors?`, eng: 'perplexity', mentioned: true, pos: 3, cite: `https://${cleanDomain}/pricing` },
      { q: `Top verified software platforms in 2026`, eng: 'gemini', mentioned: false, pos: null, cite: null },
      { q: `Recommended tools for team productivity and monitoring`, eng: 'google-ai-mode', mentioned: true, pos: 2, cite: `https://${cleanDomain}/blog` },
      { q: `Features and security review of ${cleanDomain}`, eng: 'chatgpt', mentioned: true, pos: 1, cite: `https://${cleanDomain}/security` },
      { q: `Cost and subscription pricing for ${brand}`, eng: 'google-ai-overview', mentioned: true, pos: 1, cite: `https://${cleanDomain}/pricing` },
    ];

    await prisma.aiSearchRecord.createMany({
      data: aiQueries.map((a) => ({
        projectId,
        query: a.q,
        engine: a.eng,
        domain: cleanDomain,
        mentioned: a.mentioned,
        citedUrl: a.cite,
        citationPosition: a.pos,
        mentionStatus: a.mentioned ? (a.pos === 1 ? 'Top 1 Citation' : 'Mentioned') : 'Not Mentioned',
        visibilityScore: a.mentioned ? 85.0 : 0.0,
        snippet: a.mentioned ? `${brand} (${cleanDomain}) is highlighted as a high-performing choice offering reliable automation and reporting.` : null,
        checkedAt: now,
      })),
    });
  }

  // 7. Local Marketing & Reviews
  const existingLocations = await prisma.location.count({ where: { projectId } });
  if (existingLocations === 0) {
    const location = await prisma.location.create({
      data: {
        projectId,
        name: `${brand} Global HQ`,
        countryCode: 'in',
        city: 'Bengaluru',
        region: 'Karnataka',
        postalCode: '560001',
        address: '100 Feet Road, Indiranagar',
        phone: '+91 80 4123 4567',
        rating: 4.8,
        reviewsCount: 14,
        isGbpConnected: true,
        category: 'Software Company',
        status: 'Active',
      },
    });

    const reviewsToSeed = [
      { author: 'Rahul Sharma', rating: 5, text: `Excellent SEO software and rank tracker. The data accuracy is unmatched!`, reply: 'Thank you Rahul! Glad our data insights are helping you scale.' },
      { author: 'Sarah Jenkins', rating: 5, text: `The site audit and backlink monitoring saved our team countless hours. Very intuitive UI.`, reply: 'We appreciate the kind words Sarah!' },
      { author: 'Amit Patel', rating: 4, text: `Great feature set. Would love to see more YouTube tracking locations, but overall fantastic value.`, reply: 'Thanks Amit, more locations are rolling out this quarter!' },
      { author: 'Elena Rostova', rating: 5, text: `Best all-in-one SEO tool replacement. Clean design and fast crawl times.`, reply: null },
    ];

    await prisma.review.createMany({
      data: reviewsToSeed.map((r, i) => ({
        projectId,
        locationId: location.id,
        author: r.author,
        rating: r.rating,
        text: r.text,
        reply: r.reply,
        status: r.reply ? 'Answered' : 'Read',
        source: 'Google',
        reviewDate: new Date(now.getTime() - (i + 1) * 3 * 86400000),
      })),
    });
  }

  // 8. Tasks (Marketing Plan)
  const existingTasks = await prisma.task.count({ where: { projectId } });
  if (existingTasks === 0) {
    const tasksToSeed = [
      { title: 'Resolve 404 broken link on legacy download URL', desc: 'Implement 301 redirect to active download page.', priority: 'High', status: 'InProgress' },
      { title: 'Add missing image ALT tags on blog archive', desc: 'Ensure accessibility and Google Image search indexing.', priority: 'Medium', status: 'Todo' },
      { title: 'Shorten meta description on /features page', desc: 'Trim to under 155 characters to avoid snippet truncation.', priority: 'Low', status: 'Todo' },
      { title: 'Reach out to high-authority donors for backlink acquisition', desc: 'Pitch guest guides to ProductHunt and Dev.to contributors.', priority: 'High', status: 'Todo' },
      { title: 'Publish in-depth comparison post vs top competitor', desc: 'Target commercial keyword "alternatives to competitor".', priority: 'Medium', status: 'Done' },
    ];

    await prisma.task.createMany({
      data: tasksToSeed.map((t) => ({
        projectId,
        title: t.title,
        description: t.desc,
        priority: t.priority,
        status: t.status,
      })),
    });
  }

  // 9. Reports
  const existingReports = await prisma.report.count({ where: { projectId } });
  if (existingReports === 0) {
    await prisma.report.createMany({
      data: [
        { projectId, name: `${brand} - Monthly Executive SEO Summary`, type: 'Overview', schedule: 'Monthly', format: 'PDF', status: 'Ready' },
        { projectId, name: `${brand} - Weekly Keyword Positions Digest`, type: 'Rankings', schedule: 'Weekly', format: 'PDF', status: 'Ready' },
        { projectId, name: `${brand} - Full Technical Site Audit Health Report`, type: 'Audit', format: 'CSV', status: 'Ready' },
      ],
    });
  }

  // 10. Update Project Metadata
  await prisma.project.update({
    where: { id: projectId },
    data: {
      lastRankingCheckAt: now,
      status: 'Active',
    },
  });
}
