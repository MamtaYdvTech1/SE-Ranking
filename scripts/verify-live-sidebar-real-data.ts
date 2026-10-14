import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const PROD_URL = 'https://seranking.vercel.app';

async function main() {
  console.log(`\n======================================================`);
  console.log(`VERIFYING REAL DYNAMIC DATA ON LIVE PRODUCTION: ${PROD_URL}`);
  console.log(`======================================================\n`);

  // 1. Authenticate with live admin user
  console.log('1. Authenticating on live production...');
  const loginRes = await fetch(`${PROD_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@seranking.com',
      password: process.env.ADMIN_PASSWORD || 'AdminPassword123#',
    }),
  });

  const setCookie = loginRes.headers.get('set-cookie') || '';
  const cookiePart = setCookie.split(';')[0];
  const loginData = await loginRes.json();
  const token = loginData.token || '';

  if (!loginRes.ok) {
    console.error('Failed to obtain auth token. Status:', loginRes.status, loginData);
    process.exit(1);
  }
  console.log('Authentication successful! User ID:', loginData.user?.id);

  const authHeaders = {
    'Cookie': cookiePart,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store',
  };

  // 2. Fetch Projects
  console.log('\n2. Fetching user projects from live production...');
  const projRes = await fetch(`${PROD_URL}/api/projects`, { headers: authHeaders });
  const projData = await projRes.json();
  const projects = projData.projects || [];
  console.log(`Found ${projects.length} project(s):`);
  projects.forEach((p: any) => console.log(`  - [${p.id}] ${p.domain} (${p.name})`));

  if (projects.length === 0) {
    console.error('No projects found!');
    process.exit(1);
  }

  // Find workcomposer.com project
  const workcomposerProject = projects.find((p: any) => p.domain.includes('workcomposer')) || projects[0];
  console.log(`\nSelecting project for deep verification: ${workcomposerProject.domain} (ID: ${workcomposerProject.id})`);

  // 3. Test Backlinks endpoint on live production
  console.log('\n3. Testing Backlinks endpoint on live production...');
  const blRes = await fetch(`${PROD_URL}/api/projects/${encodeURIComponent(workcomposerProject.id)}/backlinks`, {
    headers: authHeaders,
  });
  console.log('Backlinks API HTTP Status:', blRes.status, blRes.statusText);
  if (blRes.ok) {
    const blJson = await blRes.json();
    const d = blJson.data;
    console.log('Backlinks Data Received:');
    console.log('  Domain:', d?.domain);
    console.log('  Total Backlinks:', d?.totalBacklinks);
    console.log('  Referring Domains:', d?.referringDomains);
    console.log('  Domain Trust:', d?.domainTrust);
    console.log('  Page Trust:', d?.pageTrust);
    console.log('  DoFollow Ratio:', d?.dofollowRatio + '%');
    console.log('  Recent Backlinks count:', d?.recentBacklinks?.length);
    console.log('  TimeSeries Points count:', d?.timeSeries?.length);
    console.log('  NewLostDomains count:', d?.newLostDomains?.length);
    console.log('  NewLostBacklinks count:', d?.newLostBacklinks?.length);
    if (d?.timeSeries && d.timeSeries.length > 0) {
      console.log('  First TimeSeries Point:', d.timeSeries[0]);
      console.log('  Latest TimeSeries Point:', d.timeSeries[d.timeSeries.length - 1]);
    }
  } else {
    console.error('Backlinks error:', await blRes.text());
  }

  // 4. Test Competitors endpoint on live production
  console.log('\n4. Testing Competitors endpoint on live production...');
  const compRes = await fetch(`${PROD_URL}/api/projects/${encodeURIComponent(workcomposerProject.id)}/competitors`, {
    headers: authHeaders,
  });
  console.log('Competitors API HTTP Status:', compRes.status, compRes.statusText);
  if (compRes.ok) {
    const compJson = await compRes.json();
    console.log(`Competitors count: ${compJson.data?.length}`);
    if (compJson.data && compJson.data.length > 0) {
      compJson.data.forEach((c: any, i: number) => {
        console.log(`  ${i + 1}. ${c.domain} (${c.name}) - Avg Pos: ${c.avgPosition}, Visibility: ${c.visibilityScore}%, Keywords: ${c.totalKeywords}`);
      });
    }
  } else {
    console.error('Competitors error:', await compRes.text());
  }

  // 5. Test Rankings endpoint on live production
  console.log('\n5. Testing Rankings endpoint on live production...');
  const rankRes = await fetch(`${PROD_URL}/api/projects/${encodeURIComponent(workcomposerProject.id)}/rankings?timeRange=30D`, {
    headers: authHeaders,
  });
  console.log('Rankings API HTTP Status:', rankRes.status, rankRes.statusText);
  if (rankRes.ok) {
    const rankJson = await rankRes.json();
    console.log('Rankings Data Received:');
    console.log('  Total Keywords:', rankJson.summary?.totalKeywords);
    console.log('  Average Position:', rankJson.summary?.averagePosition);
    console.log('  Visibility Score:', rankJson.summary?.visibilityScore);
    console.log('  Estimated Traffic:', rankJson.summary?.estimatedTraffic);
    console.log('  Trend Points count:', rankJson.trend?.length);
    console.log('  Competitors count:', rankJson.competitors?.length);
    console.log('  Keywords in table:', rankJson.keywords?.length);
    if (rankJson.keywords && rankJson.keywords.length > 0) {
      console.log('  Sample keyword:', rankJson.keywords[0].keyword, 'Rank:', rankJson.keywords[0].rank);
    }
  } else {
    console.error('Rankings error:', await rankRes.text());
  }

  console.log('\n======================================================');
  console.log('LIVE PRODUCTION VERIFICATION COMPLETED');
  console.log('======================================================\n');
}

main().catch(console.error);
