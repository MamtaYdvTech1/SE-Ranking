import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/server/auth';
import { yepApiClient } from '@/lib/yepapi';

const BacklinkRequestSchema = z.object({
  target: z.string().min(2, 'Target domain or URL is required').max(255),
  mode: z.enum(['summary', 'list', 'referring-domains']).optional().default('summary'),
  limit: z.number().int().min(5).max(500).optional().default(50),
  offset: z.number().int().min(0).max(20000).optional().default(0),
  status: z.enum(['live', 'lost', 'all']).optional().default('live'),
  dofollow: z.boolean().optional(),
  broken: z.boolean().optional(),
  sort: z.string().optional(),
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

    const parseResult = BacklinkRequestSchema.safeParse(body);
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

    const { target, mode, limit, offset, status, dofollow, broken, sort } = parseResult.data;

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
    if (mode === 'list') {
      const listRes = await yepApiClient.getBacklinksList({
        target,
        limit,
        offset,
        status,
        dofollow,
        broken,
        sort,
      });

      if (!listRes.ok || !listRes.data) {
        return NextResponse.json(
          {
            success: false,
            error: listRes.error?.message || 'YepAPI backlinks list request failed',
            code: listRes.error?.code,
          },
          { status: listRes.error?.statusCode || 502 }
        );
      }

      return NextResponse.json({
        success: true,
        provider: 'YepAPI',
        mode: 'list',
        cached: listRes.cached ?? false,
        retrievedAt: listRes.retrievedAt,
        costEstimateUsd: listRes.costEstimateUsd,
        data: listRes.data,
      });
    }

    if (mode === 'referring-domains') {
      const refRes = await yepApiClient.getReferringDomains({
        target,
        limit,
        offset,
        status,
        sort,
      });

      if (!refRes.ok || !refRes.data) {
        return NextResponse.json(
          {
            success: false,
            error: refRes.error?.message || 'YepAPI referring domains request failed',
            code: refRes.error?.code,
          },
          { status: refRes.error?.statusCode || 502 }
        );
      }

      return NextResponse.json({
        success: true,
        provider: 'YepAPI',
        mode: 'referring-domains',
        cached: refRes.cached ?? false,
        retrievedAt: refRes.retrievedAt,
        costEstimateUsd: refRes.costEstimateUsd,
        data: refRes.data,
      });
    }

    // Default: summary
    const summaryRes = await yepApiClient.getBacklinkSummary(target);
    if (!summaryRes.ok || !summaryRes.data) {
      return NextResponse.json(
        {
          success: false,
          error: summaryRes.error?.message || 'YepAPI backlink summary request failed',
          code: summaryRes.error?.code,
        },
        { status: summaryRes.error?.statusCode || 502 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: 'YepAPI',
      mode: 'summary',
      cached: summaryRes.cached ?? false,
      retrievedAt: summaryRes.retrievedAt,
      costEstimateUsd: summaryRes.costEstimateUsd,
      data: summaryRes.data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get('target') || searchParams.get('domain') || '';
  const mode = searchParams.get('mode') || 'summary';
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  // Wrap into POST handler logic
  const mockReq = new NextRequest(req.url, {
    method: 'POST',
    headers: req.headers,
    body: JSON.stringify({ target, mode, limit, offset }),
  });

  return POST(mockReq);
}
