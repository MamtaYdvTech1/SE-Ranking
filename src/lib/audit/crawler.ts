/**
 * Safe, bounded technical SEO website crawler
 */

import { prisma } from '@/lib/db/prisma';

export interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  timeoutMs?: number;
}

export interface CrawlResult {
  pagesCrawled: number;
  issuesFound: number;
  healthScore: number;
  durationMs: number;
}

export async function crawlProjectWebsite(
  projectId: string,
  startUrl: string,
  options?: CrawlOptions
): Promise<CrawlResult> {
  const maxPages = Math.min(30, options?.maxPages || 15);
  const maxDepth = options?.maxDepth || 2;
  const timeoutMs = options?.timeoutMs || 8000;

  const startTime = Date.now();
  const cleanStart = startUrl.startsWith('http') ? startUrl : `https://${startUrl}`;
  const startDomain = new URL(cleanStart).hostname.toLowerCase();

  const queue: Array<{ url: string; depth: number }> = [{ url: cleanStart, depth: 0 }];
  const visited = new Set<string>();
  const titlesSeen = new Map<string, string>(); // title -> firstUrl
  const descriptionsSeen = new Map<string, string>();

  let pagesCrawled = 0;
  let totalIssues = 0;

  // Clear previous crawl pages & issues for fresh audit
  await prisma.auditPage.deleteMany({ where: { projectId } }).catch(() => null);
  await prisma.auditIssue.deleteMany({ where: { projectId } }).catch(() => null);

  while (queue.length > 0 && pagesCrawled < maxPages) {
    const current = queue.shift()!;
    const normUrl = current.url.split('#')[0].replace(/\/$/, '');
    if (visited.has(normUrl)) continue;
    visited.add(normUrl);

    const issuesForPage: Array<{
      ruleId: string;
      title: string;
      category: string;
      severity: string;
      description: string;
      recommendation: string;
    }> = [];

    const pageStart = Date.now();
    let statusCode = 200;
    let html = '';
    let loadTimeMs = 0;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const resp = await fetch(current.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'SE-Ranking-Bot/2.0 (+https://seranking.com/bot.html)',
          Accept: 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
      });
      clearTimeout(timer);

      statusCode = resp.status;
      loadTimeMs = Date.now() - pageStart;

      const contentType = resp.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        continue;
      }

      html = await resp.text();
    } catch {
      statusCode = 504;
      loadTimeMs = Date.now() - pageStart;
      issuesForPage.push({
        ruleId: 'server_timeout',
        title: 'Slow page response / timeout',
        category: 'Performance',
        severity: 'Error',
        description: `Page failed to respond within ${timeoutMs}ms.`,
        recommendation: 'Optimize server response time and verify web server availability.',
      });
    }

    if (statusCode >= 400) {
      issuesForPage.push({
        ruleId: 'http_status_error',
        title: `HTTP ${statusCode} Error`,
        category: 'Crawlability',
        severity: 'Error',
        description: `Page returned an error HTTP status code (${statusCode}).`,
        recommendation: 'Fix broken links or restore missing content to return HTTP 200.',
      });
    }

    // HTML analysis
    let title: string | null = null;
    let metaDescription: string | null = null;
    let h1Text: string | null = null;
    let h1Count = 0;
    let h2Count = 0;
    let canonicalUrl: string | null = null;
    let robotsDirectives: string | null = null;
    let isIndexable = true;
    let internalLinksCount = 0;
    let externalLinksCount = 0;
    let imagesCount = 0;
    let imagesMissingAlt = 0;

    if (html) {
      // 1. Title
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      title = titleMatch ? titleMatch[1].trim() : null;
      if (!title) {
        issuesForPage.push({
          ruleId: 'title_missing',
          title: 'Missing <title> tag',
          category: 'Content',
          severity: 'Error',
          description: 'The page has no title tag, which is essential for search engine rankings.',
          recommendation: 'Add a concise, keyword-rich <title> tag between 30 and 60 characters.',
        });
      } else {
        if (title.length > 65) {
          issuesForPage.push({
            ruleId: 'title_too_long',
            title: 'Title tag exceeds recommended length',
            category: 'Content',
            severity: 'Notice',
            description: `Title tag has ${title.length} characters (recommended: 50-60 characters).`,
            recommendation: 'Shorten the title so it does not get truncated on search engine results.',
          });
        }
        if (titlesSeen.has(title)) {
          issuesForPage.push({
            ruleId: 'title_duplicate',
            title: 'Duplicate title tag',
            category: 'Content',
            severity: 'Warning',
            description: `This page shares the exact same title as ${titlesSeen.get(title)}.`,
            recommendation: 'Provide unique, distinct titles for each URL.',
          });
        } else {
          titlesSeen.set(title, current.url);
        }
      }

      // 2. Meta description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i);
      metaDescription = descMatch ? descMatch[1].trim() : null;
      if (!metaDescription) {
        issuesForPage.push({
          ruleId: 'meta_description_missing',
          title: 'Missing meta description',
          category: 'Content',
          severity: 'Warning',
          description: 'No meta description tag was detected for this page.',
          recommendation: 'Add a compelling meta description between 120 and 160 characters.',
        });
      } else {
        if (descriptionsSeen.has(metaDescription)) {
          issuesForPage.push({
            ruleId: 'meta_description_duplicate',
            title: 'Duplicate meta description',
            category: 'Content',
            severity: 'Warning',
            description: 'This page shares an identical meta description with another page.',
            recommendation: 'Write tailored meta descriptions for key pages.',
          });
        } else {
          descriptionsSeen.set(metaDescription, current.url);
        }
      }

      // 3. H1 & H2 Headings
      const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
      h1Count = h1Matches.length;
      if (h1Count === 0) {
        issuesForPage.push({
          ruleId: 'h1_missing',
          title: 'Missing H1 heading',
          category: 'Content',
          severity: 'Warning',
          description: 'Page does not contain a primary <h1> heading tag.',
          recommendation: 'Include a single <h1> heading representing the page subject.',
        });
      } else if (h1Count > 1) {
        issuesForPage.push({
          ruleId: 'h1_multiple',
          title: 'Multiple H1 headings detected',
          category: 'Content',
          severity: 'Notice',
          description: `Page has ${h1Count} H1 tags. Best practice is to maintain 1 primary H1.`,
          recommendation: 'Consolidate headings so there is only one top-level <h1> per page.',
        });
      }
      h1Text = h1Matches[0] ? h1Matches[0].replace(/<[^>]+>/g, '').trim() : null;

      const h2Matches = html.match(/<h2[^>]*>/gi) || [];
      h2Count = h2Matches.length;

      // 4. Canonical
      const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
      canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : null;
      if (!canonicalUrl) {
        issuesForPage.push({
          ruleId: 'canonical_missing',
          title: 'Missing canonical URL',
          category: 'Crawlability',
          severity: 'Notice',
          description: 'No canonical URL link tag was specified.',
          recommendation: 'Add a self-referencing rel="canonical" tag to prevent duplicate content indexing.',
        });
      }

      // 5. Robots
      const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
      robotsDirectives = robotsMatch ? robotsMatch[1].toLowerCase() : null;
      if (robotsDirectives && robotsDirectives.includes('noindex')) {
        isIndexable = false;
        issuesForPage.push({
          ruleId: 'noindex_detected',
          title: 'Page marked as noindex',
          category: 'Crawlability',
          severity: 'Notice',
          description: 'Meta robots tag contains "noindex". Search engines will omit this page from search results.',
          recommendation: 'Ensure this page is intended to be excluded from Google Search.',
        });
      }

      // 6. Images & Alt attributes
      const imgMatches = html.match(/<img[^>]*>/gi) || [];
      imagesCount = imgMatches.length;
      for (const imgTag of imgMatches) {
        if (!/alt=["'][^"']+["']/i.test(imgTag)) {
          imagesMissingAlt++;
        }
      }
      if (imagesMissingAlt > 0) {
        issuesForPage.push({
          ruleId: 'img_missing_alt',
          title: `${imagesMissingAlt} image(s) missing alt text`,
          category: 'Content',
          severity: 'Warning',
          description: 'Images without descriptive alt attributes hinder accessibility and image SEO.',
          recommendation: 'Add descriptive alt text to all relevant content images.',
        });
      }

      // 7. Internal & External links discovery
      const linkMatches = html.match(/<a[^>]*href=["']([^"']*)["'][^>]*>/gi) || [];
      for (const aTag of linkMatches) {
        const hrefMatch = aTag.match(/href=["']([^"']*)["']/i);
        if (!hrefMatch) continue;
        const rawHref = hrefMatch[1].trim();
        if (
          !rawHref ||
          rawHref.startsWith('#') ||
          rawHref.startsWith('javascript:') ||
          rawHref.startsWith('mailto:') ||
          rawHref.startsWith('tel:')
        ) {
          continue;
        }

        try {
          const resolved = new URL(rawHref, current.url);
          if (resolved.hostname.toLowerCase() === startDomain) {
            internalLinksCount++;
            if (current.depth < maxDepth && !visited.has(resolved.href.split('#')[0].replace(/\/$/, ''))) {
              queue.push({ url: resolved.href, depth: current.depth + 1 });
            }
          } else {
            externalLinksCount++;
          }
        } catch {
          // ignore invalid URLs
        }
      }
    }

    // Save crawled page record
    await prisma.auditPage.create({
      data: {
        projectId,
        url: current.url,
        statusCode,
        loadTimeMs,
        title,
        titleLength: title ? title.length : 0,
        metaDescription,
        descriptionLength: metaDescription ? metaDescription.length : 0,
        h1Count,
        h1Text,
        h2Count,
        canonicalUrl,
        isIndexable,
        robotsDirectives,
        inSitemap: true,
        depth: current.depth,
        internalLinksCount,
        externalLinksCount,
        brokenLinksCount: statusCode >= 400 ? 1 : 0,
        imagesCount,
        imagesMissingAlt,
        issuesCount: issuesForPage.length,
        crawledAt: new Date(),
      },
    });

    // Save issues
    for (const issue of issuesForPage) {
      await prisma.auditIssue.create({
        data: {
          projectId,
          ruleId: issue.ruleId,
          title: issue.title,
          category: issue.category,
          severity: issue.severity,
          url: current.url,
          description: issue.description,
          recommendation: issue.recommendation,
          status: 'Open',
        },
      });
      totalIssues++;
    }

    pagesCrawled++;
  }

  // Calculate real Health Score: 100 minus weighted issues penalty
  const penalty = Math.min(80, totalIssues * 3);
  const healthScore = Math.max(20, 100 - penalty);

  return {
    pagesCrawled,
    issuesFound: totalIssues,
    healthScore,
    durationMs: Date.now() - startTime,
  };
}
