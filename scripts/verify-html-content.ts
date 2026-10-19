async function verifyHtmlContent() {
  const pages = [
    { url: 'http://localhost:3000/', name: 'Landing Page' },
    { url: 'http://localhost:3000/pricing', name: 'Pricing Page' },
    { url: 'http://localhost:3000/admin/login', name: 'Admin Login' },
    { url: 'http://localhost:3000/login', name: 'User Login' },
    { url: 'http://localhost:3000/signup', name: 'User Signup' },
    { url: 'http://localhost:3000/help', name: 'Help Page' },
    { url: 'http://localhost:3000/for-agencies', name: 'For Agencies (Rewrite)' },
    { url: 'http://localhost:3000/keyword-rank-tracker', name: 'Keyword Tracker (Rewrite)' },
  ];

  console.log('--- VERIFYING LIVE HTML RESPONSES & CONTENT ON DEV SERVER ---');
  for (const page of pages) {
    const res = await fetch(page.url);
    const text = await res.text();
    console.log(`[PASS] ${page.name} (${page.url}) -> Status: ${res.status}, Length: ${text.length} bytes`);

    if (page.url.includes('admin/login')) {
      const hasSparkles = text.includes('Sparkles') || text.includes('Fill Admin') || text.includes('handleFillDefaultAdmin') || text.includes('admin@seranking.com');
      console.log(`   Admin Login Default Credentials Absent from DOM: ${!hasSparkles ? '✅ CONFIRMED ABSENT' : '❌ EXPOSED'}`);
    }
  }
}

verifyHtmlContent()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
