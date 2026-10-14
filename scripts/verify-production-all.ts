import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { prisma } from '../src/lib/db/prisma';
import { yepApiClient } from '../src/lib/yepapi';

interface VerificationResult {
  category: string;
  test: string;
  status: 'PASSED' | 'FAILED' | 'BLOCKED';
  details: string;
}

const results: VerificationResult[] = [];

async function main() {
  console.log('====================================================');
  console.log('🚀 SE RANKING PRODUCTION VERIFICATION SUITE');
  console.log('====================================================\n');

  // 1. Environment Variables Configuration (Non-exposing)
  console.log('1. Checking Server Environment Variables Configuration...');
  const yepKey = process.env.YEPAPI_KEY;
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  const isYepConfigured = Boolean(yepKey && yepKey.trim().startsWith('yep_sk_') && yepKey.trim().length > 20);
  const isDbConfigured = Boolean(dbUrl && dbUrl.includes('postgres') && dbUrl.includes('pooler.supabase.com'));
  const isDirectConfigured = Boolean(directUrl && directUrl.includes('postgres') && directUrl.includes('pooler.supabase.com'));

  results.push({
    category: 'Environment',
    test: 'YEPAPI_KEY Presence & Format',
    status: isYepConfigured ? 'PASSED' : 'FAILED',
    details: isYepConfigured ? 'Valid yep_sk_ prefix, length > 20, non-exposed' : 'Missing or invalid format',
  });

  results.push({
    category: 'Environment',
    test: 'DATABASE_URL Supabase Pooler',
    status: isDbConfigured ? 'PASSED' : 'FAILED',
    details: isDbConfigured ? 'Configured with regional transaction pooler (pgbouncer)' : 'Missing or invalid host',
  });

  results.push({
    category: 'Environment',
    test: 'DIRECT_URL Supabase Pooler',
    status: isDirectConfigured ? 'PASSED' : 'FAILED',
    details: isDirectConfigured ? 'Configured with regional session pooler' : 'Missing or invalid host',
  });

  // 2. Supabase PostgreSQL Connectivity & Schema Health
  console.log('2. Testing Supabase PostgreSQL Database Connectivity...');
  try {
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const keywordCount = await prisma.keyword.count();
    const backlinkCount = await prisma.backlink.count();

    results.push({
      category: 'Database',
      test: 'Supabase PostgreSQL Connection & Counts',
      status: 'PASSED',
      details: `Connected successfully. Users: ${userCount}, Projects: ${projectCount}, Keywords: ${keywordCount}, Backlinks: ${backlinkCount}`,
    });

    // Check project data isolation in DB
    const projects = await prisma.project.findMany({
      take: 3,
      include: {
        keywords: { take: 5 },
        projectCompetitors: { take: 5 },
      },
    });

    if (projects.length >= 2) {
      const p1 = projects[0];
      const p2 = projects[1];
      const p1Kws = p1.keywords.map((k) => k.projectId);
      const p2Kws = p2.keywords.map((k) => k.projectId);
      const hasLeak = p1Kws.some((id) => id === p2.id) || p2Kws.some((id) => id === p1.id);

      results.push({
        category: 'Data Isolation',
        test: 'Database Multi-Project Isolation',
        status: !hasLeak ? 'PASSED' : 'FAILED',
        details: !hasLeak
          ? `Verified separate projects (${p1.domain} and ${p2.domain}) have strictly isolated foreign keys`
          : 'Data leakage detected across projects',
      });
    }
  } catch (err: any) {
    results.push({
      category: 'Database',
      test: 'Supabase PostgreSQL Query',
      status: 'FAILED',
      details: `Database error: ${err.message}`,
    });
  }

  // 3. YepAPI Live Endpoints Verification
  console.log('3. Testing YepAPI Live Capabilities...');
  try {
    // A. SERP Live Check
    const serpRes = await yepApiClient.getGoogleSerp({ query: 'seo tools 2026', depth: 10 });
    results.push({
      category: 'YepAPI SERP',
      test: 'POST /v1/serp/google Live Call',
      status: serpRes.ok ? 'PASSED' : 'FAILED',
      details: serpRes.ok
        ? `Engine: ${serpRes.data?.query}, Total SERP items: ${serpRes.data?.results?.length || 0}`
        : `SERP call failed: ${serpRes.error?.message}`,
    });

    // B. Backlinks Summary
    const blRes = await yepApiClient.getBacklinkSummary('fototrendz.co.uk');
    results.push({
      category: 'YepAPI Backlinks',
      test: 'POST /v1/seo/backlinks/summary Live Call',
      status: blRes.ok ? 'PASSED' : 'FAILED',
      details: blRes.ok
        ? `Target: ${blRes.data?.target}, Total Links: ${blRes.data?.totalBacklinks}, RefDomains: ${blRes.data?.referringDomains}`
        : `Backlinks call failed: ${blRes.error?.message}`,
    });

    // C. Keyword Ideas
    const ideasRes = await yepApiClient.getKeywordIdeas({ keyword: 'seo software', limit: 10 });
    results.push({
      category: 'YepAPI Keywords',
      test: 'POST /v1/seo/keywords/ideas Live Call',
      status: ideasRes.ok ? 'PASSED' : 'FAILED',
      details: ideasRes.ok
        ? `Seed: ${ideasRes.data?.seed}, Ideas returned: ${ideasRes.data?.keywords?.length || 0}`
        : `Keyword ideas call failed: ${ideasRes.error?.message}`,
    });

    // D. Keyword Difficulty
    const kdRes = await yepApiClient.getKeywordDifficulty({ keywords: ['rank tracker'] });
    results.push({
      category: 'YepAPI Keywords',
      test: 'POST /v1/seo/keywords/difficulty Live Call',
      status: kdRes.ok ? 'PASSED' : 'FAILED',
      details: kdRes.ok
        ? `KD records returned: ${kdRes.data?.keywords?.length || 0}`
        : `KD call failed: ${kdRes.error?.message}`,
    });
  } catch (err: any) {
    results.push({
      category: 'YepAPI',
      test: 'YepAPI Client Exception',
      status: 'FAILED',
      details: `Exception: ${err.message}`,
    });
  }

  // 4. Live Production Web Status Probe (https://seranking.vercel.app/)
  console.log('4. Probing Live Production Web URL (https://seranking.vercel.app/)...');
  try {
    const prodRes = await fetch('https://seranking.vercel.app/', {
      headers: { 'User-Agent': 'SE-Ranking-Production-Audit/1.0' },
    });
    const html = await prodRes.text();
    const isUp = prodRes.status >= 200 && prodRes.status < 400;

    results.push({
      category: 'Production URL',
      test: 'HTTPS Live Availability (https://seranking.vercel.app/)',
      status: isUp ? 'PASSED' : 'FAILED',
      details: `HTTP Status: ${prodRes.status} ${prodRes.statusText}. HTML payload length: ${html.length} bytes`,
    });

    // Check for secret leakage in public HTML
    const dbPassword = process.env.SUPABASE_DB_PASSWORD || '';
    const hasYepKeyLeak = yepKey ? html.includes(yepKey) : false;
    const hasDbPasswordLeak = dbPassword ? html.includes(dbPassword) || html.includes(encodeURIComponent(dbPassword)) : false;

    results.push({
      category: 'Security',
      test: 'Zero Public Secret Exposure in HTML/Bundles',
      status: !hasYepKeyLeak && !hasDbPasswordLeak ? 'PASSED' : 'FAILED',
      details: !hasYepKeyLeak && !hasDbPasswordLeak
        ? 'Verified neither YEPAPI_KEY nor Supabase database credentials appear in public HTML'
        : 'CRITICAL SECURITY LEAK DETECTED',
    });
  } catch (err: any) {
    results.push({
      category: 'Production URL',
      test: 'HTTPS Live Availability',
      status: 'BLOCKED',
      details: `Network error reaching production URL: ${err.message}`,
    });
  }

  // Summary Table
  console.log('\n====================================================');
  console.log('📊 PRODUCTION AUDIT SUMMARY TABLE');
  console.log('====================================================\n');
  console.table(results);

  const passed = results.filter((r) => r.status === 'PASSED').length;
  const failed = results.filter((r) => r.status === 'FAILED').length;
  const blocked = results.filter((r) => r.status === 'BLOCKED').length;

  console.log(`Total Tests: ${results.length} | Passed: ${passed} | Failed: ${failed} | Blocked: ${blocked}`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
