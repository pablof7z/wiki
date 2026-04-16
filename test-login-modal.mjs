import { chromium } from '/Users/customer/Work/Wikifreedia-56xgs8/node_modules/playwright/index.mjs';
import { mkdirSync } from 'fs';

const screenshotDir = '/tmp/login-modal-screenshots';
mkdirSync(screenshotDir, { recursive: true });

const viewports = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

const browser = await chromium.launch({ headless: true });
const results = [];

for (const vp of viewports) {
  console.log(`\n=== Testing ${vp.name} (${vp.width}x${vp.height}) ===`);
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
  });
  const page = await context.newPage();

  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  await page.goto('http://localhost:5174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: `${screenshotDir}/${vp.name}-01-homepage.png`, fullPage: false });
  console.log(`Screenshot: ${vp.name}-01-homepage.png`);

  // List all buttons
  const buttons = await page.$$eval('button', btns => btns.map(b => b.textContent?.trim()).filter(Boolean));
  console.log(`Buttons found: ${JSON.stringify(buttons)}`);

  // Try login triggers
  const loginSelectors = [
    'button:has-text("Login")',
    'button:has-text("Sign in")',
    'button:has-text("Log in")',
    'button:has-text("Connect")',
    'a:has-text("Login")',
    'a:has-text("Sign in")',
    '[data-testid="login"]',
    'button:has-text("Get started")',
    'button:has-text("Join")',
  ];

  let loginClicked = false;
  let clickedSelector = '';
  for (const sel of loginSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.click();
        loginClicked = true;
        clickedSelector = sel;
        console.log(`✓ Clicked login with selector: ${sel}`);
        break;
      }
    } catch (e) {}
  }

  if (!loginClicked) {
    console.log('✗ No login button found with standard selectors');
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screenshotDir}/${vp.name}-02-modal.png`, fullPage: false });
  console.log(`Screenshot: ${vp.name}-02-modal.png`);

  // Check for backdrop
  const backdropEl = await page.$('div.fixed.inset-0');
  let backdropBox = null;
  let backdropCoversViewport = false;
  if (backdropEl) {
    backdropBox = await backdropEl.boundingBox();
    backdropCoversViewport = backdropBox
      && backdropBox.x <= 1
      && backdropBox.y <= 1
      && Math.abs(backdropBox.width - vp.width) < 2
      && Math.abs(backdropBox.height - vp.height) < 2;
    console.log(`Backdrop: ${JSON.stringify(backdropBox)} → covers viewport: ${backdropCoversViewport}`);
  } else {
    console.log('No .fixed.inset-0 backdrop found');
  }

  // Check portal: modal should be direct child of body
  const portalWrapper = await page.$('body > div.fixed, body > div > div.fixed');
  if (portalWrapper) {
    console.log('✓ Portal wrapper found as child of body');
  } else {
    // Check all fixed elements
    const allFixed = await page.$$eval('div.fixed', els => els.map(el => ({
      class: el.className,
      parent: el.parentElement?.tagName,
    })));
    console.log(`Fixed elements: ${JSON.stringify(allFixed)}`);
  }

  // Find modal panel - the white/dark dialog box
  const modalPanelSelectors = [
    'div.fixed.inset-0 + div',
    'div[class*="rounded"][class*="shadow"]',
    'div[class*="modal"]',
    '[role="dialog"]',
    'div.fixed.inset-0 ~ div',
  ];

  let panelBox = null;
  let panelSelector = '';
  for (const sel of modalPanelSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        panelBox = await el.boundingBox();
        panelSelector = sel;
        console.log(`Modal panel (${sel}): ${JSON.stringify(panelBox)}`);
        break;
      }
    } catch (e) {}
  }

  // Check centering
  let isCentered = false;
  let centeringResult = 'N/A - modal panel not found';
  if (panelBox) {
    const expectedCenterX = vp.width / 2;
    const expectedCenterY = vp.height / 2;
    const actualCenterX = panelBox.x + panelBox.width / 2;
    const actualCenterY = panelBox.y + panelBox.height / 2;
    const xDiff = Math.abs(actualCenterX - expectedCenterX);
    const yDiff = Math.abs(actualCenterY - expectedCenterY);
    isCentered = xDiff < 30 && yDiff < 60;
    centeringResult = `xDiff=${xDiff.toFixed(1)}px yDiff=${yDiff.toFixed(1)}px → ${isCentered ? '✓ CENTERED' : '✗ NOT CENTERED'}`;
    console.log(`Centering: ${centeringResult}`);
  }

  results.push({
    viewport: vp.name,
    dimensions: `${vp.width}x${vp.height}`,
    loginClicked,
    clickedSelector,
    backdropCoversViewport,
    panelBox,
    isCentered,
    centeringResult,
    consoleErrors: consoleErrors.slice(0, 3),
  });

  await context.close();
}

await browser.close();

console.log('\n\n==================== FINAL SUMMARY ====================');
for (const r of results) {
  const pass = r.loginClicked && r.backdropCoversViewport && r.isCentered;
  console.log(`\n${pass ? '✅' : '❌'} ${r.viewport.toUpperCase()} (${r.dimensions}):`);
  console.log(`   Login triggered: ${r.loginClicked ? '✓' : '✗'} ${r.clickedSelector}`);
  console.log(`   Backdrop covers viewport: ${r.backdropCoversViewport ? '✓' : '✗'}`);
  console.log(`   Modal centering: ${r.centeringResult}`);
  if (r.consoleErrors.length) console.log(`   Console errors: ${r.consoleErrors.join('; ')}`);
}
