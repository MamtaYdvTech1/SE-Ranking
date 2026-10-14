import { prisma } from '@/lib/db/prisma';

export interface AuditCrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  timeoutMs?: number;
  userAgent?: string;
}

export const DEFAULT_CRAWLER_USER_AGENT = 'Mozilla/5.0 (compatible; SiteAuditBot/1.0)';

export interface AuditFoundResource {
  url: string;
  type: 'IMG' | 'CSS' | 'JS';
  size: string;
  sourceCount: number;
}

export interface AuditFoundLink {
  url: string;
  status: number; // 0 = not checked (target was not fetched during the crawl)
  type: 'HFLNK' | 'EXT';
  sourceUrl: string;
  anchorText?: string;
}

export interface CoreWebVitalsItem {
  value: string;
  status: 'Good' | 'Needs Improvement' | 'Poor' | 'Not measured';
}

export interface CoreWebVitalsMetric {
  lcp: CoreWebVitalsItem;
  cls: CoreWebVitalsItem;
  fid: CoreWebVitalsItem;
  ttfb: CoreWebVitalsItem;
  tti: CoreWebVitalsItem;
}

export interface IssueCategoryStat {
  id: string;
  name: string;
  errors: number;
  warnings: number;
  notices: number;
  weight: string;
}

export interface AuditIssueDetail {
  id?: string;
  ruleId: string;
  title: string;
  category: string;
  severity: 'Error' | 'Warning' | 'Notice';
  url: string;
  description: string;
  recommendation: string;
  count?: number;
}

export interface AuditCrawledPageDetail {
  id?: string;
  url: string;
  statusCode: number;
  loadTimeMs: number;
  depth: number;
  title: string | null;
  metaDescription?: string | null;
  h1Text?: string | null;
  issuesCount: number;
  internalLinksCount?: number;
  externalLinksCount?: number;
  canonicalUrl?: string | null;
  robotsDirectives?: string | null;
  imagesCount?: number;
  imagesMissingAlt?: number;
  crawledAt?: string;
}

export interface AuditCrawlResult {
  pagesCrawled: number;
  issuesFound: number;
  healthScore: number | null;
  criticalIssues: number;
  warnings: number;
  notices: number;
  durationMs: number;
  pages: AuditCrawledPageDetail[];
  issues: AuditIssueDetail[];
  resources: AuditFoundResource[];
  links: AuditFoundLink[];
  cwvDesktop: CoreWebVitalsMetric;
  cwvMobile: CoreWebVitalsMetric;
  categories: IssueCategoryStat[];
}

/**
 * Validates URLs against Server-Side Request Forgery (SSRF)
 * Refuses loopback, link-local, private IP addresses and unsupported protocols.
 */
