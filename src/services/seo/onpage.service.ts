/**
 * Real Production On-Page SEO Checker Service
 * Live HTML extraction, SSRF security validation, keyword density analysis,
 * deterministic scoring algorithm and database persistence.
 */

import { prisma } from '@/lib/db/prisma';

export interface OnPageAnalyzeInput {
  url: string;
  targetKeyword?: string;
  projectId?: string;
}

export interface OnPageIssueItem {
  category: 'Content' | 'Meta' | 'Structure' | 'Links' | 'Performance';
  severity: 'Error' | 'Warning' | 'Notice';
  title: string;
  description: string;
  recommendation: string;
}

export interface OnPageAnalysisResult {
  url: string;
  targetKeyword: string;
  score: number; // 0 - 100
  title: string;
  description: string;
  h1: string;
  h2Count: number;
  wordCount: number;
  keywordDensity: number;
  loadTimeMs: number;
  hasCanonical: boolean;
  canonicalUrl: string;
  internalLinksCount: number;
  externalLinksCount: number;
  imagesTotal: number;
  imagesMissingAlt: number;
  issues: OnPageIssueItem[];
}

/**
 * Validates against SSRF (Server-Side Request Forgery)
 */
function isSafeUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculates a deterministic On-Page SEO score (0 - 100) based on real technical factors
 */
