import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  
  const btn = page.locator('button[aria-label="Toggle mobile menu"]').first();
  console.log('Count:', await btn.count());
  console.log('IsVisible:', await btn.isVisible());
  console.log('BoundingBox:', await btn.boundingBox());
  
  const allButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      label: b.getAttribute('aria-label') || b.innerText.slice(0, 20),
      className: b.className,
      rect: b.getBoundingClientRect(),
    }));
  });
  console.log('Buttons on 390px page:', allButtons.filter(b => b.rect.width > 0));
  
  await browser.close();
}
run().catch(console.error);
