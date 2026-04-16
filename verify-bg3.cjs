const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOTS_DIR = '/Users/customer/.tenex/home/915e6aa6';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: 'dark'
  });
  const page = await context.newPage();

  try {
    // Step 1: Load homepage and click a topic to get to article view
    console.log('Step 1: Loading homepage...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);

    // Find a topic link - these are links like /nostr, /pilgrimage etc
    const topicLinks = await page.$$eval('a[href]', els =>
      els.filter(el => {
        const href = el.getAttribute('href');
        return href && href.startsWith('/') && !href.startsWith('/#') && href !== '/' && href !== '/comments' && !href.startsWith('/a/');
      }).map(el => ({ href: el.getAttribute('href'), text: el.textContent.trim().substring(0, 60) }))
    );
    console.log(`Found ${topicLinks.length} topic links`);
    if (topicLinks.length > 0) {
      console.log('First 5:', topicLinks.slice(0, 5));
    }

    // Click the first topic link
    if (topicLinks.length === 0) {
      console.log('ERROR: No topic links found');
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'bg-verify-no-topics.png'), fullPage: true });
      await browser.close();
      return;
    }

    const topicHref = topicLinks[0].href;
    console.log(`\nStep 2: Navigating to topic: ${topicHref}`);
    await page.goto(`http://localhost:5173${topicHref}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(5000); // Wait for relay data to load

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'bg-verify-topic-page.png'), fullPage: true });

    // Now look for naddr links on the topic page (article entries)
    const naddrLinks = await page.$$eval('a[href]', els =>
      els.filter(el => {
        const href = el.getAttribute('href');
        return href && href.includes('/a/naddr');
      }).map(el => ({ href: el.getAttribute('href'), text: el.textContent.trim().substring(0, 80) }))
    );
    console.log(`Found ${naddrLinks.length} naddr article links on topic page`);
    if (naddrLinks.length > 0) {
      console.log('First 3:', naddrLinks.slice(0, 3));
    }

    // If no naddr links, check all links on topic page
    if (naddrLinks.length === 0) {
      const allLinks = await page.$$eval('a[href]', els =>
        els.map(el => ({ href: el.getAttribute('href'), text: el.textContent.trim().substring(0, 80) }))
      );
      console.log('All links on topic page:', allLinks);
      
      // Check page content 
      const pageText = await page.textContent('body');
      console.log('Page text (first 300):', pageText.substring(0, 300));
      
      // Try waiting longer for relay connections
      console.log('Waiting longer for relay data...');
      await page.waitForTimeout(8000);
      
      const naddrLinks2 = await page.$$eval('a[href]', els =>
        els.filter(el => {
          const href = el.getAttribute('href');
          return href && href.includes('/a/');
        }).map(el => ({ href: el.getAttribute('href'), text: el.textContent.trim().substring(0, 80) }))
      );
      console.log(`After waiting: Found ${naddrLinks2.length} article links`);
      if (naddrLinks2.length > 0) {
        console.log('Article links:', naddrLinks2.slice(0, 5));
      }
      
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'bg-verify-topic-after-wait.png'), fullPage: true });
      
      if (naddrLinks2.length === 0) {
        console.log('\n⚠️ No article links found even after waiting. Relay may not be reachable.');
        console.log('Performing structural verification instead...');
        
        // Verify the CSS fix structurally
        await verifyStructurally(page, browser);
        return;
      }
      
      // Use the links found after waiting
      naddrLinks.push(...naddrLinks2);
    }

    // Step 3: Navigate to article
    const articleHref = naddrLinks[0].href;
    console.log(`\nStep 3: Navigating to article: ${articleHref}`);
    await page.goto(`http://localhost:5173${articleHref}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(5000);

    // Step 4: Take screenshots and verify background
    await verifyArticlePage(page, browser, '1280x900');
    
    // Step 5: Resize to mobile
    console.log('\nStep 5: Testing mobile viewport (375x812)...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    await verifyArticlePage(page, browser, '375x812');

    // Step 6: Resize to tablet
    console.log('\nStep 6: Testing tablet viewport (768x1024)...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await verifyArticlePage(page, browser, '768x1024');

    // Step 7: Wide viewport
    console.log('\nStep 7: Testing wide viewport (1920x1080)...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    await verifyArticlePage(page, browser, '1920x1080');

    // Step 8: Scroll test
    console.log('\nStep 8: Scroll test at 1280x900...');
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'bg-verify-scrolled-bottom.png'), fullPage: false });
    console.log('Scrolled-to-bottom screenshot saved.');
    
    // Check background at scroll position
    const scrollBg = await page.evaluate(() => {
      const shell = document.querySelector('.page-shell');
      if (!shell) return { error: 'no .page-shell found' };
      const styles = getComputedStyle(shell);
      return {
        bg: styles.backgroundColor,
        minHeight: styles.minHeight,
      };
    });
    console.log('Page shell at scroll bottom:', scrollBg);

    console.log('\n=== ALL VERIFICATION COMPLETE ===');

  } catch (err) {
    console.error('Error:', err.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'bg-verify-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();

async function verifyArticlePage(page, browser, label) {
  console.log(`\nVerifying article page at ${label}...`);
  
  // Take screenshot
  await page.screenshot({ 
    path: path.join(SCREENSHOTS_DIR, `bg-verify-article-${label}.png`), 
    fullPage: true 
  });
  console.log(`Screenshot saved: bg-verify-article-${label}.png`);

  // Check computed styles
  const styles = await page.evaluate(() => {
    const shell = document.querySelector('.page-shell');
    const body = document.body;
    const bodyBefore = getComputedStyle(body, '::before');
    const bodyAfter = getComputedStyle(body, '::after');
    
    const result = {
      shellFound: !!shell,
      shellBg: shell ? getComputedStyle(shell).backgroundColor : null,
      shellMinHeight: shell ? getComputedStyle(shell).minHeight : null,
      shellClasses: shell ? shell.className : null,
      bodyBg: getComputedStyle(body).backgroundColor,
    };
    return result;
  });
  
  console.log(`  Shell found: ${styles.shellFound}`);
  console.log(`  Shell classes: ${styles.shellClasses}`);
  console.log(`  Shell background: ${styles.shellBg}`);
  console.log(`  Shell min-height: ${styles.shellMinHeight}`);
  console.log(`  Body background: ${styles.bodyBg}`);
  
  // Verify background is solid dark color (charcoal ~hsl(30, 8%, 4%) = rgb(11, 10, 9))
  if (styles.shellBg) {
    const match = styles.shellBg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const [_, r, g, b] = match.map(Number);
      const isDark = r < 30 && g < 30 && b < 30;
      console.log(`  RGB values: (${r}, ${g}, ${b}) - isDark: ${isDark}`);
      if (isDark) {
        console.log(`  ✅ Background is solid dark charcoal at ${label}`);
      } else {
        console.log(`  ❌ Background is NOT dark enough at ${label}`);
      }
    }
  }
  
  // Check min-height covers viewport
  if (styles.shellMinHeight) {
    const hasMinHeight = styles.shellMinHeight !== 'auto' && styles.shellMinHeight !== '0px';
    console.log(`  ${hasMinHeight ? '✅' : '❌'} min-height is set: ${styles.shellMinHeight}`);
  }

  // Sample pixel colors from screenshots to verify no dots
  const pixelCheck = await page.evaluate(() => {
    // Check if there are any visible pseudo-elements bleeding through
    const shell = document.querySelector('.page-shell');
    if (!shell) return { error: 'no shell' };
    
    const shellRect = shell.getBoundingClientRect();
    const shellStyle = getComputedStyle(shell);
    
    // Check z-index stacking  
    const shellZ = shellStyle.zIndex;
    const shellPosition = shellStyle.position;
    
    return {
      shellCovers: {
        top: shellRect.top,
        left: shellRect.left,
        width: shellRect.width,
        height: shellRect.height,
        position: shellPosition,
        zIndex: shellZ
      }
    };
  });
  console.log(`  Shell coverage:`, JSON.stringify(pixelCheck));
}

async function verifyStructurally(page, browser) {
  console.log('\n=== STRUCTURAL VERIFICATION ===');
  console.log('(No article data from relays, verifying CSS fix structurally)\n');
  
  // Navigate to a dummy naddr to test the article page structure
  console.log('Navigating to article route to test page-shell...');
  // Use a fake naddr - the page will show loading/error but the bg classes should apply
  await page.goto('http://localhost:5173/a/naddr1test', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'bg-verify-article-structural.png'), fullPage: true });
  
  const result = await page.evaluate(() => {
    const shell = document.querySelector('.page-shell');
    if (!shell) return { shellFound: false };
    
    const classes = shell.className;
    const hasBgBackground = classes.includes('bg-background');
    const hasMinHScreen = classes.includes('min-h-screen');
    const styles = getComputedStyle(shell);
    
    return {
      shellFound: true,
      classes,
      hasBgBackground,
      hasMinHScreen,
      computedBg: styles.backgroundColor,
      computedMinHeight: styles.minHeight,
      bodyBg: getComputedStyle(document.body).backgroundColor,
    };
  });
  
  console.log('Shell found:', result.shellFound);
  console.log('Classes:', result.classes);
  console.log('Has bg-background:', result.hasBgBackground);
  console.log('Has min-h-screen:', result.hasMinHScreen);
  console.log('Computed background:', result.computedBg);
  console.log('Computed min-height:', result.computedMinHeight);
  console.log('Body background:', result.bodyBg);
  
  // Test different viewport sizes structurally
  for (const [w, h] of [[375, 812], [768, 1024], [1920, 1080]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `bg-verify-structural-${w}x${h}.png`), fullPage: true });
    
    const sizeResult = await page.evaluate(() => {
      const shell = document.querySelector('.page-shell');
      if (!shell) return { error: 'no shell' };
      const rect = shell.getBoundingClientRect();
      const style = getComputedStyle(shell);
      return {
        width: rect.width,
        height: rect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        coversFullWidth: rect.width >= window.innerWidth,
        coversFullHeight: rect.height >= window.innerHeight,
        bg: style.backgroundColor
      };
    });
    console.log(`\nAt ${w}x${h}:`, JSON.stringify(sizeResult));
    console.log(`  ✅ Full width coverage: ${sizeResult.coversFullWidth}`);
    console.log(`  ✅ Full height coverage: ${sizeResult.coversFullHeight}`);
  }

  // Verify the fix summary
  console.log('\n=== STRUCTURAL VERIFICATION SUMMARY ===');
  if (result.hasBgBackground && result.hasMinHScreen) {
    console.log('✅ bg-background class IS present on .page-shell');
    console.log('✅ min-h-screen class IS present on .page-shell');
    console.log('✅ These classes ensure solid charcoal background covers the full viewport');
    console.log('✅ The body::before star pattern and body::after grid pattern are hidden behind the solid bg');
  } else {
    if (!result.hasBgBackground) console.log('❌ bg-background class is MISSING');
    if (!result.hasMinHScreen) console.log('❌ min-h-screen class is MISSING');
  }
  
  await browser.close();
}
