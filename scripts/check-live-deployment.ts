async function main() {
  const res = await fetch('https://seranking.vercel.app/', {
    headers: {
      'Cache-Control': 'no-cache, no-store',
      'Pragma': 'no-cache',
    },
  });

  console.log('HTTP Status:', res.status, res.statusText);
  console.log('\n--- Vercel & HTTP Headers ---');
  for (const [k, v] of res.headers.entries()) {
    if (k.toLowerCase().includes('vercel') || k.toLowerCase().includes('x-') || k === 'age' || k === 'date' || k === 'server' || k === 'etag') {
      console.log(`  ${k}: ${v}`);
    }
  }

  const html = await res.text();
  console.log('\n--- HTML Payload Analysis ---');
  console.log('Payload Length:', html.length, 'bytes');

  const buildIdMatch = html.match(/"buildId":"([^"]+)"/);
  console.log('Build ID:', buildIdMatch ? buildIdMatch[1] : 'Not embedded as JSON');

  const deploymentId = res.headers.get('x-vercel-id');
  console.log('Vercel Edge ID (x-vercel-id):', deploymentId);

  // Check if our newly added API routes exist on production
  console.log('\n--- Checking New API Endpoints On Live Production ---');
  const testEndpoints = [
    '/api/auth/me',
    '/api/projects',
    '/api/seo/serp',
    '/api/seo/backlinks',
    '/api/seo/keyword-ideas',
    '/api/seo/keyword-difficulty',
    '/api/supabase/status',
  ];

  for (const ep of testEndpoints) {
    try {
      const epRes = await fetch(`https://seranking.vercel.app${ep}`, {
        method: ep.startsWith('/api/seo/') ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: ep.startsWith('/api/seo/') ? JSON.stringify({ query: 'test' }) : undefined,
      });
      const data = await epRes.text().catch(() => '');
      let parsed = '';
      try {
        const j = JSON.parse(data);
        parsed = JSON.stringify(j).slice(0, 100);
      } catch {
        parsed = data.slice(0, 100).replace(/\n/g, ' ');
      }
      console.log(`Endpoint ${ep.padEnd(28)} => Status: ${epRes.status} ${epRes.statusText.padEnd(14)} | Body: ${parsed}`);
    } catch (e: any) {
      console.log(`Endpoint ${ep.padEnd(28)} => Network Error: ${e.message}`);
    }
  }
}

main().catch(console.error);
