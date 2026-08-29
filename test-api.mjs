/* global process */
// Manual Storefront API probe for products.
// Run: node --env-file=.env.production test-api.mjs
// Credentials are read from the environment — no secrets are hardcoded here.
import { SHOPIFY_API_VERSION } from './src/lib/shopifyApiVersion.js';

const SHOPIFY_DOMAIN = process.env.VITE_SHOPIFY_DOMAIN || '';
const TOKEN = process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';

if (!SHOPIFY_DOMAIN || !TOKEN) {
  console.error('Missing VITE_SHOPIFY_DOMAIN / VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN. Run: node --env-file=.env.production test-api.mjs');
  process.exit(1);
}

const query = `
  query getProducts($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse, query: $query) {
      edges {
        node {
          title
        }
      }
    }
  }
`;

async function fetchProducts(variables) {
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (json.errors) console.error(json.errors);
  else console.log(JSON.stringify(json.data.products.edges.map(e => e.node.title)));
}

async function run() {
  console.log('--- ALL ---');
  await fetchProducts({ first: 20 });
  console.log('\n--- NEW ARRIVALS ---');
  await fetchProducts({ first: 8, sortKey: 'CREATED_AT', reverse: true });
}
run();
