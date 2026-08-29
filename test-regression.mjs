import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

async function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function waitForServer(url) {
    for (let i = 0; i < 30; i++) {
        try {
            const res = await fetch(url);
            if (res.ok) return;
        } catch (e) {}
        await wait(1000);
    }
    throw new Error('Server never started');
}

async function runCartFlow(page, isMobile) {
    let assertions = 0;
    const assert = (condition, msg) => {
        if (!condition) throw new Error(`Assertion failed: ${msg}`);
        console.log(`PASS: ${msg}`);
        assertions++;
    };

    // Test permanent collections
    await page.goto('http://localhost:4173/collections/bracelets-1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    const colUrlMatches = page.url() === 'http://localhost:4173/collections/bracelets-1';
    assert(colUrlMatches, 'URL matches permanent collection route');
    const colH1 = await page.$eval('h1', el => el.innerText);
    assert(colH1 === 'Bracelets', 'Collection H1 is correct');
    
    // Check backwards compatibility
    await page.goto('http://localhost:4173/?filter=category&type=Anklets', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    const legacyUrlMatches = page.url().includes('?filter=category&type=Anklets');
    assert(legacyUrlMatches, 'Legacy filter URL remains functional and does not redirect');
    
    // Check invalid collection
    await page.goto('http://localhost:4173/collections/doesnotexist', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    const notFoundText = await page.$eval('h1', el => el.innerText);
    assert(notFoundText === 'Collection Not Found', 'Invalid collection shows Not Found');

    // Go to home
    await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // 1. Select an explicitly available product card and record details
    const productInfo = await page.evaluate(() => {
        const availableCard = Array.from(document.querySelectorAll('[data-testid="product-card"]'))
            .find(card => card.getAttribute('data-available') === 'true');
        
        if (!availableCard) return null;
        
        const titleEl = availableCard.querySelector('[data-testid="product-title"]');
        const priceEl = availableCard.querySelector('[data-testid="product-price"]');
        const link = availableCard.querySelector('a.product-info');
        
        return {
            title: titleEl.innerText,
            price: priceEl.innerText.replace('$', ''),
            url: link.href
        };
    });
    
    assert(productInfo !== null, 'Found an available product card');

    // 2. Open exact product and assert
    await page.goto(productInfo.url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    
    const urlMatches = page.url() === productInfo.url;
    assert(urlMatches, 'URL contains the expected handle');
    
    const h1Title = await page.$eval('h1', el => el.innerText);
    assert(h1Title === productInfo.title, 'H1 equals the expected product title');
    
    const addToCartBtn = await page.$('[data-testid="add-to-cart-btn"]');
    assert(addToCartBtn !== null, 'Add to Cart button exists');
    
    const btnText = await page.evaluate(el => el.innerText, addToCartBtn);
    console.log(`Button text is: "${btnText}"`);
    assert(btnText.trim().toLowerCase() === 'add to cart', 'Button text is correct');
    
    const btnDisabled = await page.evaluate(el => el.disabled, addToCartBtn);
    assert(!btnDisabled, 'Button is not disabled');
    
    // 3. Add to cart and assert
    await wait(500); // ensure hydration
    await page.click('[data-testid="add-to-cart-btn"]');
    await wait(1000); // wait for drawer animation
    
    await page.waitForSelector('[data-testid="cart-drawer"]', { visible: true, timeout: 5000 });
    const drawerVisible = await page.$('[data-testid="cart-drawer"]') !== null;
    assert(drawerVisible, 'Cart drawer becomes visible');
    
    const drawerTitle = await page.$eval('[data-testid="cart-drawer"] h4', el => el.innerText);
    assert(drawerTitle === productInfo.title, 'The expected product title is inside the drawer');
    
    const quantityStr = await page.$eval('[data-testid="item-quantity"]', el => el.innerText);
    assert(quantityStr === '1', 'Quantity equals 1');
    
    const linePriceStr = await page.$eval('[data-testid="cart-drawer"] p', el => el.innerText); // this gets the first p which is price
    assert(linePriceStr.includes(productInfo.price), 'Line price matches the product price');
    
    let subtotalStr = await page.$eval('[data-testid="cart-subtotal"]', el => el.innerText);
    assert(subtotalStr.includes(productInfo.price), 'Subtotal matches the product price');
    
    // 4. Increment quantity and assert
    await page.click('button[aria-label="Increase quantity"]');
    await wait(1000);
    
    const quantityStr2 = await page.$eval('[data-testid="item-quantity"]', el => el.innerText);
    assert(quantityStr2 === '2', 'Quantity changes from 1 to 2');
    
    subtotalStr = await page.$eval('[data-testid="cart-subtotal"]', el => el.innerText);
    const expectedSubtotal = (parseFloat(productInfo.price) * 2).toFixed(2);
    assert(subtotalStr.includes(expectedSubtotal), 'Subtotal changes to exactly price x 2');
    
    // 5. Decrement quantity and assert
    await page.click('button[aria-label="Decrease quantity"]');
    await wait(1000);
    
    const quantityStr3 = await page.$eval('[data-testid="item-quantity"]', el => el.innerText);
    assert(quantityStr3 === '1', 'Quantity changes from 2 to 1');
    
    subtotalStr = await page.$eval('[data-testid="cart-subtotal"]', el => el.innerText);
    const originalPriceFormatted = parseFloat(productInfo.price).toFixed(2);
    assert(subtotalStr.includes(originalPriceFormatted), 'Subtotal returns to exactly the original product price');
    
    // 6. Remove the item and assert
    const removeBtnSelector = `button[aria-label="Remove ${productInfo.title} from cart"]`;
    await page.click(removeBtnSelector);
    await wait(1000);
    
    const itemExists = await page.$(removeBtnSelector) !== null;
    assert(!itemExists, 'Product disappears');
    
    const emptyState = await page.evaluate(() => {
        return document.body.innerText.includes('Your cart is empty.');
    });
    assert(emptyState, 'Empty-cart state is visible');
    
    if (!isMobile) {
        const badgeExists = await page.$('[data-testid="cart-badge"]') !== null;
        assert(!badgeExists, 'Badge updates appropriately (removed)');
    }
    
    // 7. Add the item again and refresh.
    // First close the drawer so we can click add again
    await page.click('button[aria-label="Close cart"]');
    await wait(500);
    await page.click('[data-testid="add-to-cart-btn"]');
    await wait(1000);
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Open drawer
    await page.click('button[aria-label="Open cart"]');
    await wait(1000);
    
    const drawerTitleAfterRefresh = await page.$eval('[data-testid="cart-drawer"] h4', el => el.innerText);
    assert(drawerTitleAfterRefresh === productInfo.title, 'Stored cart contains the expected product');
    
    const qtyAfterRefresh = await page.$eval('[data-testid="item-quantity"]', el => el.innerText);
    assert(qtyAfterRefresh === '1', 'Quantity remains correct');
    
    const subtotalAfterRefresh = await page.$eval('[data-testid="cart-subtotal"]', el => el.innerText);
    assert(subtotalAfterRefresh.includes(originalPriceFormatted), 'Subtotal remains correct');

    // 8. Checkout assertion
    let checkoutUrlObserved = null;
    await page.setRequestInterception(true);
    
    let isIntercepting = true;
    const requestListener = request => {
        if (!isIntercepting) {
            if (request.isInterceptResolutionHandled()) return;
            // If interception is still enabled globally but we want to ignore, continue
            if (page.isDragInterceptionEnabled || request.interceptResolutionState().action === 'AlreadyHandled') return;
            try { request.continue(); } catch (e) {}
            return;
        }
        
        try {
            if (request.isNavigationRequest() && request.frame() === page.mainFrame() && request.url() !== page.url()) {
                if (request.url().includes('myshopify.com/checkouts') || request.url().includes('myshopify.com/cart')) {
                    checkoutUrlObserved = request.url();
                    request.abort(); // Do not actually place an order or navigate away
                } else {
                    request.continue();
                }
            } else {
                request.continue();
            }
        } catch (e) {}
    };
    page.on('request', requestListener);

    await page.click('[data-testid="checkout-btn"]');
    
    // Wait for the checkoutUrlObserved
    for (let i = 0; i < 50; i++) {
        if (checkoutUrlObserved) break;
        await wait(100);
    }
    
    // Validate the checkout handoff WITHOUT ever logging the full URL, its
    // query string, or any cart/checkout tokens (_s, _y, keys, etc.).
    assert(checkoutUrlObserved !== null && checkoutUrlObserved.length > 0, 'A nonempty checkout handoff URL was observed');
    let coHost = '', coKind = '';
    try {
        const parsed = new URL(checkoutUrlObserved);
        coHost = parsed.hostname; // hostname only — no query string, no path tokens
        coKind = (parsed.pathname.split('/').filter(Boolean)[0] || '').replace(/[^a-z]/gi, '').toLowerCase();
    } catch (e) { /* leave blank so the assertions below fail loudly */ }
    assert(coHost.endsWith('myshopify.com'), 'Checkout host is the expected Shopify store');
    assert(['cart', 'checkout', 'checkouts'].includes(coKind), 'Checkout path is a valid cart/checkout path');
    // Sanitized classification only, e.g. "…myshopify.com/checkout/[redacted]".
    console.log(`PASS: Shopify checkout handoff URL validated (${coHost}/${coKind === 'checkouts' ? 'checkout' : coKind}/[redacted]).`);

    // Cleanup
    isIntercepting = false;
    page.off('request', requestListener);
    try { await page.setRequestInterception(false); } catch (e) {}
    page.removeAllListeners('request');

    return assertions;
}

async function runGiftCardGuardFlow(page) {
    let assertions = 0;
    const assert = (condition, msg) => {
        if (!condition) throw new Error(`Assertion failed: ${msg}`);
        console.log(`PASS: ${msg}`);
        assertions++;
    };

    console.log('Testing Gift Card Guard...');
    await page.goto('http://localhost:4173/product/dazzling-designz-gift-card', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });

    const guardMessage = await page.evaluate(() => {
        return document.body.innerText.includes('Gift cards are temporarily unavailable');
    });
    assert(guardMessage, 'Guard message is visible on the misconfigured product page');

    const addToCartBtn = await page.$('[data-testid="add-to-cart-btn"]');
    assert(addToCartBtn !== null, 'Add to Cart button is present');
    
    const btnDisabled = await page.evaluate(el => el.disabled, addToCartBtn);
    assert(btnDisabled, 'Add to Cart button is disabled for misconfigured product');

    const hasOffer = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (let script of scripts) {
            try {
                const data = JSON.parse(script.innerText);
                if (data['@type'] === 'Product' && data.offers) {
                    return true;
                }
            } catch (e) {}
        }
        return false;
    });
    assert(!hasOffer, 'No Offer schema is emitted for misconfigured product');

    return assertions;
}

(async () => {
    let serverProcess;
    let browser;
    try {
        console.log('Starting preview server...');
        serverProcess = spawn('npm', ['run', 'preview'], { shell: true, stdio: 'ignore' });
        
        await waitForServer('http://localhost:4173');
        console.log('Server is running on http://localhost:4173');

        browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        page.on('console', msg => console.log('BROWSER:', msg.text()));
        
        console.log('\n--- Testing Desktop ---');
        await page.setViewport({ width: 1280, height: 800 });
        const guardAssertions = await runGiftCardGuardFlow(page);
        console.log(`Guard tests passed. (${guardAssertions} assertions)`);

        const desktopAssertions = await runCartFlow(page, false);
        console.log(`Desktop tests passed. (${desktopAssertions} assertions)`);

        // --- Events Page Tests ---
        console.log('\n--- Testing Events Page ---');
        let evAssertions = 0;
        const evAssert = (cond, msg) => {
            if (!cond) throw new Error(`Events Assertion failed: ${msg}`);
            console.log(`PASS: ${msg}`);
            evAssertions++;
        };

        // Direct load
        await page.goto('http://localhost:4173/events', { waitUntil: 'networkidle0' });
        evAssert(page.url().includes('/events'), 'Events page loads at /events');

        // Refresh
        await page.reload({ waitUntil: 'networkidle0' });
        evAssert(page.url().includes('/events'), 'Events page survives refresh');

        // H1
        const evH1 = await page.$eval('h1', el => el.innerText);
        evAssert(evH1.includes('Community'), `Events H1 correct: "${evH1}"`);

        // Exactly 17 gallery items
        const galleryItems = await page.$$('[data-testid="gallery-item"]');
        evAssert(galleryItems.length === 17, `Exactly 17 gallery items present (found ${galleryItems.length})`);

        

        // All images have width & height
        const imgMissingDims = await page.$$eval('.gallery-grid img', imgs =>
            imgs.filter(img => !img.getAttribute('width') || !img.getAttribute('height')).map(img => img.src)
        );
        evAssert(imgMissingDims.length === 0, 'All gallery images have explicit width and height attributes');

        // Lead image is eager
        const leadLoading = await page.$eval('.gallery-grid img[fetchpriority="high"]', img => img.loading);
        evAssert(leadLoading === 'eager', 'Lead image has loading="eager"');

        // Non-lead images are lazy
        const lazyImgs = await page.$$eval('.gallery-grid img:not([fetchpriority="high"])', imgs =>
            imgs.filter(img => img.loading !== 'lazy').map(img => img.src)
        );
        evAssert(lazyImgs.length === 0, 'All non-lead gallery images have loading="lazy"');

        // All JPEG fallback sources resolve (200)
        const imgSrcs = await page.$$eval('.gallery-grid img', imgs => imgs.map(img => img.src));
        for (const src of imgSrcs) {
            const res = await fetch(src);
            evAssert(res.ok, `Image source resolves (${src.split('/').pop()})`);
        }

        // Declared intrinsic ratio must match the actual derivative ratio
        // (no single landscape ratio baked onto portrait photos). Force lazy
        // images to load, then compare declared vs natural dimensions.
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await wait(1500);
        const ratioProblems = await page.$$eval('.gallery-grid img', imgs => imgs.map(img => {
            const dw = parseInt(img.getAttribute('width'), 10);
            const dh = parseInt(img.getAttribute('height'), 10);
            const file = (img.currentSrc || img.src).split('/').pop();
            if (!dw || !dh) return { file, reason: 'missing-dims' };
            if (!img.naturalWidth || !img.naturalHeight) return null; // skip lazy/off-screen marquee images
            const declared = dw / dh;
            const natural = img.naturalWidth / img.naturalHeight;
            if (Math.abs(declared - natural) > 0.05) return { file, declared: declared.toFixed(3), natural: natural.toFixed(3) };
            return null;
        }).filter(Boolean));
        evAssert(ratioProblems.length === 0, `All gallery images declare a ratio matching their real derivative (${JSON.stringify(ratioProblems)})`);

        // No nonexistent 480px references anywhere in the events gallery.
        const gallery480 = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.gallery-grid img, .gallery-grid source'))
                .some(el => ((el.getAttribute('src') || '') + (el.getAttribute('srcset') || '')).includes('480w'))
        );
        evAssert(!gallery480, 'No 480w references in events gallery');

        // Homepage preview links to /events
        await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
        const evLink = await page.$eval('a[href="/events"]', el => el.innerText).catch(() => null);
        evAssert(evLink !== null, `Homepage has link to /events (text: "${evLink}")`);

        // Homepage Community preview: exactly three images
        const previewImgCount = await page.$$eval('.community-preview picture img', imgs => imgs.length);
        evAssert(previewImgCount === 3, `Homepage Community preview has exactly 3 images (found ${previewImgCount})`);

        // Every homepage preview source (avif/webp/jpeg) must exist and resolve 200
        const previewUrls = await page.evaluate(() => {
            const urls = new Set();
            const addFromSrcset = (val) => (val || '').split(',').forEach(part => {
                const u = part.trim().split(/\s+/)[0];
                if (u) urls.add(new URL(u, location.origin).href);
            });
            document.querySelectorAll('.community-preview picture source').forEach(s => addFromSrcset(s.getAttribute('srcset')));
            document.querySelectorAll('.community-preview picture img').forEach(img => {
                if (img.getAttribute('src')) urls.add(new URL(img.getAttribute('src'), location.origin).href);
                addFromSrcset(img.getAttribute('srcset'));
            });
            return Array.from(urls);
        });
        evAssert(previewUrls.length > 0, 'Homepage preview exposes image sources to validate');
        evAssert(!previewUrls.some(u => u.includes('480w')), 'No 480w references in homepage Community preview');
        for (const u of previewUrls) {
            const res = await fetch(u);
            evAssert(res.ok, `Homepage preview source resolves (${u.split('/').pop()})`);
        }

        // Content accuracy: no unverified claims / brand misspelling on home + events
        for (const [pageUrl, label] of [['http://localhost:4173', 'Homepage'], ['http://localhost:4173/events', 'Events']]) {
            await page.goto(pageUrl, { waitUntil: 'networkidle0' });
            const html = await page.content();
            evAssert(!/vendor showcase/i.test(html), `${label}: no "vendor showcase" claim`);
            evAssert(!/wearing Dazzling Designz/i.test(html), `${label}: no "wearing Dazzling Designz" product claim`);
            evAssert(!html.includes('Dazzling Designs'), `${label}: brand spelled "Designz" (no "Dazzling Designs")`);
        }

        // Invalid collection shows customer-friendly copy, not the developer note
        await page.goto('http://localhost:4173/collections/doesnotexist', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('h1', { timeout: 10000 });
        const invalidBody = await page.evaluate(() => document.body.innerText);
        evAssert(!/Status codes for invalid routes/i.test(invalidBody), 'Invalid collection hides developer status-code note');
        evAssert(/moved or renamed/i.test(invalidBody), 'Invalid collection shows customer-friendly copy');

        // Desktop nav has Community link
        const desktopNavEvLink = await page.$eval('.nav-links.desktop-only a[href="/events"]', el => el.innerText).catch(() => null);
        evAssert(desktopNavEvLink !== null, 'Desktop navigation has Community/Events link');

        // Footer has Community Events link
        const footerEvLink = await page.$eval('.site-footer a[href="/events"]', el => el.innerText).catch(() => null);
        evAssert(footerEvLink !== null, 'Footer has Community Events link');

        // Mobile nav has Community link
        const mobileBtn = await page.$('.icon-btn.mobile-only');
        if (mobileBtn) {
            await page.setViewport({ width: 375, height: 667, hasTouch: true });
            await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
            const menuBtn = await page.$('.icon-btn.mobile-only');
            if (menuBtn) {
                await menuBtn.click();
                await wait(300);
                const mobileNavEvLink = await page.$('.mobile-menu-overlay a[href="/events"]');
                evAssert(mobileNavEvLink !== null, 'Mobile navigation has Community/Events link');
                await page.setViewport({ width: 1280, height: 800 });
            }
        }

        // /events appears exactly once in sitemap
        const sitemapRes = await fetch('http://localhost:4173/sitemap.xml');
        const sitemapText = await sitemapRes.text();
        const eventsInSitemap = (sitemapText.match(/\/events</g) || []).length;
        evAssert(eventsInSitemap === 1, `/events appears exactly once in sitemap (found ${eventsInSitemap})`);

        // No original 3.7–6.4 MB files in dist
        const { readdirSync, statSync, existsSync } = await import('fs');
        const distEventsDir = new URL('./dist/images/events', import.meta.url).pathname;
        if (existsSync(distEventsDir)) {
            const distFiles = readdirSync(distEventsDir);
            const oversized = distFiles.filter(f => {
                const size = statSync(`${distEventsDir}/${f}`).size;
                return size > 1.5 * 1024 * 1024; // > 1.5 MB is suspicious for a derivative
            });
            evAssert(oversized.length === 0, `No originals (>1.5MB) in dist/images/events (found: ${oversized.join(', ')})`);
        }

        console.log(`Events tests passed. (${evAssertions} assertions)`);

        console.log('\n--- Testing Mobile ---');
        await page.goto('http://localhost:4173');
        await wait(1000);
        // Clear local storage to reset cart state for mobile run
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await wait(1000);
        
        await page.setViewport({ width: 375, height: 667, hasTouch: true });
        const mobileAssertions = await runCartFlow(page, true);
        console.log(`Mobile tests passed. (${mobileAssertions} assertions)`);

        console.log('\nALL TESTS PASSED');
    } catch (e) {
        console.error('TEST FAILED:', e);
        if (browser) {
            const pages = await browser.pages();
            if (pages.length > 0) {
                await pages[pages.length - 1].screenshot({ path: 'test-failure.png' });
                console.log('Screenshot saved to test-failure.png');
            }
        }
        process.exit(1);
    } finally {
        if (browser) await browser.close();
        if (serverProcess) {
            serverProcess.kill();
        }
        process.exit(0);
    }
})();
