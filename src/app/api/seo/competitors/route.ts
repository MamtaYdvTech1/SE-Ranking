import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/server/auth';
import { yepApiClient } from '@/lib/yepapi';

const CompetitorRequestSchema = z.object({
  domain: z.string().min(2).max(255).optional(),
  domain1: z.string().min(2).max(255).optional(),
  domain2: z.string().min(2).max(255).optional(),
  mode: z.enum(['overview', 'domains', 'gap']).optional().default('domains'),
  intersections: z.boolean().optional().default(true),
  location_code: z.number().int().optional(),
  language: z.string().max(10).optional().default('en'),
  limit: z.number().int().min(5).max(200).optional().default(50),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getAuthSession(req);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    // 2. Validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    const parseResult = CompetitorRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { domain, domain1, domain2, mode, intersections, location_code, language, limit } = parseResult.data;

    // 3. Check YepAPI configuration
    if (!yepApiClient.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'YepAPI is not configured. Please set YEPAPI_KEY in server environment variables.',
        },
        { status: 503 }
      );
    }

    // 4. Dispatch based on mode
    if (mode === 'overview') {
      const targetDomain = domain || domain1;
      if (!targetDomain) {
        return NextResponse.json(
          { success: false, error: 'Domain is required for domain overview' },
          { status: 400 }
        );
      }

      const overviewRes = await yepApiClient.getDomainOverview({
        domain: targetDomain,
        location_code,
        language,
      });

      if (!overviewRes.ok || !overviewRes.data) {
        return NextResponse.json(
          {
            success: false,
            error: overviewRes.error?.message || 'YepAPI domain overview request failed',
            code: overviewRes.error?.code,
          },
          { status: overviewRes.error?.statusCode || 502 }
        );
      }

      return NextResponse.json({
        success: true,
        provider: 'YepAPI',
        mode: 'overview',
        cached: overviewRes.cached ?? false,
        retrievedAt: overviewRes.retrievedAt,
        costEstimateUsd: overviewRes.costEstimateUsd,
        data: overviewRes.data,
      });
    }

    if (mode === 'gap') {
      if (!domain1 || !domain2) {
        return NextResponse.json(
          { success: false, error: 'Both domain1 and domain2 are required for keyword gap analysis' },
          { status: 400 }
        );
      }

      const gapRes = await yepApiClient.getCompetitorKeywords({
        domain1,
        domain2,
        intersections,
        location_code,
        language,
        limit,
      });

      if (!gapRes.ok || !gapRes.data) {
        return NextResponse.json(
          {
            success: false,
            error: gapRes.error?.message || 'YepAPI competitor keyword gap request failed',
            code: gapRes.error?.code,
          },
          { status: gapRes.error?.statusCode || 502 }
        );
      }

      return NextResponse.json({
        success: true,
        provider: 'YepAPI',
        mode: 'gap',
        cached: gapRes.cached ?? false,
        retrievedAt: gapRes.retrievedAt,
        costEstimateUsd: gapRes.costEstimateUsd,
        data: gapRes.data,
      });
    }

    // Default mode: 'domains'
    const targetDomain = domain || domain1;
    if (!targetDomain) {
      return NextResponse.json(
        { success: false, error: 'Domain is required to discover competitors' },
        { status: 400 }
      );
    }

    const compRes = await yepApiClient.getCompetitorDomains({
      domain: targetDomain,
      location_code,
      language,
      limit,
    });

    if (!compRes.ok || !compRes.data) {
      return NextResponse.json(
        {
          success: false,
          error: compRes.error?.message || 'YepAPI competitor domains request failed',
          code: compRes.error?.code,
        },
        { status: compRes.error?.statusCode || 502 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: 'YepAPI',
      mode: 'domains',
      cached: compRes.cached ?? false,
      retrievedAt: compRes.retrievedAt,
      costEstimateUsd: compRes.costEstimateUsd,
      data: compRes.data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain') || searchParams.get('target') || '';
  const domain1 = searchParams.get('domain1') || domain;
  const domain2 = searchParams.get('domain2') || '';
  const mode = searchParams.get('mode') || (domain2 ? 'gap' : 'domains');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const mockReq = new NextRequest(req.url, {
    method: 'POST',
    headers: req.headers,
    body: JSON.stringify({ domain, domain1, domain2, mode, limit }),
  });

  return POST(mockReq);
}