export function calculateOnPageScore(factors: {
  title: string;
  description: string;
  h1: string;
  targetKeyword: string;
  wordCount: number;
  hasCanonical: boolean;
  imagesTotal: number;
  imagesMissingAlt: number;
  keywordInTitle: boolean;
  keywordInH1: boolean;
}): number {
  let score = 0;

  // Title validation (15 pts)
  if (factors.title) {
    if (factors.title.length >= 30 && factors.title.length <= 65) score += 15;
    else if (factors.title.length > 0) score += 8;
  }

  // Meta description validation (15 pts)
  if (factors.description) {
    if (factors.description.length >= 100 && factors.description.length <= 165) score += 15;
    else if (factors.description.length > 0) score += 8;
  }

  // H1 validation (15 pts)
  if (factors.h1 && factors.h1.trim().length > 0) score += 15;

  // Keyword presence (25 pts)
  if (factors.targetKeyword) {
    if (factors.keywordInTitle) score += 15;
    if (factors.keywordInH1) score += 10;
  } else {
    // If no specific keyword is provided, award baseline structural points
    score += 25;
  }

  // Canonical tag (10 pts)
  if (factors.hasCanonical) score += 10;

  // Content depth / word count (10 pts)
  if (factors.wordCount >= 500) score += 10;
  else if (factors.wordCount >= 250) score += 5;

  // Image accessibility (10 pts)
  if (factors.imagesTotal === 0 || factors.imagesMissingAlt === 0) {
    score += 10;
  } else {
    const altRatio = (factors.imagesTotal - factors.imagesMissingAlt) / factors.imagesTotal;
    score += Math.round(altRatio * 10);
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Analyzes a given webpage URL and persists audit results into the database
 */
export async function analyzeOnPageUrl(input: OnPageAnalyzeInput): Promise<OnPageAnalysisResult> {
  const targetUrl = input.url.trim().startsWith('http') ? input.url.trim() : `https://${input.url.trim()}`;

  if (!isSafeUrl(targetUrl)) {
    throw new Error('Invalid or restricted target URL.');
  }

  const startTime = Date.now();
  let html = '';

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': process.env.CRAWLER_USER_AGENT || 'SE-Ranking-SEO-Audit-Bot/1.0',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      throw new Error(`Target page returned HTTP ${res.status}`);
    }

    html = await res.text();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to reach target URL';
    throw new Error(`Unable to fetch ${targetUrl}: ${msg}`);
  }

  const loadTimeMs = Date.now() - startTime;
  const issues: OnPageIssueItem[] = [];

  // Extract Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

  // Extract Meta Description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : '';

  // Extract H1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';

  // Extract H2s
  const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
  const h2Count = h2Matches.length;

  // Extract Canonical
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : '';
  const hasCanonical = Boolean(canonicalUrl);

  // Content word count (strip tags, scripts, styles)
  const cleanBody = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = cleanBody.split(' ').filter(Boolean);
  const wordCount = words.length;

  // Keyword Presence
  const targetKeyword = (input.targetKeyword || '').trim().toLowerCase();
  let keywordDensity = 0;
  let keywordInTitle = false;
  let keywordInH1 = false;

  if (targetKeyword) {
    keywordInTitle = title.toLowerCase().includes(targetKeyword);
    keywordInH1 = h1.toLowerCase().includes(targetKeyword);
    const regex = new RegExp(`\\b${targetKeyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const matches = cleanBody.match(regex) || [];
    keywordDensity = wordCount > 0 ? Number(((matches.length / wordCount) * 100).toFixed(2)) : 0;

    if (!keywordInTitle) {
      issues.push({
        category: 'Meta',
        severity: 'Warning',
        title: 'Target keyword missing from Title tag',
        description: `The page title does not contain the target keyword "${targetKeyword}".`,
        recommendation: `Incorporate "${targetKeyword}" near the beginning of your title tag.`,
      });
    }

    if (!keywordInH1) {
      issues.push({
        category: 'Structure',
        severity: 'Warning',
        title: 'Target keyword missing from H1',
        description: `The main heading (H1) does not include "${targetKeyword}".`,
        recommendation: `Add the exact or partial match keyword into your primary H1 heading.`,
      });
    }
  }

  // Title Issues
  if (!title) {
    issues.push({
      category: 'Meta',
      severity: 'Error',
      title: 'Missing Title Tag',
      description: 'The page lacks a <title> element.',
      recommendation: 'Add a concise, compelling title tag between 30 and 65 characters.',
    });
  } else if (title.length < 30) {
    issues.push({
      category: 'Meta',
      severity: 'Notice',
      title: 'Title Tag is Too Short',
      description: `Current title is ${title.length} characters long.`,
      recommendation: 'Expand your title tag to 30-65 characters to maximize search snippet real estate.',
    });
  } else if (title.length > 65) {
    issues.push({
      category: 'Meta',
      severity: 'Notice',
      title: 'Title Tag is Too Long',
      description: `Current title is ${title.length} characters and may be truncated in search results.`,
      recommendation: 'Shorten your title to 65 characters or fewer.',
    });
  }

  // Meta Description Issues
  if (!description) {
    issues.push({
      category: 'Meta',
      severity: 'Warning',
      title: 'Missing Meta Description',
      description: 'No meta description was detected on this page.',
      recommendation: 'Provide a persuasive meta description between 120 and 160 characters.',
    });
  }

  // H1 Issues
  if (!h1) {
    issues.push({
      category: 'Structure',
      severity: 'Error',
      title: 'Missing H1 Heading',
      description: 'The page has no H1 element.',
      recommendation: 'Add exactly one H1 tag summarizing the core topic of the document.',
    });
  }

  // Canonical Issues
  if (!hasCanonical) {
    issues.push({
      category: 'Meta',
      severity: 'Warning',
      title: 'Missing Canonical Tag',
      description: 'The page does not declare a canonical URL.',
      recommendation: 'Add <link rel="canonical" href="..."> to prevent duplicate content ambiguity.',
    });
  }

  // Images Analysis
  const imgMatches = html.match(/<img[^>]+>/gi) || [];
  const imagesTotal = imgMatches.length;
  let imagesMissingAlt = 0;
  for (const img of imgMatches) {
    if (!/alt=["'][^"']+["']/i.test(img)) {
      imagesMissingAlt++;
    }
  }

  if (imagesMissingAlt > 0) {
    issues.push({
      category: 'Content',
      severity: 'Notice',
      title: 'Images Missing Alt Text',
      description: `${imagesMissingAlt} of ${imagesTotal} images lack descriptive alt attributes.`,
      recommendation: 'Add meaningful alt attributes describing image contents for SEO and screen-reader accessibility.',
    });
  }

  // Links count
  const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["']/gi) || [];
  let internalLinksCount = 0;
  let externalLinksCount = 0;

  try {
    const originHost = new URL(targetUrl).hostname;
    for (const l of linkMatches) {
      const hrefMatch = l.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        const href = hrefMatch[1];
        if (href.startsWith('/') || href.includes(originHost)) {
          internalLinksCount++;
        } else if (href.startsWith('http')) {
          externalLinksCount++;
        }
      }
    }
  } catch {
    // Graceful fallback
  }

  // Calculate deterministic score
  const score = calculateOnPageScore({
    title,
    description,
    h1,
    targetKeyword,
    wordCount,
    hasCanonical,
    imagesTotal,
    imagesMissingAlt,
    keywordInTitle,
    keywordInH1,
  });

  // Persist into database if possible
  const db = prisma as any;
  try {
    if (db.onpagePage?.create) {
      await db.onpagePage.create({
        data: {
          projectId: input.projectId || null,
          url: targetUrl,
          targetKeyword: targetKeyword || null,
          score,
          title: title || null,
          description: description || null,
          h1: h1 || null,
          contentLength: wordCount,
          loadTimeMs,
          issuesCount: issues.length,
          status: 'Completed',
          issues: {
            create: issues.map((iss) => ({
              category: iss.category,
              severity: iss.severity,
              title: iss.title,
              description: iss.description,
              recommendation: iss.recommendation,
            })),
          },
        },
      });
    }
  } catch {
    // If table not yet migrated, still return computed live result
  }

  return {
    url: targetUrl,
    targetKeyword,
    score,
    title,
    description,
    h1,
    h2Count,
    wordCount,
    keywordDensity,
    loadTimeMs,
    hasCanonical,
    canonicalUrl,
    internalLinksCount,
    externalLinksCount,
    imagesTotal,
    imagesMissingAlt,
    issues,
  };
}
