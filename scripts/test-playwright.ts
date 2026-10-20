import { chromium } from 'playwright';

async function main() {
  console.log('Testing Playwright Chrome launch...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  console.log('Browser launched successfully!');
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  const title = await page.title();
  console.log('Page Title:', title);
  await browser.close();
  console.log('Browser closed cleanly.');
}

main().catch((err) => {
  console.error('Playwright launch error:', err);
  process.exit(1);
});