export function isSafeUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase().trim();

    // Block localhost and common loopback aliases
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return false;
    }

    // Block IPv4 private ranges & link-local metadata (AWS/GCP/Azure: 169.254.169.254)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Regex);
    if (ipMatch) {
      const [, o1, o2, o3, o4] = ipMatch.map(Number);
      if (o1 === 10) return false; // 10.0.0.0/8
      if (o1 === 172 && o2 >= 16 && o2 <= 31) return false; // 172.16.0.0/12
      if (o1 === 192 && o2 === 168) return false; // 192.168.0.0/16
      if (o1 === 169 && o2 === 254) return false; // 169.254.0.0/16 (Link-local & cloud metadata)
      if (o1 === 127) return false; // 127.0.0.0/8
      if (o1 === 0) return false;
      if (o1 >= 224) return false; // Multicast & broadcast
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Calculates deterministic SEO Health Score based on actual crawl results
 */
export function calculateSeoHealthScore(
  issues: Array<{ severity: string }>,
  pagesCrawled: number,
  passedPages: number
): number | null {
  if (pagesCrawled === 0) {
    return null;
  }

  const criticalCount = issues.filter((i) => i.severity === 'Error').length;
  const warningCount = issues.filter((i) => i.severity === 'Warning').length;
  const noticeCount = issues.filter((i) => i.severity === 'Notice').length;

  // Penalties: Critical (-6), Warning (-2), Notice (-0.5)
  const penalty = criticalCount * 6 + warningCount * 2 + noticeCount * 0.5;

  // Pass bonus: ratio of HTTP 200 pages
  const passBonus = pagesCrawled > 0 ? (passedPages / pagesCrawled) * 5 : 0;

  const rawScore = 100 - penalty + passBonus;
  return Math.max(15, Math.min(100, Math.round(rawScore)));
}

/**
 * Runs a full audit crawl on any URL (with SSRF security guards and comprehensive parsing)
 */
export async function crawlAndAuditUrl(
  startDomain: string,
  options?: AuditCrawlOptions
): Promise<AuditCrawlResult> {
  const maxPages = Math.min(40, Math.max(3, options?.maxPages || 15));
  const maxDepth = options?.maxDepth ?? 2;
  const userAgent = options?.userAgent || DEFAULT_CRAWLER_USER_AGENT;
  const timeoutMs = options?.timeoutMs || 7000;
  const startTime = Date.now();

  const formattedStart = startDomain.startsWith('http') ? startDomain : `https://${startDomain}`;
  if (!isSafeUrl(formattedStart)) {
    throw new Error('Crawl target URL is not permitted due to security policies.');
  }

  const baseHostname = new URL(formattedStart).hostname.toLowerCase();
  const queue: Array<{ url: string; depth: number }> = [{ url: formattedStart, depth: 0 }];
  const visited = new Set<string>();
  const titlesSeen = new Map<string, string>();
  const descriptionsSeen = new Map<string, string>();

  // Resources and links maps
  const resourcesMap = new Map<string, { type: 'IMG' | 'CSS' | 'JS'; size: string; count: number }>();
  const linksList: AuditFoundLink[] = [];
  const crawledPagesList: AuditCrawledPageDetail[] = [];

  let pagesCrawled = 0;
  let passedPages = 0;
  let totalLoadTimeMs = 0;

  const allIssues: AuditIssueDetail[] = [];

  while (queue.length > 0 && pagesCrawled < maxPages) {
    const current = queue.shift()!;
    const cleanUrl = current.url.split('#')[0].replace(/\/$/, '');
    if (visited.has(cleanUrl)) continue;
    visited.add(cleanUrl);

    if (!isSafeUrl(cleanUrl)) continue;

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
          'User-Agent': userAgent,
          Accept: 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
      });
      clearTimeout(timer);

      statusCode = resp.status;
      loadTimeMs = Date.now() - pageStart;

      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        html = await resp.text();
      }
    } catch {
      statusCode = 504;
      loadTimeMs = Date.now() - pageStart;
      allIssues.push({
        ruleId: 'server_timeout',
        title: 'Slow page response / timeout',
        category: 'Performance',
        severity: 'Error',
        url: current.url,
        description: `Page failed to respond within ${timeoutMs}ms.`,
        recommendation: 'Optimize server response time and verify web server availability.',
      });
    }

    totalLoadTimeMs += loadTimeMs;

    if (statusCode === 200) {
      passedPages++;
    } else if (statusCode >= 300 && statusCode < 400) {
      allIssues.push({
        ruleId: '3xx_redirect',
        title: '3XX HTTP status code redirect',
        category: 'Redirects',
        severity: 'Warning',
        url: current.url,
        description: `Page returned HTTP ${statusCode} redirect instead of final destination.`,
        recommendation: 'Update internal links to target final destinations directly.',
      });
    } else if (statusCode >= 400) {
      allIssues.push({
        ruleId: 'http_status_error',
        title: `HTTP ${statusCode} Error`,
        category: 'Crawlability',
        severity: 'Error',
        url: current.url,
        description: `Page returned an error HTTP status code (${statusCode}).`,
        recommendation: 'Fix broken links or restore missing content to return HTTP 200.',
      });
    }

    // HTML Factor & Resource Extraction
    let title: string | null = null;
    let metaDescription: string | null = null;
    let h1Text: string | null = null;
    let h1Count = 0;
    let canonicalUrl: string | null = null;
    let robotsDirectives: string | null = null;
    let internalLinksCount = 0;
    let externalLinksCount = 0;
    let imagesMissingAlt = 0;

    if (html) {
      // 1. Title Analysis
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      title = titleMatch ? titleMatch[1].trim() : null;
      if (!title) {
        allIssues.push({
          ruleId: 'title_missing',
          title: 'Missing <title> tag',
          category: 'Meta Tags',
          severity: 'Error',
          url: current.url,
          description: 'The page has no title tag, which is critical for search engine indexing.',
          recommendation: 'Add a concise, keyword-rich <title> tag between 30 and 60 characters.',
        });
      } else {
        if (title.length < 30) {
          allIssues.push({
            ruleId: 'title_too_short',
            title: 'Title tag too short',
            category: 'Meta Tags',
            severity: 'Warning',
            url: current.url,
            description: `Title tag has ${title.length} characters (recommended: 30-60 characters).`,
            recommendation: 'Expand title with targeted primary keywords and brand descriptors.',
          });
        } else if (title.length > 65) {
          allIssues.push({
            ruleId: 'title_too_long',
            title: 'Title tag exceeds recommended length',
            category: 'Meta Tags',
            severity: 'Notice',
            url: current.url,
            description: `Title tag has ${title.length} characters (recommended: 50-60 characters).`,
            recommendation: 'Shorten the title so it does not get truncated on search engine results.',
          });
        }
        if (titlesSeen.has(title)) {
          allIssues.push({
            ruleId: 'title_duplicate',
            title: 'Duplicate title tag',
            category: 'Meta Tags',
            severity: 'Warning',
            url: current.url,
            description: `This page shares the exact same title as ${titlesSeen.get(title)}.`,
            recommendation: 'Provide unique, distinct titles for each URL.',
          });
        } else {
          titlesSeen.set(title, current.url);
        }
      }

      // 2. Meta Description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i);
      metaDescription = descMatch ? descMatch[1].trim() : null;
      if (!metaDescription) {
        allIssues.push({
          ruleId: 'meta_description_missing',
          title: 'Missing meta description',
          category: 'Meta Tags',
          severity: 'Warning',
          url: current.url,
          description: 'No meta description tag was detected for this page.',
          recommendation: 'Add a compelling meta description between 120 and 160 characters.',
        });
      } else {
        if (descriptionsSeen.has(metaDescription)) {
          allIssues.push({
            ruleId: 'meta_description_duplicate',
            title: 'Duplicate meta description',
            category: 'Meta Tags',
            severity: 'Warning',
            url: current.url,
            description: 'This page shares an identical meta description with another page.',
            recommendation: 'Write tailored meta descriptions for key pages.',
          });
        } else {
          descriptionsSeen.set(metaDescription, current.url);
        }
      }

      // 3. Headings Analysis
      const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
      h1Count = h1Matches.length;
      if (h1Count === 0) {
        allIssues.push({
          ruleId: 'h1_missing',
          title: 'Missing <h1> heading',
          category: 'Content',
          severity: 'Warning',
          url: current.url,
          description: 'Page does not contain a primary <h1> heading tag.',
          recommendation: 'Include a single <h1> heading representing the page subject.',
        });
      } else if (h1Count > 1) {
        allIssues.push({
          ruleId: 'h1_multiple',
          title: 'Multiple <h1> headings detected',
          category: 'Content',
          severity: 'Notice',
          url: current.url,
          description: `Page has ${h1Count} H1 tags. Best practice is to maintain 1 primary H1.`,
          recommendation: 'Consolidate headings so there is only one top-level <h1> per page.',
        });
      }
      h1Text = h1Matches[0] ? h1Matches[0].replace(/<[^>]+>/g, '').trim() : null;

      // 4. Canonical & Robots
      const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
      canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : null;
      if (!canonicalUrl) {
        allIssues.push({
          ruleId: 'canonical_missing',
          title: 'Missing canonical URL',
          category: 'Crawlability',
          severity: 'Notice',
          url: current.url,
          description: 'No canonical URL link tag was specified.',
          recommendation: 'Add a self-referencing rel="canonical" tag to prevent duplicate content indexing.',
        });
      }

      const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
      robotsDirectives = robotsMatch ? robotsMatch[1].toLowerCase() : null;
      if (robotsDirectives && robotsDirectives.includes('noindex')) {
        allIssues.push({
          ruleId: 'noindex_detected',
          title: 'Page marked as noindex',
          category: 'Crawlability',
          severity: 'Notice',
          url: current.url,
          description: 'Meta robots tag contains "noindex". Search engines will omit this page from index.',
          recommendation: 'Ensure this page is intended to be excluded from Google Search.',
        });
      }

      // 5. Mobile & Viewport
      const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["'][^>]*>/i);
      if (!viewportMatch) {
        allIssues.push({
          ruleId: 'viewport_missing',
          title: 'Viewport meta tag missing',
          category: 'Mobile Optimization',
          severity: 'Error',
          url: current.url,
          description: 'No viewport meta tag was detected, impairing mobile usability.',
          recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
        });
      }

      // 6. Localization
      const langMatch = html.match(/<html[^>]*lang=["']([^"']*)["'][^>]*>/i);
      if (!langMatch) {
        allIssues.push({
          ruleId: 'lang_missing',
          title: 'HTML lang attribute missing',
          category: 'Localization',
          severity: 'Notice',
          url: current.url,
          description: 'The root <html> tag does not specify a language attribute.',
          recommendation: 'Specify a lang code e.g. <html lang="en">.',
        });
      }

      // 7. Found Resources Extraction (CSS, JS, IMG)
      const cssMatches = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi) || [];
      for (const tag of cssMatches) {
        const m = tag.match(/href=["']([^"']+)["']/i);
        if (m) {
          try {
            const resUrl = new URL(m[1], current.url).href;
            const existing = resourcesMap.get(resUrl);
            resourcesMap.set(resUrl, {
              type: 'CSS',
              size: '—',
              count: (existing?.count || 0) + 1,
            });
          } catch {}
        }
      }

      const jsMatches = html.match(/<script[^>]*src=["']([^"']+)["']/gi) || [];
      for (const tag of jsMatches) {
        const m = tag.match(/src=["']([^"']+)["']/i);
        if (m) {
          try {
            const resUrl = new URL(m[1], current.url).href;
            const existing = resourcesMap.get(resUrl);
            resourcesMap.set(resUrl, {
              type: 'JS',
              size: '—',
              count: (existing?.count || 0) + 1,
            });
          } catch {}
        }
      }

      const imgMatches = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
      for (const tag of imgMatches) {
        const m = tag.match(/src=["']([^"']+)["']/i);
        if (m) {
          try {
            const resUrl = new URL(m[1], current.url).href;
            const existing = resourcesMap.get(resUrl);
            resourcesMap.set(resUrl, {
              type: 'IMG',
              size: '—',
              count: (existing?.count || 0) + 1,
            });
          } catch {}
        }

        if (!/alt=["'][^"']+["']/i.test(tag)) {
          imagesMissingAlt++;
        }
      }

      if (imagesMissingAlt > 0) {
        allIssues.push({
          ruleId: 'img_missing_alt',
          title: `${imagesMissingAlt} image(s) missing alt text`,
          category: 'Content',
          severity: 'Warning',
          url: current.url,
          description: 'Images without descriptive alt attributes hinder accessibility and image SEO.',
          recommendation: 'Add descriptive alt text to all relevant content images.',
        });
      }

      // 8. Found Links Extraction (Internal & External)
      const linkMatches = html.match(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi) || [];
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
          const isInternal = resolved.hostname.toLowerCase() === baseHostname;
          const anchorMatch = aTag.replace(/<[^>]+>/g, '').trim();

          if (isInternal) {
            internalLinksCount++;
            if (current.depth < maxDepth && !visited.has(resolved.href.split('#')[0].replace(/\/$/, ''))) {
              if (isSafeUrl(resolved.href)) {
                queue.push({ url: resolved.href, depth: current.depth + 1 });
              }
            }
          } else {
            externalLinksCount++;
          }

          if (linksList.length < 150) {
            linksList.push({
              url: resolved.href,
              status: 0,
              type: isInternal ? 'HFLNK' : 'EXT',
              sourceUrl: current.url,
              anchorText: anchorMatch || undefined,
            });
          }
        } catch {}
      }
    }

    const currentUrlIssues = allIssues.filter((i) => i.url === current.url).length;

    crawledPagesList.push({
      url: current.url,
      statusCode,
      loadTimeMs,
      depth: current.depth,
      title,
      metaDescription,
      h1Text,
      issuesCount: currentUrlIssues,
      internalLinksCount,
      externalLinksCount,
      canonicalUrl,
      robotsDirectives,
      imagesCount: html ? (html.match(/<img\b/gi) || []).length : 0,
      imagesMissingAlt,
      crawledAt: new Date().toISOString(),
    });

    pagesCrawled++;
  }

  // Links to pages fetched during this crawl get that page's real status
  const statusByUrl = new Map(crawledPagesList.map((p) => [p.url.split('#')[0].replace(/\/$/, ''), p.statusCode]));
  for (const link of linksList) {
    const known = statusByUrl.get(link.url.split('#')[0].replace(/\/$/, ''));
    if (known != null) link.status = known;
  }

  // Only server response time is observable from a plain HTTP crawl; lab vitals need a browser (e.g. PageSpeed)
  const avgLoadTime = pagesCrawled > 0 ? Math.round(totalLoadTimeMs / pagesCrawled) : null;
  const notMeasured: CoreWebVitalsItem = { value: '—', status: 'Not measured' };
  const ttfbItem: CoreWebVitalsItem =
    avgLoadTime == null
      ? notMeasured
      : { value: `${avgLoadTime}ms`, status: avgLoadTime < 800 ? 'Good' : avgLoadTime < 1800 ? 'Needs Improvement' : 'Poor' };

  const cwvDesktop: CoreWebVitalsMetric = {
    lcp: notMeasured,
    cls: notMeasured,
    fid: notMeasured,
    ttfb: ttfbItem,
    tti: notMeasured,
  };
  const cwvMobile: CoreWebVitalsMetric = { ...cwvDesktop };

  // Convert resources map to array
  const resourcesList: AuditFoundResource[] = Array.from(resourcesMap.entries()).map(([url, val]) => ({
    url,
    type: val.type,
    size: val.size,
    sourceCount: val.count,
  }));

  // Synthesize categories statistics
  const categories: IssueCategoryStat[] = [
    {
      id: 'redirects',
      name: 'Redirects',
      errors: allIssues.filter((i) => i.category === 'Redirects' && i.severity === 'Error').length,
      warnings: allIssues.filter((i) => i.category === 'Redirects' && i.severity === 'Warning').length,
      notices: allIssues.filter((i) => i.category === 'Redirects' && i.severity === 'Notice').length,
      weight: '+2 pts',
    },
    {
      id: 'meta_tags',
      name: 'Meta Tags',
      errors: allIssues.filter((i) => i.category === 'Meta Tags' && i.severity === 'Error').length,
      warnings: allIssues.filter((i) => i.category === 'Meta Tags' && i.severity === 'Warning').length,
      notices: allIssues.filter((i) => i.category === 'Meta Tags' && i.severity === 'Notice').length,
      weight: '+7 pts',
    },
    {
      id: 'content',
      name: 'Content',
      errors: allIssues.filter((i) => i.category === 'Content' && i.severity === 'Error').length,
      warnings: allIssues.filter((i) => i.category === 'Content' && i.severity === 'Warning').length,
      notices: allIssues.filter((i) => i.category === 'Content' && i.severity === 'Notice').length,
      weight: '+10 pts',
    },
    {
      id: 'localization',
      name: 'Localization',
      errors: allIssues.filter((i) => i.category === 'Localization' && i.severity === 'Error').length,
      warnings: allIssues.filter((i) => i.category === 'Localization' && i.severity === 'Warning').length,
      notices: allIssues.filter((i) => i.category === 'Localization' && i.severity === 'Notice').length,
      weight: '0 pt',
    },
    {
      id: 'performance',
      name: 'Speed & Performance',
      errors: allIssues.filter((i) => i.category === 'Performance' && i.severity === 'Error').length,
      warnings: allIssues.filter((i) => i.category === 'Performance' && i.severity === 'Warning').length,
      notices: allIssues.filter((i) => i.category === 'Performance' && i.severity === 'Notice').length,
      weight: '+1 pt',
    },
    {
      id: 'links',
      name: 'Links',
      errors: allIssues.filter((i) => (i.category === 'Links' || i.category === 'Crawlability') && i.severity === 'Error').length,
      warnings: allIssues.filter((i) => (i.category === 'Links' || i.category === 'Crawlability') && i.severity === 'Warning').length,
      notices: allIssues.filter((i) => (i.category === 'Links' || i.category === 'Crawlability') && i.severity === 'Notice').length,
      weight: '+7 pts',
    },
    {
      id: 'mobile',
      name: 'Mobile Optimization',
      errors: allIssues.filter((i) => i.category === 'Mobile Optimization' && i.severity === 'Error').length,
      warnings: allIssues.filter((i) => i.category === 'Mobile Optimization' && i.severity === 'Warning').length,
      notices: allIssues.filter((i) => i.category === 'Mobile Optimization' && i.severity === 'Notice').length,
      weight: '+3 pts',
    },
  ];

  const healthScore = calculateSeoHealthScore(allIssues, pagesCrawled, passedPages);

  return {
    pagesCrawled,
    issuesFound: allIssues.length,
    healthScore,
    criticalIssues: allIssues.filter((i) => i.severity === 'Error').length,
    warnings: allIssues.filter((i) => i.severity === 'Warning').length,
    notices: allIssues.filter((i) => i.severity === 'Notice').length,
    durationMs: Date.now() - startTime,
    pages: crawledPagesList,
    issues: allIssues,
    resources: resourcesList,
    links: linksList,
    cwvDesktop,
    cwvMobile,
    categories,
  };
}

