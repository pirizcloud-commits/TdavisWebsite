/* global process */
// Verifies the sitemap generator FAILS CLOSED: on a simulated Shopify failure
// it must exit nonzero and must NOT overwrite an existing valid sitemap.
// This test needs no network — it drives the missing-credentials path, which
// fails before any fetch — so it is runnable in restricted environments.
import { spawnSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');

let failed = false;
const assert = (cond, msg) => {
  if (!cond) { console.error(`❌ FAIL: ${msg}`); failed = true; }
  else { console.log(`✅ PASS: ${msg}`); }
};

const hash = (p) => existsSync(p) ? createHash('sha256').update(readFileSync(p)).digest('hex') : null;

// Snapshot the current sitemap (restore it afterward no matter what).
const hadSitemap = existsSync(sitemapPath);
const original = hadSitemap ? readFileSync(sitemapPath) : null;

// Ensure a KNOWN-VALID sitemap exists so we can prove it is not overwritten.
mkdirSync(path.dirname(sitemapPath), { recursive: true });
const sentinel = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset><!-- sentinel-valid-sitemap --></urlset>';
writeFileSync(sitemapPath, sentinel);
const before = hash(sitemapPath);

try {
  // Run the generator with credentials explicitly blanked (simulated failure).
  const run = spawnSync('node', ['generate-sitemap.js'], {
    cwd: __dirname,
    encoding: 'utf8',
    env: {
      ...process.env,
      VITE_SHOPIFY_DOMAIN: '',
      VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN: '',
      SKIP_SITEMAP_GENERATION: '',
    },
  });

  assert(run.status !== 0, `Generator exits nonzero on simulated Shopify failure (exit=${run.status})`);

  const after = hash(sitemapPath);
  assert(before === after, 'Existing valid sitemap.xml is NOT overwritten on failure');
  assert(existsSync(sitemapPath), 'Existing sitemap.xml still present after failed run');

  // No leftover temp artifact.
  assert(!existsSync(`${sitemapPath}.tmp`), 'No leftover .tmp sitemap artifact');

  // Credentials must not be echoed to output.
  const out = `${run.stdout || ''}${run.stderr || ''}`;
  assert(!/X-Shopify-Storefront-Access-Token/i.test(out), 'No auth header name leaked in output');
} finally {
  // Restore the working tree exactly as we found it.
  if (hadSitemap) writeFileSync(sitemapPath, original);
  else rmSync(sitemapPath, { force: true });
}

if (failed) process.exit(1);
console.log('\n✅ ALL SITEMAP FAILURE TESTS PASSED');
