/* global process */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SHOPIFY_API_VERSION } from './src/lib/shopifyApiVersion.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://dazzlingdesignzllc.com';
const API_VERSION = SHOPIFY_API_VERSION;
const outputPath = path.join(__dirname, 'public', 'sitemap.xml');

const SHOPIFY_DOMAIN = process.env.VITE_SHOPIFY_DOMAIN || '';
const SHOPIFY_TOKEN = process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const SKIP = process.env.SKIP_SITEMAP_GENERATION === 'true';

// Fail loudly and NEVER leave a partial/overwritten sitemap behind.
// (We only ever write via a temp file + atomic rename after full validation,
//  so an early exit here cannot corrupt an existing valid sitemap.)
function fail(message) {
  console.error(`[sitemap] ERROR: ${message}`);
  process.exit(1);
}

const getProductsQuery = `
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges { node { handle updatedAt } }
    }
  }
`;

const getCollectionsQuery = `
  query getCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges { node { handle updatedAt products(first: 1) { edges { node { id } } } } }
    }
  }
`;

// Single fetch helper: throws (never returns partial) on network error,
// non-2xx status, or GraphQL errors. Deliberately does NOT print the token
// or the raw response body — only a sanitized status/first-error message.
async function shopifyGraphQL(query, variables) {
  const endpoint = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;
  let res;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (e) {
    throw new Error(`Network error contacting Shopify (${e.code || e.name || 'fetch failed'}).`);
  }

  if (!res.ok) {
    throw new Error(`Shopify Storefront API returned HTTP ${res.status}.`);
  }

  let body;
  try {
    body = await res.json();
  } catch {
    throw new Error('Shopify response was not valid JSON.');
  }

  if (Array.isArray(body.errors) && body.errors.length > 0) {
    const first = body.errors[0]?.message || 'unknown error';
    throw new Error(`Shopify GraphQL returned ${body.errors.length} error(s): ${first}`);
  }

  if (!body.data) {
    throw new Error('Shopify response contained no data.');
  }

  return body.data;
}

async function fetchAllProducts() {
  const products = [];
  let hasNextPage = true;
  let cursor = null;
  while (hasNextPage) {
    const data = await shopifyGraphQL(getProductsQuery, { first: 250, after: cursor });
    const conn = data.products;
    if (!conn) throw new Error('Products connection missing from Shopify response.');
    products.push(...conn.edges.map(e => e.node));
    hasNextPage = conn.pageInfo?.hasNextPage;
    cursor = conn.pageInfo?.endCursor;
  }
  return products;
}

async function fetchAllCollections() {
  const collections = [];
  let hasNextPage = true;
  let cursor = null;
  while (hasNextPage) {
    const data = await shopifyGraphQL(getCollectionsQuery, { first: 250, after: cursor });
    const conn = data.collections;
    if (!conn) throw new Error('Collections connection missing from Shopify response.');
    collections.push(...conn.edges.map(e => e.node));
    hasNextPage = conn.pageInfo?.hasNextPage;
    cursor = conn.pageInfo?.endCursor;
  }
  return collections;
}

const escapeXml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[c]));
};

async function generateSitemap() {
  // Opt-in skip for local development only. It is explicit, logs clearly, and
  // does NOT masquerade as a fresh generation — the existing sitemap (if any)
  // is left exactly as-is.
  if (SKIP) {
    console.warn(
      '[sitemap] SKIP_SITEMAP_GENERATION=true — skipping generation. ' +
      'Existing public/sitemap.xml (if present) is left unchanged. ' +
      'This flag must NOT be used for production/Cloudflare builds.'
    );
    process.exit(0);
  }

  // Strict credential check before any network call.
  if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
    fail(
      'Missing Shopify credentials (VITE_SHOPIFY_DOMAIN and/or ' +
      'VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN). Provide them for a production ' +
      'build, or set SKIP_SITEMAP_GENERATION=true for local builds.'
    );
  }

  const products = await fetchAllProducts();
  const collections = await fetchAllCollections();

  // The storefront is expected to have products AND populated collections.
  // Refuse to publish a sitemap that is missing either — that is the exact
  // failure mode that previously produced a static-only sitemap silently.
  if (products.length === 0) {
    fail('Shopify returned 0 products; refusing to write a product-less sitemap.');
  }

  const populatedCollections = collections.filter(
    c => c.handle !== 'frontpage' && (c.products?.edges?.length || 0) > 0
  );
  if (populatedCollections.length === 0) {
    fail('Shopify returned 0 populated collections; refusing to write a collection-less sitemap.');
  }

  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/about', changefreq: 'monthly', priority: '0.8' },
    { url: '/jewelry-care', changefreq: 'monthly', priority: '0.8' },
    { url: '/events', changefreq: 'monthly', priority: '0.8' },
    { url: '/policies/sales-and-shipping', changefreq: 'yearly', priority: '0.5' },
    { url: '/policies/terms', changefreq: 'yearly', priority: '0.5' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const addedUrls = new Set();
  const addUrl = (url, lastmod, changefreq, priority) => {
    const cleanUrl = escapeXml(url);
    if (addedUrls.has(cleanUrl)) return;
    addedUrls.add(cleanUrl);
    xml += `  <url>\n    <loc>${cleanUrl}</loc>\n`;
    if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
  };

  for (const page of staticPages) {
    addUrl(`${DOMAIN}${page.url}`, null, page.changefreq, page.priority);
  }
  for (const collection of populatedCollections) {
    addUrl(`${DOMAIN}/collections/${collection.handle}`, collection.updatedAt, 'weekly', '0.9');
  }
  for (const product of products) {
    addUrl(`${DOMAIN}/product/${product.handle}`, product.updatedAt, 'weekly', '0.8');
  }

  xml += `</urlset>`;

  // Post-build validation: /events must appear exactly once.
  const eventsCount = (xml.match(/\/events</g) || []).length;
  if (eventsCount !== 1) {
    fail(`Expected /events exactly once in sitemap, found ${eventsCount}.`);
  }

  // Atomic write: only touch the real file after everything above validated.
  const tmpPath = `${outputPath}.tmp`;
  fs.writeFileSync(tmpPath, xml);
  fs.renameSync(tmpPath, outputPath);

  console.log(
    `[sitemap] OK — ${addedUrls.size} URLs ` +
    `(${staticPages.length} static, ${populatedCollections.length} collections, ${products.length} products).`
  );
}

generateSitemap().catch((e) => fail(e.message));
