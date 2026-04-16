const { chromium } = require('@playwright/test');

const HOME = '/Users/customer/.tenex/home/915e6aa6';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Step 1: Navigate to homepage and find article links
  console.log('=== STEP 1: Navigate to homepage ===');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(4000);

  // Look for article links on homepage
  let articleUrl = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/a/naddr"]'));
    return links.length > 0 ? links[0].getAttribute('href') : null;
  });

  if (!articleUrl) {
    console.log('No direct article links on homepage, looking for topic links...');
    
    // Get all topic links
    const topicLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .map(l => ({ href: l.getAttribute('href'), text: l.textContent.trim() }))
        .filter(l => l.href && l.href.startsWith('/') && 
                !l.href.includes('/new') && !l.href.includes('/comments') && 
                !l.href.includes('/test') && l.href !== '/' &&
                !l.href.includes('/a/') && !l.href.includes('/p/'))
        .slice(0, 5);
    });
    console.log('Found topic links:', JSON.stringify(topicLinks));

    if (topicLinks.length > 0) {
      const topicUrl = 'http://localhost:5173' + topicLinks[0].href;
      console.log('Navigating to topic:', topicUrl);
      await page.goto(topicUrl, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(4000);

      articleUrl = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/a/naddr"]'));
        if (links.length > 0) return links[0].getAttribute('href');
        // Also try links that just contain naddr
        const allLinks = Array.from(document.querySelectorAll('a'));
        const naddrLink = allLinks.find(l => {
          const href = l.getAttribute('href');
          return href && href.includes('naddr');
        });
        return naddrLink ? naddrLink.getAttribute('href') : null;
      });
    }
  }

  if (!articleUrl) {
    console.log('ERROR: Could not find any article links. Dumping page links...');
    const allLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a'))
        .map(l => ({ href: l.getAttribute('href'), text: l.textContent.trim().substring(0, 50) }))
        .slice(0, 30);
    });
    console.log(JSON.stringify(allLinks, null, 2));
    await browser.close();
    return;
  }

  // Step 2: Navigate to article page
  console.log('\n=== STEP 2: Navigate to article ===');
  const fullArticleUrl = articleUrl.startsWith('http') ? articleUrl : 'http://localhost:5173' + articleUrl;
  console.log('Article URL:', fullArticleUrl);
  
  // Use a fresh page to avoid navigation context issues
  const articlePage = await context.newPage();
  await articlePage.goto(fullArticleUrl, { waitUntil: 'networkidle', timeout: 20000 });
  await articlePage.waitForTimeout(5000);
  console.log('Current URL:', articlePage.url());
  await page.close(); // close the old page

  // Step 3: Run diagnostics
  console.log('\n=== STEP 3: CSS Diagnostics ===');
  const diagnostics = await articlePage.evaluate(() => {
    const results = {};

    // Find bg-background element
    const bgEl = document.querySelector('.bg-background');
    if (bgEl) {
      const cs = window.getComputedStyle(bgEl);
      results.bgElement = {
        found: true,
        tagName: bgEl.tagName,
        classes: bgEl.className,
        backgroundColor: cs.backgroundColor,
        minHeight: cs.minHeight,
        position: cs.position || 'static',
        zIndex: cs.zIndex || 'auto',
        width: cs.width,
        height: cs.height,
      };
    } else {
      results.bgElement = { found: false };
      // Try to find the wrapper div
      const wrapper = document.querySelector('.page-shell') || document.querySelector('div[class*="min-h-screen"]');
      if (wrapper) {
        const cs = window.getComputedStyle(wrapper);
        results.fallbackWrapper = {
          found: true,
          classes: wrapper.className,
          backgroundColor: cs.backgroundColor,
          minHeight: cs.minHeight
        };
      }
    }

    // Body background
    const bodyCs = window.getComputedStyle(document.body);
    results.body = { backgroundColor: bodyCs.backgroundColor };

    // body::before (star pattern)
    const beforeCs = window.getComputedStyle(document.body, '::before');
    results.bodyBefore = {
      content: beforeCs.content,
      position: beforeCs.position,
      zIndex: beforeCs.zIndex,
      opacity: beforeCs.opacity,
      hasBgImage: beforeCs.backgroundImage !== 'none'
    };

    // body::after (grid pattern)
    const afterCs = window.getComputedStyle(document.body, '::after');
    results.bodyAfter = {
      content: afterCs.content,
      position: afterCs.position,
      zIndex: afterCs.zIndex,
      opacity: afterCs.opacity,
      hasBgImage: afterCs.backgroundImage !== 'none'
    };

    // Article content
    const article = document.querySelector('article') || document.querySelector('.prose') || document.querySelector('[class*="article"]');
    if (article) {
      const acs = window.getComputedStyle(article);
      results.articleContent = {
        found: true,
        color: acs.color,
        backgroundColor: acs.backgroundColor,
        fontSize: acs.fontSize
      };
    } else {
      results.articleContent = { found: false };
    }

    // h1 title
    const h1 = document.querySelector('h1');
    if (h1) {
      const h1cs = window.getComputedStyle(h1);
      results.h1 = {
        text: h1.textContent.trim().substring(0, 60),
        color: h1cs.color,
        fontSize: h1cs.fontSize
      };
    }

    results.pageTitle = document.title;
    results.bodyHeight = document.body.scrollHeight;
    results.viewportHeight = window.innerHeight;

    return results;
  });

  console.log(JSON.stringify(diagnostics, null, 2));

  // Step 4: Take screenshots at different viewports
  console.log('\n=== STEP 4: Taking screenshots ===');

  const viewports = [
    { name: 'desktop-1280', width: 1280, height: 900 },
    { name: 'fullhd-1920', width: 1920, height: 1080 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'mobile-375', width: 375, height: 812 },
  ];

  for (const vp of viewports) {
    await articlePage.setViewportSize({ width: vp.width, height: vp.height });
    await articlePage.evaluate(() => window.scrollTo(0, 0));
    await articlePage.waitForTimeout(500);
    const path = `${HOME}/article-${vp.name}.png`;
    await articlePage.screenshot({ path, fullPage: false });
    console.log(`Screenshot saved: article-${vp.name}.png (${vp.width}x${vp.height})`);
  }

  // Step 5: Scrolled views (desktop)
  console.log('\n=== STEP 5: Scroll verification ===');
  await articlePage.setViewportSize({ width: 1280, height: 900 });
  await articlePage.waitForTimeout(300);

  // Scroll to middle
  await articlePage.evaluate(() => window.scrollTo(0, Math.floor(document.body.scrollHeight / 2)));
  await articlePage.waitForTimeout(500);
  await articlePage.screenshot({ path: `${HOME}/article-scrolled-mid.png`, fullPage: false });
  console.log('Screenshot saved: article-scrolled-mid.png (scrolled to middle)');

  // Scroll to bottom
  await articlePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await articlePage.waitForTimeout(500);
  await articlePage.screenshot({ path: `${HOME}/article-scrolled-bottom.png`, fullPage: false });
  console.log('Screenshot saved: article-scrolled-bottom.png (scrolled to bottom)');

  // Full page
  await articlePage.evaluate(() => window.scrollTo(0, 0));
  await articlePage.waitForTimeout(300);
  await articlePage.screenshot({ path: `${HOME}/article-fullpage.png`, fullPage: true });
  console.log('Screenshot saved: article-fullpage.png (full page)');

  // Step 6: Pixel color sampling from canvas
  console.log('\n=== STEP 6: Pixel color verification ===');
  await articlePage.setViewportSize({ width: 1280, height: 900 });
  await articlePage.evaluate(() => window.scrollTo(0, 0));
  await articlePage.waitForTimeout(500);

  // Use a canvas-based approach to sample actual rendered pixel colors
  const pixelData = await articlePage.evaluate(() => {
    // We can't directly sample pixels from the page, but we can check
    // if the bg-background element fully covers the viewport
    const bgEl = document.querySelector('.bg-background');
    if (!bgEl) return { error: 'No .bg-background element found' };
    
    const rect = bgEl.getBoundingClientRect();
    return {
      bgRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        coversViewportWidth: rect.width >= window.innerWidth,
        coversViewportHeight: rect.height >= window.innerHeight
      },
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollHeight: document.body.scrollHeight
    };
  });
  console.log('Pixel/coverage data:', JSON.stringify(pixelData, null, 2));

  console.log('\n=== VERIFICATION COMPLETE ===');
  await browser.close();
}

main().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
