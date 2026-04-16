const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = '/Users/customer/.tenex/home/915e6aa6';

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Step 1: Navigate to homepage and find an article link
    console.log('=== STEP 1: Finding an article URL ===');
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Click first topic link to find articles
    const topicLinks = await page.$$('a[href^="/"]');
    let articleUrl = null;
    
    // First try to find a direct /a/ link on the homepage
    const allLinks = await page.$$eval('a', els => els.map(a => a.href));
    console.log('Homepage links (first 20):', allLinks.slice(0, 20));
    
    const articleLink = allLinks.find(l => l.includes('/a/naddr'));
    if (articleLink) {
      articleUrl = articleLink;
      console.log('Found direct article link:', articleUrl);
    } else {
      // Click into a topic to find articles
      const topicLink = allLinks.find(l => {
        const u = new URL(l);
        return u.pathname.length > 1 && !u.pathname.includes('/a/') && !u.pathname.includes('/new') && !u.pathname.includes('/comments') && !u.pathname.includes('/test');
      });
      
      if (topicLink) {
        console.log('Navigating to topic:', topicLink);
        await page.goto(topicLink, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(5000);
        
        // Now look for article links
        const topicPageLinks = await page.$$eval('a', els => els.map(a => a.href));
        console.log('Topic page links (first 30):', topicPageLinks.slice(0, 30));
        
        articleUrl = topicPageLinks.find(l => l.includes('/a/naddr'));
        if (articleUrl) {
          console.log('Found article link from topic page:', articleUrl);
        }
      }
    }
    
    if (!articleUrl) {
      console.log('ERROR: Could not find any article URL. Aborting.');
      await browser.close();
      process.exit(1);
    }
    
    // Step 2: Navigate to the article
    console.log('\n=== STEP 2: Navigating to article ===');
    console.log('URL:', articleUrl);
    await page.goto(articleUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    // Step 3: Verify CSS classes and computed styles
    console.log('\n=== STEP 3: Verifying CSS classes and computed styles ===');
    
    // Check for the page-shell div with bg-background class
    const shellInfo = await page.evaluate(() => {
      // Look for elements with bg-background class
      const bgElements = document.querySelectorAll('.bg-background');
      const results = [];
      
      bgElements.forEach(el => {
        const cs = getComputedStyle(el);
        results.push({
          tag: el.tagName,
          classes: el.className,
          bgColor: cs.backgroundColor,
          minHeight: cs.minHeight,
          position: cs.position,
          zIndex: cs.zIndex
        });
      });
      
      // Also check body pseudo-elements via body styles
      const bodyCs = getComputedStyle(document.body);
      const bodyBefore = getComputedStyle(document.body, '::before');
      const bodyAfter = getComputedStyle(document.body, '::after');
      
      // Check the outermost div wrapping article content
      const mainContent = document.querySelector('.page-shell') || document.querySelector('[class*="bg-background"]');
      let mainCs = null;
      if (mainContent) {
        const s = getComputedStyle(mainContent);
        mainCs = {
          tag: mainContent.tagName,
          classes: mainContent.className,
          bgColor: s.backgroundColor,
          minHeight: s.minHeight,
          zIndex: s.zIndex,
          position: s.position
        };
      }
      
      return {
        bgBackgroundElements: results,
        bodyBg: bodyCs.backgroundColor,
        bodyBeforeZIndex: bodyBefore.zIndex,
        bodyAfterZIndex: bodyAfter.zIndex,
        mainContent: mainCs,
        url: window.location.href,
        title: document.title
      };
    });
    
    console.log('Page URL:', shellInfo.url);
    console.log('Page title:', shellInfo.title);
    console.log('Body background:', shellInfo.bodyBg);
    console.log('Body ::before z-index:', shellInfo.bodyBeforeZIndex);
    console.log('Body ::after z-index:', shellInfo.bodyAfterZIndex);
    console.log('Main content element:', JSON.stringify(shellInfo.mainContent, null, 2));
    console.log('Elements with bg-background class:', JSON.stringify(shellInfo.bgBackgroundElements, null, 2));
    
    // Step 4: Sample pixel colors at various positions
    console.log('\n=== STEP 4: Sampling pixel colors ===');
    
    // Take a screenshot buffer and analyze pixels
    const screenshotBuffer = await page.screenshot({ type: 'png' });
    
    // We can't easily analyze pixels in Node without sharp/jimp, so let's use page.evaluate to sample colors
    const pixelSamples = await page.evaluate(() => {
      const samples = [];
      const positions = [
        { x: 10, y: 10, label: 'top-left corner' },
        { x: window.innerWidth - 10, y: 10, label: 'top-right corner' },
        { x: 10, y: window.innerHeight - 10, label: 'bottom-left corner' },
        { x: window.innerWidth - 10, y: window.innerHeight - 10, label: 'bottom-right corner' },
        { x: window.innerWidth / 2, y: 50, label: 'top-center' },
        { x: 50, y: window.innerHeight / 2, label: 'left-middle' },
        { x: window.innerWidth - 50, y: window.innerHeight / 2, label: 'right-middle' },
      ];
      
      for (const pos of positions) {
        const el = document.elementFromPoint(pos.x, pos.y);
        if (el) {
          const cs = getComputedStyle(el);
          samples.push({
            ...pos,
            element: el.tagName + (el.className ? '.' + el.className.split(' ').slice(0, 3).join('.') : ''),
            bgColor: cs.backgroundColor,
            color: cs.color
          });
        }
      }
      return samples;
    });
    
    console.log('Pixel/element samples at viewport positions:');
    for (const s of pixelSamples) {
      console.log(`  ${s.label} (${s.x},${s.y}): bg=${s.bgColor}, text=${s.color}, element=${s.element}`);
    }
    
    // Step 5: Take screenshots at different viewports
    console.log('\n=== STEP 5: Taking screenshots at various viewports ===');
    
    const viewports = [
      { width: 1920, height: 1080, name: 'fullhd' },
      { width: 1280, height: 900, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 812, name: 'mobile' },
    ];
    
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(500);
      const filepath = path.join(SCREENSHOT_DIR, `verify-final-${vp.name}.png`);
      await page.screenshot({ path: filepath, fullPage: false });
      console.log(`Screenshot saved: ${filepath} (${vp.width}x${vp.height})`);
    }
    
    // Step 6: Scroll verification
    console.log('\n=== STEP 6: Scroll verification ===');
    await page.setViewportSize({ width: 1280, height: 900 });
    
    // Scroll to middle
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
    const scrolledPath = path.join(SCREENSHOT_DIR, 'verify-final-scrolled-mid.png');
    await page.screenshot({ path: scrolledPath, fullPage: false });
    console.log(`Screenshot saved: ${scrolledPath} (scrolled to middle)`);
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const bottomPath = path.join(SCREENSHOT_DIR, 'verify-final-scrolled-bottom.png');
    await page.screenshot({ path: bottomPath, fullPage: false });
    console.log(`Screenshot saved: ${bottomPath} (scrolled to bottom)`);

    // Sample colors after scrolling to bottom
    const bottomSamples = await page.evaluate(() => {
      const samples = [];
      const positions = [
        { x: 10, y: 10, label: 'top-left after scroll' },
        { x: window.innerWidth - 10, y: 10, label: 'top-right after scroll' },
        { x: window.innerWidth / 2, y: window.innerHeight / 2, label: 'center after scroll' },
        { x: 10, y: window.innerHeight - 10, label: 'bottom-left after scroll' },
      ];
      for (const pos of positions) {
        const el = document.elementFromPoint(pos.x, pos.y);
        if (el) {
          const cs = getComputedStyle(el);
          samples.push({ ...pos, bgColor: cs.backgroundColor, element: el.tagName + '.' + (el.className || '').split(' ').slice(0, 3).join('.') });
        }
      }
      return samples;
    });
    
    console.log('Colors after scrolling to bottom:');
    for (const s of bottomSamples) {
      console.log(`  ${s.label}: bg=${s.bgColor}, element=${s.element}`);
    }
    
    // Full page screenshot
    const fullpagePath = path.join(SCREENSHOT_DIR, 'verify-final-fullpage.png');
    await page.screenshot({ path: fullpagePath, fullPage: true });
    console.log(`Screenshot saved: ${fullpagePath} (full page)`);
    
    console.log('\n=== VERIFICATION COMPLETE ===');
    
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
})();
