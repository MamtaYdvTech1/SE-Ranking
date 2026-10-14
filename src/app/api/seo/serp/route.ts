import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/server/auth';
import { yepApiClient } from '@/lib/yepapi';

const SerpSchema = z.object({
  query: z.string().min(1, 'Query is required').max(200),
  depth: z.number().int().min(10).max(100).optional().default(10),
  location_code: z.number().int().optional(),
  language: z.string().max(10).optional().default('en'),
  device: z.enum(['desktop', 'mobile']).optional().default('desktop'),
  stop_at_domain: z.string().max(255).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getAuthSession(req);
    const isDev = process.env.NODE_ENV !== 'production';
    if (!session?.user && !isDev) {
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

    const parseResult = SerpSchema.safeParse(body);
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

    // 4. Call YepAPI Google SERP
    const serpRes = await yepApiClient.getGoogleSerp({
      query: data.query,
      depth: data.depth,
      location_code: data.location_code,
      language: data.language,
      device: data.device,
      stop_at_domain: data.stop_at_domain,
    });

    if (!serpRes.ok || !serpRes.data) {
      const statusCode = serpRes.error?.statusCode || 502;
      return NextResponse.json(
        {
          success: false,
          error: serpRes.error?.message || 'YepAPI SERP request failed',
          code: serpRes.error?.code,
        },
        { status: statusCode }
      );
    }

    // 5. Return genuine API results
    return NextResponse.json({
      success: true,
      provider: 'YepAPI',
      cached: serpRes.cached ?? false,
      retrievedAt: serpRes.retrievedAt,
      costEstimateUsd: serpRes.costEstimateUsd,
      data: serpRes.data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