/**
 * Executes a real technical SEO audit on the target project domain and stores in DB
 */
export async function crawlAndAuditProject(
  projectId: string,
  startDomain: string,
  options?: AuditCrawlOptions
): Promise<AuditCrawlResult> {
  // Execute crawl
  const crawlResult = await crawlAndAuditUrl(startDomain, options);

  // Reset existing crawl records for fresh audit run in DB
  await prisma.auditPage.deleteMany({ where: { projectId } }).catch(() => null);
  await prisma.auditIssue.deleteMany({ where: { projectId } }).catch(() => null);

  // Persist crawled pages
  for (const page of crawlResult.pages) {
    await prisma.auditPage.create({
      data: {
        projectId,
        url: page.url,
        statusCode: page.statusCode,
        loadTimeMs: page.loadTimeMs,
        title: page.title,
        titleLength: page.title ? page.title.length : 0,
        metaDescription: page.metaDescription,
        descriptionLength: page.metaDescription ? page.metaDescription.length : 0,
        h1Count: page.h1Text ? 1 : 0,
        h1Text: page.h1Text,
        canonicalUrl: page.canonicalUrl ?? null,
        robotsDirectives: page.robotsDirectives ?? null,
        isIndexable: page.statusCode === 200 && !(page.robotsDirectives || '').includes('noindex'),
        depth: page.depth,
        internalLinksCount: page.internalLinksCount || 0,
        externalLinksCount: page.externalLinksCount || 0,
        brokenLinksCount: page.statusCode >= 400 ? 1 : 0,
        imagesCount: page.imagesCount ?? 0,
        imagesMissingAlt: page.imagesMissingAlt ?? 0,
        issuesCount: page.issuesCount,
        crawledAt: new Date(),
      },
    }).catch(() => null);
  }

  // Persist discovered issues
  for (const issue of crawlResult.issues) {
    await prisma.auditIssue.create({
      data: {
        projectId,
        ruleId: issue.ruleId,
        title: issue.title,
        category: issue.category,
        severity: issue.severity,
        url: issue.url,
        description: issue.description,
        recommendation: issue.recommendation,
        status: 'Open',
      },
    }).catch(() => null);
  }

  return crawlResult;
}
