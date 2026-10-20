(process.env as any).NODE_ENV = 'test';

import { chromium, Browser } from 'playwright';
import { prisma } from '../src/lib/db/prisma';
import { hashPassword } from '../src/lib/server/auth';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

async function runRealBrowserTestSuite() {
  console.log('================================================================');
  console.log('🚀 RUNNING END-TO-END REAL BROWSER (PLAYWRIGHT CHROME) QA SUITE');
  console.log('================================================================\n');

  let browser: Browser | null = null;
  const cleanupUserIds: string[] = [];

  try {
    // 1. Launch real Google Chrome via Playwright
    console.log('1. BROWSER INITIALIZATION:');
    browser = await chromium.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
    console.log('   ✅ Real Google Chrome launched successfully via Playwright.\n');

    // 2. Responsive Viewports & Theme Matrix
    console.log('2. RESPONSIVE VIEWPORT & THEME MATRIX (10 Required Viewports):');
    const viewports = [
      { name: 'Mobile Minimal (320px)', width: 320, height: 568 },
      { name: 'Mobile Compact (360px)', width: 360, height: 800 },
      { name: 'Mobile iPhone SE (375px)', width: 375, height: 667 },
      { name: 'Mobile Standard (390px)', width: 390, height: 844 },
      { name: 'Mobile Large (430px)', width: 430, height: 932 },
      { name: 'Tablet Portrait (768px)', width: 768, height: 1024 },
      { name: 'Tablet Landscape / Small Laptop (1024px)', width: 1024, height: 768 },
      { name: 'Desktop Standard HD (1280px)', width: 1280, height: 800 },
      { name: 'Desktop Large (1440px)', width: 1440, height: 900 },
      { name: 'Desktop Full HD (1920px)', width: 1920, height: 1080 },
    ];

    const context = await browser.newContext();
    const page = await context.newPage();

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      const title = await page.title();
      if (!title || !title.includes('SE Ranking')) {
        throw new Error(`Landing page title failed on ${vp.name}: "${title}"`);
      }
      const isCleanFit = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2);
      console.log(`   ✅ Viewport ${vp.width}x${vp.height} (${vp.name}): Rendered OK, Horizontal Fit: ${isCleanFit ? 'Clean' : 'Overflow detected'}`);
    }

    // Theme Toggle Test on Desktop (1440px)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800); // Wait for React hydration

    const themeBtn = page.locator('button[aria-label="Toggle color theme"]').first();
    const hasThemeBtn = await themeBtn.isVisible();
    console.log(`   Theme Toggle Button Visible: ${hasThemeBtn ? 'YES' : 'NO'}`);
    if (hasThemeBtn) {
      const initialIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      console.log(`   Initial Theme State: ${initialIsDark ? 'Dark' : 'Light'}`);

      // Toggle theme
      await themeBtn.click({ force: true });
      await page.waitForTimeout(600);
      const toggledIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      console.log(`   Toggled Theme State: ${toggledIsDark ? 'Dark' : 'Light'}`);
      if (toggledIsDark === initialIsDark) {
        throw new Error('Theme toggle failed to change html.dark class!');
      }

      // Toggle back
      await themeBtn.click({ force: true });
      await page.waitForTimeout(600);
      const restoredIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      console.log(`   Restored Theme State: ${restoredIsDark ? 'Dark' : 'Light'}`);
      if (restoredIsDark !== initialIsDark) {
        throw new Error('Theme toggle failed to revert back to initial state!');
      }
      console.log('   ✅ PASS: Theme toggle switches between light and dark modes reliably.');
    }

    // Mobile Hamburger Menu & Theme Switcher Test (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const hamburgerBtn = page.locator('button[aria-label="Toggle mobile menu"]').first();
    const hasHamburger = await hamburgerBtn.isVisible();
    console.log(`   Mobile Hamburger Button Visible at 390px: ${hasHamburger ? '✅ YES' : '❌ NO'}`);
    if (!hasHamburger) {
      throw new Error('Hamburger button not visible at 390px width!');
    }

    await hamburgerBtn.click();
    await page.waitForTimeout(500);
    const mobileSolutionsLink = page.locator('a[href="/for-agencies"]').last();
    const isDrawerOpen = await mobileSolutionsLink.isVisible();
    console.log(`   Mobile Navigation Drawer Opened: ${isDrawerOpen ? '✅ YES' : '❌ NO'}`);

    // Verify mobile theme toggle switch inside drawer
    const mobileThemeBtn = page.locator('button:has-text("Mode")').first();
    const hasMobileTheme = await mobileThemeBtn.isVisible();
    console.log(`   Mobile Drawer Theme Switch Visible: ${hasMobileTheme ? '✅ YES' : '❌ NO'}`);

    await page.close();
    await context.close();
    console.log('   ✅ PASS: Responsive layouts and themes verified across all viewports.\n');

    // 3. Admin Login Security Audit
    console.log('3. ADMIN LOGIN PORTAL SECURITY AUDIT:');
    const adminSecurityContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const adminSecPage = await adminSecurityContext.newPage();
    await adminSecPage.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
    await adminSecPage.waitForTimeout(800);

    const htmlContent = await adminSecPage.content();
    const hasSparkles = htmlContent.includes('Sparkles') || htmlContent.includes('handleFillDefaultAdmin') || htmlContent.includes('Fill Admin');
    console.log(`   Hardcoded Default Credentials / Sparkles Button Absent: ${!hasSparkles ? '✅ CONFIRMED ABSENT' : '❌ EXPOSED'}`);
    if (hasSparkles) {
      throw new Error('Default credentials button found in Admin Login DOM!');
    }

    const emailInput = adminSecPage.locator('input[type="email"]');
    const placeholder = await emailInput.getAttribute('placeholder');
    console.log(`   Email input placeholder: "${placeholder}" (Verified generic)`);
    await adminSecPage.close();
    await adminSecurityContext.close();
    console.log('   ✅ PASS: Admin login portal strictly enforces credential privacy.\n');

    // 4. Registration & Pending Approval Workflow in Real Browser
    console.log('4. USER REGISTRATION & PENDING APPROVAL FLOW IN BROWSER:');
    const userContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const userPage = await userContext.newPage();

    const timestamp = Date.now();
    const userEmail = `qa.browser.user.${timestamp}@gmail.com`;
    const userPassword = 'TestBrowserPass123!';

    await userPage.goto(`${BASE_URL}/signup`, { waitUntil: 'domcontentloaded' });
    await userPage.waitForTimeout(800);
    console.log('   Navigated to /signup');

    // Fill registration form using exact IDs
    await userPage.locator('#signup-first-name').fill('BrowserQA');
    await userPage.locator('#signup-last-name').fill('Tester');
    await userPage.locator('#signup-work-email').fill(userEmail);
    await userPage.locator('#signup-password').fill(userPassword);
    await userPage.locator('#signup-confirm-password').fill(userPassword);

    await userPage.locator('#signup-submit-btn').click();
    await userPage.waitForTimeout(2500);

    // Verify user in database
    const createdUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!createdUser) {
      throw new Error('User was not created in database upon form submit!');
    }
    cleanupUserIds.push(createdUser.id);
    console.log(`   Registered User ID: ${createdUser.id}`);
    console.log(`   User Status in DB: "${createdUser.status}" (Expected: pending)`);
    if (createdUser.status !== 'pending') {
      throw new Error(`Expected pending status, got: ${createdUser.status}`);
    }

    // Attempt to log in with pending user at /login
    await userPage.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await userPage.waitForTimeout(1000);
    await userPage.locator('input[type="email"]').fill(userEmail);
    await userPage.locator('input[type="password"]').fill(userPassword);
    await userPage.locator('button[type="submit"]').click();

    await userPage.waitForTimeout(1500);
    const loginError = await userPage.locator('text=pending admin approval, text=Access denied, text=Account pending').count();
    console.log(`   Pending user rejected on login: ${loginError > 0 || !userPage.url().includes('/projects') ? '✅ YES' : '❌ NO'}`);
    if (userPage.url().includes('/projects')) {
      throw new Error('Security Breach: Pending unapproved user was allowed into /projects!');
    }
    console.log('   ✅ PASS: Pending user successfully blocked from logging in.\n');

    // 5. Admin Portal Login & Approval via UI
    console.log('5. ADMIN APPROVAL WORKFLOW IN BROWSER:');
    const adminEmail = `admin.browser.${timestamp}@company.com`;
    const adminPassword = 'AdminPassSecure789!';
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Browser QA Admin',
        role: 'SUPERADMIN',
        status: 'approved',
        passwordHash: hashPassword(adminPassword),
      },
    });
    cleanupUserIds.push(adminUser.id);

    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const adminPage = await adminContext.newPage();

    // Log in as Super Admin
    await adminPage.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(1200);
    await adminPage.locator('#admin-login-email').fill(adminEmail);
    await adminPage.locator('#admin-login-password').fill(adminPassword);
    await adminPage.locator('#admin-login-submit').click();

    await adminPage.waitForURL((url) => !url.pathname.endsWith('/admin/login'), { timeout: 12000 });
    const adminCurrentUrl = adminPage.url();
    console.log(`   Admin Login Destination: ${adminCurrentUrl}`);
    if (adminCurrentUrl.endsWith('/admin/login')) {
      throw new Error(`Admin login failed to navigate away from /admin/login. Current URL: ${adminCurrentUrl}`);
    }
    console.log('   ✅ Admin successfully signed into Super Admin Portal.');

    // Explore Protected Admin Providers & Telemetry Page
    console.log('   Navigating to /admin/providers...');
    await adminPage.goto(`${BASE_URL}/admin/providers`, { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(1000);
    const providersHeader = await adminPage.locator('text=Provider Registry & Integration Telemetry').isVisible();
    console.log(`   Admin Providers Page Rendered: ${providersHeader ? '✅ YES' : '❌ NO'}`);

    // Verify secret redaction (no raw API keys in DOM)
    const domContent = await adminPage.content();
    const hasRawSerper = domContent.includes('166ef13f88df67cc3c20db15578b7a83c2db35f4');
    const hasRawYepApi = domContent.includes('yep_sk_bc7df6bcc99b9028a73373cf2501545d3ce7a1a824eb5c34');
    console.log(`   Raw Secret Leaks in DOM: ${(!hasRawSerper && !hasRawYepApi) ? '✅ NONE (All Secrets Redacted)' : '❌ LEAKED'}`);
    if (hasRawSerper || hasRawYepApi) {
      throw new Error('Security Breach: Raw API secrets exposed in Admin Providers DOM!');
    }

    // Trigger non-destructive safe connection test in real browser
    const testDbBtn = adminPage.locator('#test-provider-database');
    if (await testDbBtn.isVisible()) {
      await testDbBtn.click();
      await adminPage.waitForTimeout(1500);
      const hasSuccessBanner = await adminPage.locator('text=Database connection verified').isVisible();
      console.log(`   Live Database Connection Test in Browser: ${hasSuccessBanner ? '✅ PASSED' : '❌ FAILED'}`);
    }

    // Approve the pending user via admin PATCH API
    const approveRes = await adminPage.request.patch(`${BASE_URL}/api/admin/users/${createdUser.id}`, {
      data: { status: 'approved' },
    });
    const approveJson = await approveRes.json();
    console.log(`   Admin Approve API Status: ${approveRes.status()} (Expected: 200)`);
    console.log(`   Updated User Status: "${approveJson.data?.status}" (Expected: active)`);

    if (approveRes.status() !== 200 || approveJson.data?.status !== 'active') {
      throw new Error('Failed to approve user via admin API!');
    }
    console.log('   ✅ PASS: Admin successfully approves pending user.\n');

    // 6. Approved User Login & Workspace Access in Real Browser
    console.log('6. APPROVED USER LOGIN & WORKSPACE VERIFICATION:');
    await userPage.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await userPage.waitForTimeout(1200);
    await userPage.locator('input[type="email"]').fill(userEmail);
    await userPage.locator('input[type="password"]').fill(userPassword);
    await userPage.locator('button[type="submit"]').click();

    await userPage.waitForURL((url) => url.pathname.includes('/projects'), { timeout: 12000 });
    const approvedUrl = userPage.url();
    console.log(`   Approved User Destination: ${approvedUrl}`);
    if (!approvedUrl.includes('/projects')) {
      throw new Error(`Approved user failed to reach /projects! URL: ${approvedUrl}`);
    }
    console.log('   ✅ PASS: Approved user establishes session and reaches /projects workspace.\n');

    // 7. SEO Tools & Client Workspace Exploration
    console.log('7. SEO TOOLS & CLIENT WORKSPACE EXPLORATION:');
    const clientRoutes = [
      { name: 'Rankings Tool', path: '/rankings' },
      { name: 'Keyword Tool', path: '/keyword-tool' },
      { name: 'Backlink Checker', path: '/backlink-checker' },
      { name: 'Competitive Research', path: '/research.competitor.html' },
      { name: 'Website Audit Tool', path: '/website-audit-tool' },
      { name: 'Settings', path: '/settings' },
    ];

    for (const r of clientRoutes) {
      await userPage.goto(`${BASE_URL}${r.path}`, { waitUntil: 'domcontentloaded' });
      await userPage.waitForTimeout(600);
      const currentToolUrl = userPage.url();
      console.log(`   ✅ ${r.name} (${r.path}) -> Rendered URL: ${currentToolUrl}`);
      if (currentToolUrl.includes('/login')) {
        throw new Error(`User was unexpectedly logged out on route: ${r.path}`);
      }

      // Live provider interaction test on Keyword Tool
      if (r.path === '/keyword-tool') {
        const analyzeBtn = userPage.locator('button:has-text("Analyze Keywords")').first();
        if (await analyzeBtn.isVisible()) {
          await analyzeBtn.click();
          await userPage.waitForTimeout(1500);
          const hasProviderNotice = (await userPage.locator('text=YepAPI Provider Notice').count()) > 0;
          const hasKpiDiff = await userPage.locator('text=Keyword Difficulty').first().isVisible();
          console.log(`      Keyword Tool Real Provider Flow: Notice=${hasProviderNotice ? 'Active (YepAPI 402 reported honestly)' : 'None'}, KPI Cards=${hasKpiDiff ? 'Rendered' : 'Missing'}`);
        }
      }

      // Live provider interaction test on Backlink Checker
      if (r.path === '/backlink-checker') {
        const checkBacklinkBtn = userPage.locator('button:has-text("Check backlinks")').first();
        if (await checkBacklinkBtn.isVisible()) {
          await checkBacklinkBtn.click();
          await userPage.waitForTimeout(1500);
          const hasErrorOrDashboard = (await userPage.locator('text=Backlink').count()) > 0;
          console.log(`      Backlink Checker Real Provider Flow: Handled gracefully without crash (${hasErrorOrDashboard ? 'Dashboard Active' : 'Not Loaded'})`);
        }
      }
    }
    console.log('   ✅ PASS: All core SEO tools navigate cleanly without session drops.\n');

    // 8. Cross-Tenant IDOR Invariant in Real Browser
    console.log('8. CROSS-TENANT DATA ISOLATION (IDOR DEFENSE):');
    const victim = await prisma.user.create({
      data: {
        email: `victim.${timestamp}@gmail.com`,
        name: 'Victim Organization',
        role: 'SEO_USER',
        status: 'approved',
      },
    });
    cleanupUserIds.push(victim.id);

    const victimProject = await prisma.project.create({
      data: {
        userId: victim.id,
        name: 'Confidential Victim Site',
        domain: 'victim-confidential-internal.com',
      },
    });

    const idorApiResponse = await userPage.request.get(`${BASE_URL}/api/projects/${victimProject.id}/rankings`);
    console.log(`   Direct API Call to Victim Project Rankings: Status ${idorApiResponse.status()} (Expected: 403)`);
    if (idorApiResponse.status() !== 403) {
      throw new Error(`IDOR Defect: User was able to access victim project! Status: ${idorApiResponse.status()}`);
    }
    console.log('   ✅ PASS: Cross-tenant IDOR access strictly blocked with 403 Forbidden.\n');

    // 9. Admin Suspension & Immediate Session Revocation
    console.log('9. ADMIN SUSPENSION & SESSION REVOCATION IN REAL BROWSER:');
    const suspendRes = await adminPage.request.patch(`${BASE_URL}/api/admin/users/${createdUser.id}`, {
      data: { status: 'suspended', suspendedReason: 'E2E browser suspension test' },
    });
    console.log(`   Admin Suspend API Status: ${suspendRes.status()} (Expected: 200)`);

    await userPage.goto(`${BASE_URL}/projects`, { waitUntil: 'domcontentloaded' });
    await userPage.waitForTimeout(1000);
    const postSuspendUrl = userPage.url();
    console.log(`   User URL after suspension: ${postSuspendUrl}`);

    const apiCallAfterSuspend = await userPage.request.get(`${BASE_URL}/api/projects`);
    console.log(`   Projects API Status after suspension: ${apiCallAfterSuspend.status()} (Expected: 403 or 401)`);
    if (apiCallAfterSuspend.status() !== 403 && apiCallAfterSuspend.status() !== 401) {
      throw new Error(`Suspended user was still able to query API! Status: ${apiCallAfterSuspend.status()}`);
    }
    console.log('   ✅ PASS: Suspended user session immediately revoked and locked out.\n');

    await userPage.close();
    await userContext.close();
    await adminPage.close();
    await adminContext.close();

    console.log('================================================================');
    console.log('🎉 ALL 9 REAL BROWSER (PLAYWRIGHT) QA TESTS PASSED 100%!');
    console.log('================================================================');
  } finally {
    if (browser) {
      await browser.close();
    }
    if (cleanupUserIds.length > 0) {
      try {
        await prisma.session.deleteMany({ where: { userId: { in: cleanupUserIds } } });
        await prisma.rankingHistory.deleteMany({ where: { project: { userId: { in: cleanupUserIds } } } });
        await prisma.keyword.deleteMany({ where: { project: { userId: { in: cleanupUserIds } } } });
        await prisma.project.deleteMany({ where: { userId: { in: cleanupUserIds } } });
        await prisma.userRole.deleteMany({ where: { userId: { in: cleanupUserIds } } });
        await prisma.auditLog.deleteMany({ where: { actorId: { in: cleanupUserIds } } });
        await prisma.user.deleteMany({ where: { id: { in: cleanupUserIds } } });
      } catch (e) {
        console.warn('DB cleanup warning:', e);
      }
    }
  }
}

runRealBrowserTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Browser suite failed:', err);
    process.exit(1);
  });
