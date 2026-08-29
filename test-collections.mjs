/* global process */
// Manual Storefront API probe for collections.
// Run: node --env-file=.env.production test-collections.mjs
// Credentials are read from the environment — no secrets are hardcoded here.
import { SHOPIFY_API_VERSION } from './src/lib/shopifyApiVersion.js';

const SHOPIFY_DOMAIN = process.env.VITE_SHOPIFY_DOMAIN || '';
const TOKEN = process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';

if (!SHOPIFY_DOMAIN || !TOKEN) {
  console.error('Missing VITE_SHOPIFY_DOMAIN / VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN. Run: node --env-file=.env.production test-collections.mjs');
  process.exit(1);
}

const query = `
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          handle
          title
        }
      }
    }
  }
`;

fetch(`https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': TOKEN,
  },
  body: JSON.stringify({ query, variables: { first: 20 } })
})
  .then(res => res.json())
  .then(json => {
    if (json.errors) console.error(json.errors);
    else console.log(JSON.stringify(json.data.collections.edges.map(e => e.node)));
  });
