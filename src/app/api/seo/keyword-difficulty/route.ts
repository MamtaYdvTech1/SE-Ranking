import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/server/auth';
import { yepApiClient } from '@/lib/yepapi';

const KeywordDifficultySchema = z.object({
  keywords: z.array(z.string().min(1).max(80)).min(1, 'At least one keyword is required').max(500),
  location: z.string().max(10).optional().default('us'),
  language: z.string().max(10).optional().default('en'),
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

    const parseResult = KeywordDifficultySchema.safeParse(body);
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

    // 4. Call YepAPI Keyword Difficulty
    const kdRes = await yepApiClient.getKeywordDifficulty({
      keywords: data.keywords,
      location: data.location,
      language: data.language,
    });

    if (!kdRes.ok || !kdRes.data) {
      const statusCode = kdRes.error?.statusCode || 502;
      return NextResponse.json(
        {
          success: false,
          error: kdRes.error?.message || 'YepAPI keyword difficulty request failed',
          code: kdRes.error?.code,
        },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      provider: 'YepAPI',
      cached: kdRes.cached ?? false,
      retrievedAt: kdRes.retrievedAt,
      costEstimateUsd: kdRes.costEstimateUsd,
      data: kdRes.data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
