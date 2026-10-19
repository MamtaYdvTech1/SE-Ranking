import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/server/auth';
import { yepApiClient, mapCountryToLocationCode } from '@/lib/yepapi';

const KeywordsSchema = z.object({
  keywords: z.array(z.string().min(1).max(80)).min(1, 'At least one keyword is required').max(100),
  location_code: z.number().int().optional(),
  country: z.string().optional(),
  country_code: z.string().optional(),
  language: z.string().max(10).optional().default('en'),
  filters: z.array(z.any()).max(8).optional(),
  sort: z.array(z.string()).max(3).optional(),
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

    const parseResult = KeywordsSchema.safeParse(body);
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

    const data = parseResult.data;
    const resolvedLocationCode =
      data.location_code ??
      (data.country || data.country_code
        ? mapCountryToLocationCode(data.country || data.country_code)
        : undefined);

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

    // 4. Call YepAPI Keyword Research
    const kwRes = await yepApiClient.getKeywords({
      keywords: data.keywords,
      location_code: resolvedLocationCode,
      language: data.language,
      filters: data.filters,
      sort: data.sort,
    });

    if (!kwRes.ok || !kwRes.data) {
      const statusCode = kwRes.error?.statusCode || 502;
      const isCredits = kwRes.error?.code === 'NO_CREDITS' || statusCode === 402;
      return NextResponse.json(
        {
          success: false,
          error: isCredits
            ? 'YepAPI search volume provider quota exhausted (HTTP 402). Please top up YepAPI credits to retrieve search volume metrics.'
            : (kwRes.error?.message || 'YepAPI keyword metrics request failed'),
          code: kwRes.error?.code || (isCredits ? 'NO_CREDITS' : 'UPSTREAM_ERROR'),
        },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      provider: 'YepAPI',
      cached: kwRes.cached ?? false,
      retrievedAt: kwRes.retrievedAt,
      costEstimateUsd: kwRes.costEstimateUsd,
      data: kwRes.data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
