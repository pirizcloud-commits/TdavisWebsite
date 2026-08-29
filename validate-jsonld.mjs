import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import assert from 'assert';

let hasErrors = false;

const reportError = (msg) => {
    console.error(`❌ ERROR: ${msg}`);
    hasErrors = true;
};

const reportPass = (msg) => {
    console.log(`✅ PASS: ${msg}`);
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const waitForServer = async (url) => {
    for (let i = 0; i < 30; i++) {
        try {
            const res = await fetch(url);
            if (res.ok) return;
        } catch (e) { }
        await wait(500);
    }
    throw new Error('Server did not start in time');
};

const extractJsonLd = async (page, url, name) => {
    console.log(`\n--- Validating ${name} (${url}) ---`);
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    const jsonLds = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        return scripts.map(s => {
            try {
                return JSON.parse(s.textContent);
            } catch (e) {
                return { error: 'Invalid JSON', content: s.textContent };
            }
        });
    });

    const flatSchemas = [];
    jsonLds.forEach(data => {
        if (Array.isArray(data)) {
            flatSchemas.push(...data);
        } else {
            flatSchemas.push(data);
        }
    });

    const typeCounts = {};
    for (const entity of flatSchemas) {
        if (entity.error) {
            reportError(`Invalid JSON-LD syntax: ${entity.content}`);
            continue;
        }

        const type = entity['@type'];
        typeCounts[type] = (typeCounts[type] || 0) + 1;

        const str = JSON.stringify(entity);
        if (str.includes('""') || str.includes('null')) {
            reportError(`Entity ${type} contains empty string or null`);
        }
        if (str.includes('0.00') && !str.includes('"price":"0.00"')) {
            // we will explicitly check fabricated 0.00 later
        }
        if (str.includes('undefined')) {
            reportError(`Entity ${type} contains undefined string`);
        }
        if (str.includes('MerchantReturnPolicy')) {
            reportError(`Unexpected MerchantReturnPolicy found in ${type}`);
        }
    }

    for (const [type, count] of Object.entries(typeCounts)) {
        if (count > 1) {
            reportError(`Duplicate entity found for type ${type} (${count} instances)`);
        }
    }

    if (flatSchemas.length === 0 && name !== 'Invalid Policy (404)' && name !== 'Invalid Collection (404)' && name !== 'Empty Collection' && name !== 'Frontpage Collection') {
        reportError(`Missing expected schemas on ${name}`);
    }

    return flatSchemas;
};

