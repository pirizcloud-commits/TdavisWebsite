/* global process */
// Manual Storefront API CORS probe.
// Run: node --env-file=.env.production test-cors.mjs
// Credentials are read from the environment — no secrets are hardcoded here.
import { SHOPIFY_API_VERSION } from './src/lib/shopifyApiVersion.js';

const domain = process.env.VITE_SHOPIFY_DOMAIN || '';
const token = process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';

if (!domain || !token) {
  console.error('Missing VITE_SHOPIFY_DOMAIN / VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN. Run: node --env-file=.env.production test-cors.mjs');
  process.exit(1);
}

const query = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

async function testFetch(origin) {
  const endpoint = `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
        'Origin': origin
      },
      body: JSON.stringify({ query, variables: { first: 20 } })
    });
    console.log(`[${origin}] Status: ${res.status}`);
    const json = await res.json();
    console.log(`[${origin}] Response data:`, Object.keys(json));
    if (json.errors) console.log(json.errors);
  } catch (error) {
    console.log(`[${origin}] Error:`, error.message);
  }
}

async function run() {
  await testFetch('http://localhost:5173');
  await testFetch('https://dazzlingdesignzllc.com');
}
run();
