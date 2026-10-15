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

    // 3. Provider determination: YepAPI or Serper
    const providerPref = (process.env.RANKING_PROVIDER || '').toLowerCase().trim();
    const serperKey = process.env.SERPER_API_KEY;
    const hasSerper = Boolean(serperKey && !serperKey.includes('placeholder') && !serperKey.includes('your_'));
    const hasYepApi = yepApiClient.isConfigured();

    if (!hasYepApi && !hasSerper) {
      return NextResponse.json(
        {
          success: false,
          error: 'No SERP provider configured. Please set SERPER_API_KEY or YEPAPI_KEY in server environment variables.',
          code: 'PROVIDER_UNCONFIGURED',
        },
        { status: 503 }
      );
    }

    // Helper to query Serper.dev
    const querySerper = async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: data.query.trim(),
            gl: 'us',
            hl: data.language || 'en',
            num: Math.min(100, Math.max(10, data.depth || 10)),
          }),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          return { ok: false as const, statusCode: res.status, error: `Serper error (${res.status}): ${errText}` };
        }

        const json = await res.json();
        const organic = Array.isArray(json.organic) ? json.organic : [];
        const results = organic.map((item: any, idx: number) => {
          let domain = '';
          try {
            domain = new URL(item.link).hostname.replace(/^www\./, '');
          } catch {
            domain = item.link || '';
          }
          return {
            position: item.position || idx + 1,
            type: 'organic',
            title: item.title || '',
            url: item.link || '',
            description: item.snippet || '',
            domain,
          };
        });

        return {
          ok: true as const,
          data: {
            query: data.query,
            totalResults: organic.length,
            results,
            organic: results,
          },
        };
      } catch (err) {
        clearTimeout(timer);
        return { ok: false as const, statusCode: 504, error: err instanceof Error ? err.message : 'Serper request timed out' };
      }
    };

    // If Serper preferred and available, call Serper directly
    if (providerPref === 'serper' && hasSerper) {
      const serperRes = await querySerper();
      if (serperRes.ok) {
        return NextResponse.json({
          success: true,
          provider: 'Serper.dev',
          cached: false,
          retrievedAt: new Date().toISOString(),
          costEstimateUsd: 0,
          data: serperRes.data,
        });
      }
      if (!hasYepApi) {
        return NextResponse.json(
          { success: false, error: serperRes.error, code: 'SERPER_ERROR' },
          { status: serperRes.statusCode || 502 }
        );
      }
    }

    // Try YepAPI
    if (hasYepApi) {
      const serpRes = await yepApiClient.getGoogleSerp({
        query: data.query,
        depth: data.depth,
        location_code: data.location_code,
        language: data.language,
        device: data.device,
        stop_at_domain: data.stop_at_domain,
      });

      if (serpRes.ok && serpRes.data) {
        return NextResponse.json({
          success: true,
          provider: 'YepAPI',
          cached: serpRes.cached ?? false,
          retrievedAt: serpRes.retrievedAt,
          costEstimateUsd: serpRes.costEstimateUsd,
          data: serpRes.data,
        });
      }

      // If YepAPI failed with NO_CREDITS or 402/502 and Serper is available, fallback to Serper!
      if (hasSerper) {
        const serperRes = await querySerper();
        if (serperRes.ok) {
          return NextResponse.json({
            success: true,
            provider: 'Serper.dev (fallback)',
            cached: false,
            retrievedAt: new Date().toISOString(),
            costEstimateUsd: 0,
            data: serperRes.data,
          });
        }
      }

      const statusCode = serpRes.error?.statusCode || 502;
      const isCreditsExhausted = serpRes.error?.code === 'NO_CREDITS' || statusCode === 402;
      return NextResponse.json(
        {
          success: false,
          error: isCreditsExhausted
            ? 'YepAPI credit balance is exhausted (HTTP 402). Please top up YepAPI credits or configure SERPER_API_KEY.'
            : (serpRes.error?.message || 'YepAPI SERP request failed'),
          code: serpRes.error?.code || (isCreditsExhausted ? 'NO_CREDITS' : 'UPSTREAM_ERROR'),
        },
        { status: statusCode }
      );
    }

    // Fallback to Serper if YepAPI unconfigured
    if (hasSerper) {
      const serperRes = await querySerper();
      if (serperRes.ok) {
        return NextResponse.json({
          success: true,
          provider: 'Serper.dev',
          cached: false,
          retrievedAt: new Date().toISOString(),
          costEstimateUsd: 0,
          data: serperRes.data,
        });
      }
      return NextResponse.json(
        { success: false, error: serperRes.error, code: 'SERPER_ERROR' },
        { status: serperRes.statusCode || 502 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'No SERP provider available.', code: 'UNAVAILABLE' },
      { status: 503 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
