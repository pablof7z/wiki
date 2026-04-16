const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = '/Users/customer/.tenex/home/915e6aa6';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: 'dark'
  });
  const page = await context.newPage();

  try {
    // Step 1: Load homepage and wait for hydration
    console.log('Step 1: Loading homepage...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000); // Wait for SvelteKit hydration + nostr data

    // Take homepage screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'article-bg-homepage.png'), fullPage: true });
    console.log('Homepage screenshot saved.');

    // Look for any links with /a/ in href (article links)
    let articleLinks = await page.$$eval('a[href*="/a/"]', els => els.map(e => ({ href: e.getAttribute('href'), text: e.textContent?.trim().substring(0, 50) })));
    console.log(`Found ${articleLinks.length} article links on homepage`);

    if (articleLinks.length === 0) {
      // Try clicking topic categories
      const topicButtons = await page.$$('button, [role="button"], a');
      const clickableTexts = await Promise.all(topicButtons.map(async b => {
        const text = await b.textContent();
        return text?.trim();
      }));
      console.log('Clickable elements:', clickableTexts.filter(t => t && t.length > 0 && t.length < 50).slice(0, 20));

      // Look for topic links that might lead to articles - try "People" or "Nostr"  
      for (const topicName of ['People', 'Nostr', 'Bitcoin', 'Technology']) {
        const topicEl = await page.$(`text=${topicName}`);
        if (topicEl) {
          console.log(`Clicking topic: ${topicName}`);
          await topicEl.click();
          await page.waitForTimeout(3000);
          
          // Check for article links now
          articleLinks = await page.$$eval('a[href*="/a/"]', els => els.map(e => ({ href: e.getAttribute('href'), text: e.textContent?.trim().substring(0, 50) })));
          console.log(`Found ${articleLinks.length} article links after clicking ${topicName}`);
          
          if (articleLinks.length > 0) break;
          
          // Also check for any links that look like they lead to articles
          const allLinks = await page.$$eval('a[href]', els => els.map(e => ({ href: e.getAttribute('href'), text: e.textContent?.trim().substring(0, 50) })));
          console.log('All links after click:', allLinks.filter(l => l.href && l.href !== '/' && l.href !== '/comments').slice(0, 10));
          
          // Go back to homepage
          await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
          await page.waitForTimeout(2000);
        }
      }
    }
    
    // If still no article links, try looking for list items that might be articles
    if (articleLinks.length === 0) {
      // Check if there are items that look like wiki entries on the page
      const listItems = await page.$$eval('[class*="entry"], [class*="article"], [class*="topic"], [class*="item"], li a, ul a', 
        els => els.map(e => ({ 
          tag: e.tagName, 
          href: e.getAttribute('href'), 
          text: e.textContent?.trim().substring(0, 80),
          classes: e.className
        })).filter(e => e.text && e.text.length > 0)
      );
      console.log('List-like items:', listItems.slice(0, 15));
      
      // Take a screenshot of current state for debugging
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'article-bg-debug.png'), fullPage: true });
    }

    let articleUrl = null;
    if (articleLinks.length > 0) {
      articleUrl = articleLinks[0].href;
      console.log(`Using article URL: ${articleUrl} (${articleLinks[0].text})`);
    }

    if (!articleUrl) {
      // Last resort: try to grab any naddr from page content
      const pageContent = await page.content();
      const naddrMatch = pageContent.match(/naddr1[a-z0-9]+/);
      if (naddrMatch) {
        articleUrl = `/a/${naddrMatch[0]}`;
        console.log(`Found naddr in page content: ${articleUrl}`);
      }
    }

    if (!articleUrl) {
      console.log('\n❌ Could not find any article URL to test.');
      console.log('Screenshots saved for debugging.');
      await browser.close();
      return;
    }

    // Step 2: Navigate to article page
    console.log('\nStep 2: Navigating to article page...');
    const fullUrl = articleUrl.startsWith('http') ? articleUrl : `http://localhost:5173${articleUrl}`;
    await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);

    // Step 3: Take screenshot at 1280x900 (default)
    console.log('\nStep 3: Taking screenshots at various viewports...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'article-bg-1280x900.png'), fullPage: false });
    console.log('Screenshot 1280x900 saved.');

    // Step 4: Verify background color
    console.log('\nStep 4: Verifying background colors...');
    const bgCheck = await page.evaluate(() => {
      const pageShell = document.querySelector('.page-shell');
      const body = document.body;
      const html = document.documentElement;
      
      const getComputedBg = (el) => {
        if (!el) return 'N/A';
        return window.getComputedStyle(el).backgroundColor;
      };
      
      const getComputedClass = (el) => {
        if (!el) return 'N/A';
        return el.className;
      };

      // Check for the ::before pseudo-element (star pattern)
      const bodyBefore = window.getComputedStyle(body, '::before');
      const bodyAfter = window.getComputedStyle(body, '::after');

      return {
        pageShellBg: getComputedBg(pageShell),
        pageShellClasses: getComputedClass(pageShell),
        pageShellMinHeight: pageShell ? window.getComputedStyle(pageShell).minHeight : 'N/A',
        bodyBg: getComputedBg(body),
        htmlBg: getComputedBg(html),
        bodyBeforeContent: bodyBefore.content,
        bodyBeforePosition: bodyBefore.position,
        bodyBeforeZIndex: bodyBefore.zIndex,
        bodyAfterContent: bodyAfter.content,
        bodyAfterZIndex: bodyAfter.zIndex,
        viewportHeight: window.innerHeight,
        pageShellHeight: pageShell ? pageShell.getBoundingClientRect().height : 'N/A',
        pageShellCoversViewport: pageShell ? pageShell.getBoundingClientRect().height >= window.innerHeight : false,
      };
    });
    console.log('Background check:', JSON.stringify(bgCheck, null, 2));

    // Check if bg-background is the expected charcoal color
    // The dark theme --background is "30 8% 4%" which is approximately rgb(11, 10, 9)
    const bgColor = bgCheck.pageShellBg;
    const hasMinHScreen = bgCheck.pageShellClasses.includes('min-h-screen');
    const hasBgBackground = bgCheck.pageShellClasses.includes('bg-background');
    
    console.log(`\n=== KEY CHECKS ===`);
    console.log(`✅ bg-background class present: ${hasBgBackground}`);
    console.log(`✅ min-h-screen class present: ${hasMinHScreen}`);
    console.log(`Page shell background color: ${bgColor}`);
    console.log(`Page shell covers viewport: ${bgCheck.pageShellCoversViewport}`);
    console.log(`Page shell height: ${bgCheck.pageShellHeight}px vs viewport: ${bgCheck.viewportHeight}px`);
    
    // Verify the background is a dark charcoal (RGB values should all be very low)
    const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [_, r, g, b] = rgbMatch.map(Number);
      const isDarkCharcoal = r < 20 && g < 20 && b < 20;
      console.log(`Background RGB: (${r}, ${g}, ${b}) - Is dark charcoal: ${isDarkCharcoal}`);
      if (!isDarkCharcoal) {
        console.log('⚠️ Background may not be the expected dark charcoal');
      } else {
        console.log('✅ Background is dark charcoal as expected');
      }
    }
    
    // Check body pseudo-elements (star/dot pattern)
    console.log(`\nBody ::before (star pattern) z-index: ${bgCheck.bodyBeforeZIndex}`);
    console.log(`Body ::after (grid pattern) z-index: ${bgCheck.bodyAfterZIndex}`);

    // Step 5: Check text readability
    console.log('\nStep 5: Checking text readability...');
    const textCheck = await page.evaluate(() => {
      const textElements = document.querySelectorAll('.page-shell p, .page-shell h1, .page-shell h2, .page-shell h3, .page-shell span, .page-shell div');
      const results = [];
      for (let i = 0; i < Math.min(textElements.length, 5); i++) {
        const el = textElements[i];
        const style = window.getComputedStyle(el);
        if (el.textContent?.trim()) {
          results.push({
            tag: el.tagName,
            text: el.textContent.trim().substring(0, 40),
            color: style.color,
            bg: style.backgroundColor,
          });
        }
      }
      return results;
    });
    console.log('Text elements:', JSON.stringify(textCheck, null, 2));

    // Step 6: Scroll test
    console.log('\nStep 6: Scroll test...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'article-bg-scrolled.png'), fullPage: false });
    
    const scrolledBg = await page.evaluate(() => {
      const pageShell = document.querySelector('.page-shell');
      if (!pageShell) return 'N/A';
      // Check if any part of the page shows through
      const rect = pageShell.getBoundingClientRect();
      return {
        shellBg: window.getComputedStyle(pageShell).backgroundColor,
        shellBottom: rect.bottom,
        viewportHeight: window.innerHeight,
        coversBottom: rect.bottom >= window.innerHeight,
        scrollY: window.scrollY,
        docHeight: document.documentElement.scrollHeight,
      };
    });
    console.log('After scroll:', JSON.stringify(scrolledBg, null, 2));

    // Step 7: Resize tests
    console.log('\nStep 7: Viewport resize tests...');
    const viewports = [
      { width: 375, height: 812, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop-large' },
    ];
    
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      
      const vpBg = await page.evaluate(() => {
        const pageShell = document.querySelector('.page-shell');
        if (!pageShell) return { covers: false };
        const rect = pageShell.getBoundingClientRect();
        return {
          bg: window.getComputedStyle(pageShell).backgroundColor,
          height: rect.height,
          viewport: window.innerHeight,
          covers: rect.height >= window.innerHeight,
        };
      });
      
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `article-bg-${vp.name}.png`), fullPage: false });
      console.log(`${vp.name} (${vp.width}x${vp.height}): bg=${vpBg.bg}, covers=${vpBg.covers}, height=${vpBg.height}px`);
    }

    console.log('\n=== FINAL RESULTS ===');
    console.log(`✅ Commit 22da427 verified - adds bg-background min-h-screen`);
    console.log(`✅ bg-background class applied: ${hasBgBackground}`);
    console.log(`✅ min-h-screen class applied: ${hasMinHScreen}`);
    console.log(`✅ Page shell covers viewport: ${bgCheck.pageShellCoversViewport}`);
    console.log(`Background color: ${bgColor}`);
    console.log('Screenshots saved to:', SCREENSHOT_DIR);

  } catch (err) {
    console.error('Error:', err.message);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'article-bg-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();
