/* global process */
// Shopify Storefront API version-consistency guard.
//
// Fails the build/CI if:
//   * the shared version constant is malformed or is the known-expired release
//   * any active source file hard-codes an /api/<version>/ endpoint literal
//     (all endpoints must derive from the shared SHOPIFY_API_VERSION constant)
//   * the browser client and the sitemap generator don't both source the
//     version from the shared module (i.e. they could drift)
//
// It scans project source only (never node_modules or the generated dist), and
// never prints file contents or credentials — only version strings and paths.
import { SHOPIFY_API_VERSION } from './src/lib/shopifyApiVersion.js';
import { readdirSync, statSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));
const SELF = 'test-shopify-api.mjs';
// Build the expired token from parts so this test file does not itself contain
// the literal string it forbids.
const EXPIRED = ['2024', '01'].join('-');

let failed = false;
const assert = (cond, msg) => {
  if (!cond) { console.error(`❌ FAIL: ${msg}`); failed = true; }
  else { console.log(`✅ PASS: ${msg}`); }
};

// 1. Shared constant sanity.
assert(/^\d{4}-\d{2}$/.test(SHOPIFY_API_VERSION), `Shared version constant is a valid YYYY-MM value (${SHOPIFY_API_VERSION})`);
assert(SHOPIFY_API_VERSION !== EXPIRED, `Shared version is not the expired ${EXPIRED} release (is ${SHOPIFY_API_VERSION})`);

// 2. Collect active source files (skip build output, deps, assets).
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'source-images', 'public']);
const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) { if (!SKIP_DIRS.has(entry)) walk(full); }
    else if (/\.(js|jsx|mjs)$/.test(entry) && entry !== SELF) files.push(full);
  }
})(root);

// 3. No hard-coded endpoint versions, and no expired-version string anywhere.
const literalRe = /\/api\/(\d{4}-\d{2})\//g;
const hardcoded = [];
const expiredHits = [];
for (const f of files) {
  const txt = readFileSync(f, 'utf8');
  let m;
  while ((m = literalRe.exec(txt)) !== null) hardcoded.push(`${path.relative(root, f)} -> ${m[1]}`);
  if (txt.includes(EXPIRED)) expiredHits.push(path.relative(root, f));
}
assert(hardcoded.length === 0, `No hard-coded /api/<version>/ endpoint literals in active code (found: ${hardcoded.join(', ') || 'none'})`);
assert(expiredHits.length === 0, `No expired ${EXPIRED} version string in active code (found in: ${expiredHits.join(', ') || 'none'})`);

// 4. Browser client and sitemap generator both derive the version from the shared module.
const clientTxt = readFileSync(path.join(root, 'src/lib/ShopifyClient.js'), 'utf8');
const sitemapTxt = readFileSync(path.join(root, 'generate-sitemap.js'), 'utf8');
assert(/shopifyApiVersion/.test(clientTxt) && /SHOPIFY_API_VERSION/.test(clientTxt), 'Browser client sources the version from the shared module');
assert(/shopifyApiVersion/.test(sitemapTxt) && /SHOPIFY_API_VERSION/.test(sitemapTxt), 'Sitemap generator sources the version from the shared module');

console.log(`\nStorefront API version in use: ${SHOPIFY_API_VERSION} (scanned ${files.length} source files)`);
if (failed) process.exit(1);
console.log('✅ ALL SHOPIFY API VERSION CONSISTENCY CHECKS PASSED');
