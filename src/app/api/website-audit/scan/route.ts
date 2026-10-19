import { NextRequest, NextResponse } from 'next/server';
import { crawlAndAuditUrl, isSafeUrl } from '@/services/seo/audit.service';
import { requireToolAccess } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawUrl = body.url || body.domain;

    if (!rawUrl || typeof rawUrl !== 'string') {
      return NextResponse.json({ error: 'Valid website domain or URL is required.' }, { status: 400 });
    }

    const maxPages = Math.min(30, Math.max(3, Number(body.maxPages) || 12));

    // 1. Enforce per-user SEO tool permissions & quota
    const toolAuth = await requireToolAccess(req, 'audits', { checkQuota: true, quotaAmount: maxPages });
    if (toolAuth.error) {
      return NextResponse.json({ error: toolAuth.error }, { status: toolAuth.status });
    }

    const formatted = rawUrl.trim().startsWith('http') ? rawUrl.trim() : `https://${rawUrl.trim()}`;

    if (!isSafeUrl(formatted)) {
      return NextResponse.json(
        { error: 'Crawl target URL is not permitted due to SSRF security policies.' },
        { status: 400 }
      );
    }

    const auditResult = await crawlAndAuditUrl(formatted, {
      maxPages,
      maxDepth: 2,
      timeoutMs: 6000,
    });

    return NextResponse.json({
      success: true,
      domain: formatted,
      result: auditResult,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Website audit scan failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
