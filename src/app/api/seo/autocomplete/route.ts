import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  queries: z.array(z.string().trim().min(1).max(100)).min(1).max(10),
  engine: z.enum(['Google', 'Yahoo', 'Bing']).default('Google'),
  country: z.string().trim().length(2).default('US'),
  language: z.string().trim().min(2).max(5).default('en'),
  depth: z.number().int().min(1).max(3).default(1),
  addQuestions: z.boolean().default(false),
  addAlpha: z.boolean().default(false),
});

const QUESTION_PREFIXES = ['how', 'what', 'why', 'where', 'can', 'is', 'which', 'who'];
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const REQUEST_TIMEOUT_MS = 3000;
const CONCURRENCY = 6;

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KeywordAutocomplete/1.0)', Accept: 'application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Raw suggestions for one seed from the selected engine's public suggest endpoint. */
async function suggest(engine: string, seed: string, country: string, language: string): Promise<string[]> {
  const q = encodeURIComponent(seed);
  if (engine === 'Bing') {
    const data = await fetchJson(`https://api.bing.com/osjson.aspx?query=${q}&market=${language}-${country}`);
    return Array.isArray(data) && Array.isArray(data[1]) ? data[1].map(String) : [];
  }
  if (engine === 'Yahoo') {
    const data = (await fetchJson(
      `https://search.yahoo.com/sugg/gossip/gossip-us-ura/?output=sd1&nresults=10&command=${q}`
    )) as { gossip?: { results?: Array<{ key?: string }> } };
    return (data.gossip?.results || []).map((r) => r.key || '').filter(Boolean);
  }
  const data = await fetchJson(
    `https://suggestqueries.google.com/complete/search?client=firefox&hl=${language}&gl=${country}&q=${q}`
  );
  return Array.isArray(data) && Array.isArray(data[1]) ? data[1].map(String) : [];
}

/**
 * POST /api/seo/autocomplete
 * Real autocomplete suggestions for each query from Google, Yahoo or Bing, optionally expanded
 * with question prefixes and a-z suffixes. Search volume is not part of autocomplete data.
 */
export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || 'Invalid request' },
      { status: 400 }
    );
  }
  const { queries, engine, country, language, depth, addQuestions, addAlpha } = parsed.data;

  const seeds: Array<{ query: string; seed: string }> = [];
  for (const query of queries) {
    seeds.push({ query, seed: query });
    if (addQuestions) for (const p of QUESTION_PREFIXES) seeds.push({ query, seed: `${p} ${query}` });
    // Depth widens the a-z expansion: 1 = a-h, 2 = a-p, 3 = a-z
    if (addAlpha) for (const c of ALPHABET.slice(0, Math.min(26, depth * 9))) seeds.push({ query, seed: `${query} ${c}` });
  }

  const results: Array<{ keyword: string; query: string; seed: string }> = [];
  const seen = new Set<string>();
  let failures = 0;
  for (let i = 0; i < seeds.length; i += CONCURRENCY) {
    const batch = seeds.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(batch.map((s) => suggest(engine, s.seed, country, language)));
    settled.forEach((r, idx) => {
      if (r.status === 'rejected') {
        failures++;
        return;
      }
      for (const kw of r.value) {
        const key = kw.toLowerCase().trim();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        results.push({ keyword: kw.trim(), query: batch[idx].query, seed: batch[idx].seed });
      }
    });
  }

  if (results.length === 0 && failures > 0) {
    return NextResponse.json(
      { success: false, error: `${engine} autocomplete did not respond. Please try again.` },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, engine, seedsQueried: seeds.length, failures, results });
}
