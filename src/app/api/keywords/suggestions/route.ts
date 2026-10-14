import { NextRequest, NextResponse } from 'next/server';
import { yepApiClient } from '@/lib/yepapi';

interface SuggestionResult {
  keyword: string;
  volume: number;
  kd?: number;
  cpc?: number;
  intent?: string;
}

const suggestionsCache = new Map<string, { data: SuggestionResult[]; timestamp: number; provider: string }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || searchParams.get('query') || '';
    const country = searchParams.get('country') || 'us';
    const lang = searchParams.get('lang') || 'en';

    if (!domain.trim()) {
      return NextResponse.json({ suggestions: [] });
    }

    const cacheKey = `${domain.toLowerCase().trim()}_${country}_${lang}`;
    const cached = suggestionsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        domain,
        provider: cached.provider,
        providerConfigured: yepApiClient.isConfigured(),
        suggestions: cached.data,
      });
    }

    // Clean brand/keyword from domain
    const clean = domain
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/.*$/, '')
      .trim();

    // 1. If YepAPI is configured, fetch real keyword suggestions with volume, KD, CPC, and intent
    if (yepApiClient.isConfigured()) {
      const ideasRes = await yepApiClient.getKeywordIdeas({
        keyword: clean,
        language: lang,
        limit: 30,
      });

      if (ideasRes.ok && ideasRes.data && ideasRes.data.keywords && ideasRes.data.keywords.length > 0) {
        const results: SuggestionResult[] = ideasRes.data.keywords.map((item) => ({
          keyword: item.keyword,
          volume: item.volume || 0,
          kd: item.difficulty || 0,
          cpc: item.cpc || 0,
          intent: item.intent || 'informational',
        }));

        suggestionsCache.set(cacheKey, { data: results, timestamp: Date.now(), provider: 'yepapi' });
        return NextResponse.json({
          success: true,
          domain: clean,
          provider: 'yepapi',
          providerConfigured: true,
          suggestions: results,
        });
      }
    }

    const parts = clean.split('.');
    const brandName = parts[0] || 'brand';
    const tld = parts.slice(1).join('.');

    const seedQueries = [
      brandName,
      `${brandName} online`,
      `${brandName} app`,
      `${brandName} software`,
      `${brandName} pricing`,
    ];

    // Query live Google suggestion API for keywords
    const suggestionsMap = new Map<string, number>();

    const fetchPromises = seedQueries.slice(0, 3).map(async (query) => {
      try {
        const url = `https://suggestqueries.google.com/complete/search?client=chrome&hl=${encodeURIComponent(
          lang
        )}&gl=${encodeURIComponent(country)}&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(1000),
        });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && Array.isArray(json[1])) {
            const list = json[1] as string[];
            list.forEach((item) => {
              const text = String(item).toLowerCase().trim();
              if (text && !suggestionsMap.has(text)) {
                suggestionsMap.set(text, 0);
              }
            });
          }
        }
      } catch {
        // Fallback gracefully if network restricted
      }
    });

    await Promise.allSettled(fetchPromises);

    const suggestions: SuggestionResult[] = Array.from(suggestionsMap.entries()).map(
      ([keyword, volume]) => ({
        keyword,
        volume,
      })
    );

    // Store in cache
    suggestionsCache.set(cacheKey, { data: suggestions, timestamp: Date.now(), provider: 'google-suggest' });

    return NextResponse.json({
      success: true,
      domain: clean,
      brandName,
      tld,
      provider: 'google-suggest',
      providerConfigured: yepApiClient.isConfigured(),
      suggestions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch suggestions';
    return NextResponse.json({ error: message, suggestions: [] }, { status: 500 });
  }
}