(async () => {
    let serverProcess;
    let browser;
    try {
        console.log('Starting preview server...');
        serverProcess = spawn('npm', ['run', 'preview'], { shell: true, stdio: 'ignore' });
        await waitForServer('http://localhost:4173');

        browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        
        page.on('pageerror', err => reportError(`Uncaught browser error: ${err.message}`));
        
        await extractJsonLd(page, 'http://localhost:4173/', 'Homepage');
        await extractJsonLd(page, 'http://localhost:4173/about', 'About');
        await extractJsonLd(page, 'http://localhost:4173/jewelry-care', 'Jewelry Care');
        await extractJsonLd(page, 'http://localhost:4173/policies/sales-and-shipping', 'Sales & Shipping policy');
        await extractJsonLd(page, 'http://localhost:4173/policies/terms', 'Terms');
        
        const invalidPolicySchemas = await extractJsonLd(page, 'http://localhost:4173/policies/invalid-policy-123', 'Invalid Policy (404)');
        if (invalidPolicySchemas.some(s => s['@type'] === 'BreadcrumbList')) {
            reportError('BreadcrumbList was emitted for a nonexistent policy.');
        } else {
            reportPass('No BreadcrumbList on invalid policy');
        }

        // Find products
        await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
        const products = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('[data-testid="product-card"]'));
            const available = cards.find(c => c.getAttribute('data-available') === 'true');
            const soldOut = cards.find(c => c.getAttribute('data-available') === 'false');
            return {
                availableUrl: available ? available.querySelector('a')?.href : null,
                soldOutUrl: soldOut ? soldOut.querySelector('a')?.href : null
            };
        });

        const validateProductPage = async (url, typeName) => {
            if (!url) {
                console.log(`\nNo ${typeName} found to test.`);
                return;
            }
            const schemas = await extractJsonLd(page, url, typeName);
            const productSchema = schemas.find(s => s['@type'] === 'Product');
            
            if (!productSchema) {
                reportError(`Missing Product schema on ${typeName}`);
                return;
            }

            const visibleData = await page.evaluate(() => {
                const title = document.querySelector('h1')?.innerText;
                const priceText = document.querySelector('h1 + p')?.innerText;
                const btn = document.querySelector('[data-testid="add-to-cart-btn"]');
                const btnText = btn?.innerText;
                const images = Array.from(document.querySelectorAll('img')).map(img => img.src);
                return { title, priceText, btnText, images };
            });

            if (productSchema.name !== visibleData.title) {
                reportError(`Schema name "${productSchema.name}" does not match visible title "${visibleData.title}"`);
            } else {
                reportPass(`Product name matches visible title: ${productSchema.name}`);
            }

            const expectedUrl = url.split('#')[0].replace('http://localhost:4173', 'https://dazzlingdesignzllc.com');
            if (productSchema.url !== expectedUrl) {
                reportError(`Schema canonical URL "${productSchema.url}" does not match expected "${expectedUrl}"`);
            } else {
                reportPass(`Product URL is canonical`);
            }

            if (visibleData.priceText === 'Unavailable') {
                if (productSchema.offers) {
                    reportError('Schema contains offers but visible price is Unavailable');
                } else {
                    reportPass('Offers correctly omitted for missing price');
                }
            } else if (visibleData.priceText?.startsWith('$')) {
                const visiblePrice = visibleData.priceText.replace('$', '').trim();
                if (!productSchema.offers) {
                    reportError('Schema is missing offers but price is visible');
                } else {
                    const schemaPrice = productSchema.offers.price;
                    if (schemaPrice !== visiblePrice) {
                        reportError(`Schema price ${schemaPrice} does not match visible price ${visiblePrice}`);
                    } else {
                        reportPass(`Price matches: ${schemaPrice}`);
                    }
                    if (schemaPrice === '0.00' && visiblePrice !== '0.00') {
                         reportError('Fabricated 0.00 price found in schema');
                    }
                }
            }

            if (productSchema.offers) {
                const schemaAvail = productSchema.offers.availability;
                const visibleAvail = (visibleData.btnText || '').toLowerCase().trim() === 'add to cart' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
                if (schemaAvail !== visibleAvail) {
                    reportError(`Schema availability ${schemaAvail} does not match visible availability ${visibleAvail}`);
                } else {
                    reportPass(`Availability matches: ${schemaAvail}`);
                }
            }

            if (productSchema.image) {
                const images = Array.isArray(productSchema.image) ? productSchema.image : [productSchema.image];
                if (images.some(img => img.includes('dazzling_designz_logo_full.jpeg'))) {
                    reportError('Store logo used as product image in schema');
                } else {
                    reportPass('No store logo in product images');
                }
            }
        };

        await validateProductPage(products.availableUrl, 'Available Product');
        await validateProductPage(products.soldOutUrl, 'Sold Out Product');

        // === Test 6: Populated Collection ===
        const popColSchema = await extractJsonLd(page, 'http://localhost:4173/collections/bracelets-1', 'Populated Collection');
        const popColPage = popColSchema.find(s => s['@type'] === 'CollectionPage');
        if (!popColPage) reportError('Missing CollectionPage schema on populated collection');
        else {
            if (popColPage.url !== 'https://dazzlingdesignzllc.com/collections/bracelets-1') reportError('Incorrect CollectionPage url on populated collection');
            reportPass('Populated collection has CollectionPage schema with correct URL');
        }
        const popColCanonical = await page.$eval('link[rel="canonical"]', el => el.href).catch(() => null);
        if (popColCanonical !== 'https://dazzlingdesignzllc.com/collections/bracelets-1') reportError(`Incorrect canonical tag on populated collection: ${popColCanonical}`);
        else reportPass('Populated collection has correct canonical tag');
        const popColBreadcrumb = popColSchema.find(s => s['@type'] === 'BreadcrumbList');
        if (!popColBreadcrumb) reportError('Missing BreadcrumbList on populated collection');
        else reportPass('Populated collection has BreadcrumbList');

        // === Test 7: Empty Collection ===
        const emptyColSchema = await extractJsonLd(page, 'http://localhost:4173/collections/earrings', 'Empty Collection');
        if (emptyColSchema.find(s => s['@type'] === 'CollectionPage')) {
            reportError('CollectionPage schema emitted on empty collection');
        } else {
            reportPass('No CollectionPage schema on empty collection');
        }
        if (emptyColSchema.find(s => s['@type'] === 'BreadcrumbList')) {
            reportError('BreadcrumbList emitted on empty collection');
        } else {
            reportPass('No BreadcrumbList on empty collection');
        }
        const emptyColCanonical = await page.$eval('link[rel="canonical"]', el => el.href).catch(() => null);
        if (emptyColCanonical) reportError('Canonical tag emitted on empty collection');
        else reportPass('No canonical tag on empty collection');

        // === Test 8: Invalid Collection ===
        const invalidColSchema = await extractJsonLd(page, 'http://localhost:4173/collections/doesnotexist', 'Invalid Collection (404)');
        if (invalidColSchema.find(s => s['@type'] === 'CollectionPage')) {
            reportError('CollectionPage schema emitted on invalid collection');
        } else {
            reportPass('No CollectionPage schema on invalid collection');
        }
        if (invalidColSchema.find(s => s['@type'] === 'BreadcrumbList')) {
            reportError('BreadcrumbList emitted on invalid collection');
        } else {
            reportPass('No BreadcrumbList on invalid collection');
        }
        const invalidColCanonical = await page.$eval('link[rel="canonical"]', el => el.href).catch(() => null);
        if (invalidColCanonical) reportError('Canonical tag emitted on invalid collection');
        else reportPass('No canonical tag on invalid collection');

        // === Test 9: Frontpage Collection ===
        const fpColSchema = await extractJsonLd(page, 'http://localhost:4173/collections/frontpage', 'Frontpage Collection');
        if (fpColSchema.find(s => s['@type'] === 'CollectionPage')) {
            reportError('CollectionPage schema emitted on frontpage collection');
        } else {
            reportPass('No CollectionPage schema on frontpage collection');
        }
        const fpColCanonical = await page.$eval('link[rel="canonical"]', el => el.href).catch(() => null);
        if (fpColCanonical !== 'https://dazzlingdesignzllc.com/') reportError(`Incorrect canonical tag on frontpage collection: ${fpColCanonical}`);
        else reportPass('Correct canonical tag on frontpage collection');

        // === Test 10: Static Sitemap URLs Audit ===
        const staticUrls = ['/', '/about', '/jewelry-care', '/policies/sales-and-shipping', '/policies/terms', '/events'];
        for (const url of staticUrls) {
            await page.goto(`http://localhost:4173${url}`, { waitUntil: 'domcontentloaded' });
            
            // Check for Not Found H1 or H2
            const notFoundText = await page.$$eval('h1, h2', els => els.map(el => el.innerText).find(text => text.includes('Not Found') || text.includes('Error')));
            if (notFoundText) {
                reportError(`Static sitemap URL ${url} renders a Not Found/Error state: ${notFoundText}`);
            } else {
                reportPass(`Static sitemap URL ${url} loads valid content`);
            }
        }

        // === Test 11: Events Page JSON-LD ===
        console.log('\n--- Validating Events Page (http://localhost:4173/events) ---');
        const { flatSchemas: eventsSchemas } = await (async () => {
            await page.goto('http://localhost:4173/events', { waitUntil: 'networkidle0' });
            const jsonLds = await page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
                return scripts.map(s => { try { return JSON.parse(s.textContent); } catch(e) { return null; } }).filter(Boolean);
            });
            const flat = [];
            jsonLds.forEach(d => { if (Array.isArray(d)) flat.push(...d); else flat.push(d); });
            return { flatSchemas: flat };
        })();

        const eventsWebPage = eventsSchemas.find(s => s['@type'] === 'WebPage');
        if (!eventsWebPage) reportError('Events page missing WebPage schema');
        else reportPass('Events page has WebPage schema');

        const eventsBreadcrumb = eventsSchemas.find(s => s['@type'] === 'BreadcrumbList');
        if (!eventsBreadcrumb) reportError('Events page missing BreadcrumbList schema');
        else reportPass('Events page has BreadcrumbList schema');

        const eventsEventSchema = eventsSchemas.find(s => s['@type'] === 'Event');
        if (eventsEventSchema) reportError('Events page must not emit an Event schema (event facts are not confirmed)');
        else reportPass('Events page correctly has no Event schema');

        const eventsCanonical = await page.$eval('link[rel="canonical"]', el => el.href).catch(() => null);
        if (eventsCanonical !== 'https://dazzlingdesignzllc.com/events') reportError(`Events page missing or wrong canonical: ${eventsCanonical}`);
        else reportPass('Events page has correct self-referencing canonical');

        const eventsH1 = await page.$eval('h1', el => el.innerText).catch(() => null);
        if (!eventsH1 || !eventsH1.includes('Community')) reportError(`Events page H1 is missing or incorrect: ${eventsH1}`);
        else reportPass(`Events page H1 is correct: "${eventsH1}"`);

    } catch (e) {
        reportError(`Script exception: ${e.message}`);
    } finally {
        if (browser) await browser.close();
        if (serverProcess) serverProcess.kill();

        if (hasErrors) {
            console.error('\n❌ VALIDATION FAILED WITH ERRORS.');
            process.exit(1);
        } else {
            console.log('\n✅ ALL VALIDATIONS PASSED');
            process.exit(0);
        }
    }
})();
