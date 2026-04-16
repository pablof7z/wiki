const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = '/Users/customer/.tenex/home/915e6aa6';
const ARTICLE_PATH = '/a/naddr1qvzqqqrcvgpzqsggekyz6k7hg345kh9sdz93g62085xmk54ayncku83flutrdtdtqy88wumn8ghj7mn0wvhxcmmv9uqp2um0wejhyetfvahz6etwva5kuet9wf5kuecx9xe56';

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  try {
    // ---- Test 1: Desktop 1280x900 ----
    console.log('\n=== TEST 1: Desktop 1280x900 ===');
    const ctx1 = await browser.newContext({ 
      viewport: { width: 1280, height: 900 },
      colorScheme: 'dark'
    });
    const page1 = await ctx1.newPage();
    await page1.goto(`http://localhost:5173${ARTICLE_PATH}`, { waitUntil: 'networkidle', timeout: 30000 });
    // Wait for SvelteKit hydration
    await page1.waitForTimeout(3000);
    
    // Screenshot
    const ss1 = path.join(SCREENSHOT_DIR, 'bg-verify-desktop.png');
    await page1.screenshot({ path: ss1, fullPage: false });
    console.log(`Screenshot saved: ${ss1}`);
    
    // Inspect the actual DOM structure
    const domInfo = await page1.evaluate(() => {
      // Find the div with page-shell class
      const shells = document.querySelectorAll('.page-shell');
      const shellInfo = [];
      shells.forEach((el, i) => {
        const cs = getComputedStyle(el);
        shellInfo.push({
          index: i,
          tagName: el.tagName,
          className: el.className,
          bgColor: cs.backgroundColor,
          minHeight: cs.minHeight,
          height: cs.height,
          position: cs.position,
          zIndex: cs.zIndex,
          rect: el.getBoundingClientRect()
        });
      });
      
      // Check body pseudo-elements
      const bodyCs = getComputedStyle(document.body);
      const bodyBefore = getComputedStyle(document.body, '::before');
      const bodyAfter = getComputedStyle(document.body, '::after');
      
      // Check if bg-background class is being applied
      const bgBgElements = document.querySelectorAll('[class*="bg-background"]');
      const bgBgInfo = [];
      bgBgElements.forEach(el => {
        const cs = getComputedStyle(el);
        bgBgInfo.push({
          tag: el.tagName,
          className: el.className.substring(0, 200),
          bgColor: cs.backgroundColor,
          minHeight: cs.minHeight
        });
      });
      
      // Check min-h-screen
      const minHScreenElements = document.querySelectorAll('[class*="min-h-screen"]');
      const minHInfo = [];
      minHScreenElements.forEach(el => {
        const cs = getComputedStyle(el);
        minHInfo.push({
          tag: el.tagName,
          className: el.className.substring(0, 200),
          minHeight: cs.minHeight
        });
      });
      
      // Get the full outer HTML of the article page wrapper (first 500 chars)
      const articleWrapper = document.querySelector('.page-shell');
      const outerSnippet = articleWrapper ? articleWrapper.outerHTML.substring(0, 500) : 'NOT FOUND';
      
      return {
        shellElements: shellInfo,
        bgBackgroundElements: bgBgInfo,
        minHScreenElements: minHInfo,
        bodyBg: bodyCs.backgroundColor,
        bodyBeforeBg: bodyBefore.background,
        bodyAfterBg: bodyAfter.background,
        outerSnippet,
        pageTitle: document.title,
        bodyHTML: document.body.innerHTML.substring(0, 300)
      };
    });
    
    console.log('Page title:', domInfo.pageTitle);
    console.log('Shell elements:', JSON.stringify(domInfo.shellElements, null, 2));
    console.log('bg-background elements:', JSON.stringify(domInfo.bgBackgroundElements, null, 2));
    console.log('min-h-screen elements:', JSON.stringify(domInfo.minHScreenElements, null, 2));
    console.log('Body bg:', domInfo.bodyBg);
    console.log('Body ::before bg:', domInfo.bodyBeforeBg);
    console.log('Body ::after bg:', domInfo.bodyAfterBg);
    console.log('Outer snippet:', domInfo.outerSnippet);
    
    // Sample pixel colors at various positions to check for dots/pattern
    const pixelTest = await page1.evaluate(() => {
      // Create a canvas to sample pixels from the page
      // We'll check the background color at multiple points
      const results = {};
      
      // Get the page-shell element
      const shell = document.querySelector('.page-shell');
      if (!shell) return { error: 'No .page-shell found' };
      
      const shellRect = shell.getBoundingClientRect();
      const cs = getComputedStyle(shell);
      
      results.shellRect = { top: shellRect.top, left: shellRect.left, width: shellRect.width, height: shellRect.height };
      results.shellBg = cs.backgroundColor;
      results.shellMinHeight = cs.minHeight;
      results.shellOverflow = cs.overflow;
      
      // Check if there are any elements with visible background between body and shell
      let el = shell;
      const ancestors = [];
      while (el && el !== document.documentElement) {
        const acs = getComputedStyle(el);
        if (acs.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          ancestors.push({
            tag: el.tagName,
            id: el.id,
            className: (el.className || '').toString().substring(0, 100),
            bg: acs.backgroundColor
          });
        }
        el = el.parentElement;
      }
      results.ancestorsWithBg = ancestors;
      
      return results;
    });
    
    console.log('\nPixel/layout analysis:', JSON.stringify(pixelTest, null, 2));
    
    await ctx1.close();
    
    // ---- Test 2: Mobile 375x812 ----
    console.log('\n=== TEST 2: Mobile 375x812 ===');
    const ctx2 = await browser.newContext({ 
      viewport: { width: 375, height: 812 },
      colorScheme: 'dark'
    });
    const page2 = await ctx2.newPage();
    await page2.goto(`http://localhost:5173${ARTICLE_PATH}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page2.waitForTimeout(3000);
    
    const ss2 = path.join(SCREENSHOT_DIR, 'bg-verify-mobile.png');
    await page2.screenshot({ path: ss2, fullPage: false });
    console.log(`Screenshot saved: ${ss2}`);
    await ctx2.close();
    
    // ---- Test 3: Tablet 768x1024 ----
    console.log('\n=== TEST 3: Tablet 768x1024 ===');
    const ctx3 = await browser.newContext({ 
      viewport: { width: 768, height: 1024 },
      colorScheme: 'dark'
    });
    const page3 = await ctx3.newPage();
    await page3.goto(`http://localhost:5173${ARTICLE_PATH}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page3.waitForTimeout(3000);
    
    const ss3 = path.join(SCREENSHOT_DIR, 'bg-verify-tablet.png');
    await page3.screenshot({ path: ss3, fullPage: false });
    console.log(`Screenshot saved: ${ss3}`);
    await ctx3.close();
    
    // ---- Test 4: Full HD 1920x1080 ----
    console.log('\n=== TEST 4: Full HD 1920x1080 ===');
    const ctx4 = await browser.newContext({ 
      viewport: { width: 1920, height: 1080 },
      colorScheme: 'dark'
    });
    const page4 = await ctx4.newPage();
    await page4.goto(`http://localhost:5173${ARTICLE_PATH}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page4.waitForTimeout(3000);
    
    const ss4 = path.join(SCREENSHOT_DIR, 'bg-verify-fullhd.png');
    await page4.screenshot({ path: ss4, fullPage: false });
    console.log(`Screenshot saved: ${ss4}`);
    await ctx4.close();
    
    // ---- Test 5: Scroll test ----
    console.log('\n=== TEST 5: Scroll test at 1280x900 ===');
    const ctx5 = await browser.newContext({ 
      viewport: { width: 1280, height: 900 },
      colorScheme: 'dark'
    });
    const page5 = await ctx5.newPage();
    await page5.goto(`http://localhost:5173${ARTICLE_PATH}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page5.waitForTimeout(3000);
    
    // Scroll to the bottom
    await page5.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page5.waitForTimeout(1000);
    
    const ss5 = path.join(SCREENSHOT_DIR, 'bg-verify-scrolled.png');
    await page5.screenshot({ path: ss5, fullPage: false });
    console.log(`Screenshot saved: ${ss5}`);
    
    // Full page screenshot
    const ss6 = path.join(SCREENSHOT_DIR, 'bg-verify-fullpage.png');
    await page5.screenshot({ path: ss6, fullPage: true });
    console.log(`Full page screenshot saved: ${ss6}`);
    await ctx5.close();
    
    console.log('\n=== ALL SCREENSHOTS COMPLETE ===');
    
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    await browser.close();
  }
})();
