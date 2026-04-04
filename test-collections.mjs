import fs from 'fs';
const SHOPIFY_DOMAIN = 'dazzling-designz-5373.myshopify.com';
const TOKEN = '4e0def04b3e9672c1f293d26977f048e';
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
fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
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
