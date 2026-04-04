import fs from 'fs';
const SHOPIFY_DOMAIN = 'dazzling-designz-5373.myshopify.com';
const TOKEN = '4e0def04b3e9672c1f293d26977f048e';

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
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
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
