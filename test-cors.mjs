import fs from 'fs';
const domain = 'dazzling-designz-5373.myshopify.com';
const token = '4e0def04b3e9672c1f293d26977f048e';

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
  const endpoint = `https://${domain}/api/2024-01/graphql.json`;
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
  await testFetch('https://tdaviswebsite.pages.dev');
  await testFetch('https://elegant-designs.pages.dev');
}
run();
