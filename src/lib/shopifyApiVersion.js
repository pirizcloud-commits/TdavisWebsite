// Single source of truth for the Shopify Storefront API version.
//
// Imported by BOTH the browser storefront client (src/lib/ShopifyClient.js)
// and the build-time sitemap generator (generate-sitemap.js) so the two can
// never drift onto different versions. Change this one value to upgrade the
// API version across the entire project.
//
// This module intentionally contains only a plain string constant (no browser
// or Node-specific APIs), so it is safe to import from Vite-bundled client code
// and from standalone Node scripts alike.
//
// Current: 2026-07 (latest stable Storefront API version, released 2026-07-01).
// The project previously ran on an expired/unsupported release; do not roll back
// to any unsupported version. See the maintenance report for rollback guidance.
export const SHOPIFY_API_VERSION = '2026-07';
