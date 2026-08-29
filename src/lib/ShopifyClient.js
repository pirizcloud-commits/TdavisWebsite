import { SHOPIFY_API_VERSION } from './shopifyApiVersion.js';

const SHOPIFY_STOREFRONT_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN || '';

export async function shopifyFetch({ query, variables }) {
  const endpoint = `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    return {
      status: result.status,
      body: await result.json(),
    };
  } catch (error) {
    console.error('Error fetching data from Shopify:', error);
    return {
      status: 500,
      error: 'Error receiving data',
    };
  }
}

export const getProductsQuery = `
  query getProducts($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse, query: $query) {
      edges {
        node {
          id
          title
          handle
          availableForSale
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          media(first: 10) {
            edges {
              node {
                mediaContentType
                ... on MediaImage {
                  image {
                    url
                    altText
                  }
                }
                ... on Video {
                  sources {
                    format
                    mimeType
                    url
                  }
                }
              }
            }
          }
          variants(first: 50) {
            edges {
              node {
                price { amount }
                selectedOptions { name value }
              }
            }
          }
        }
      }
    }
  }
`;

export const getCollectionsQuery = `
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

export const getCollectionProductsQuery = `
  query getCollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      title
      description
      handle
      image {
        url
        altText
      }
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            availableForSale
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 10) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            media(first: 10) {
              edges {
                node {
                  mediaContentType
                  ... on MediaImage {
                    image {
                      url
                      altText
                    }
                  }
                  ... on Video {
                    sources {
                      format
                      mimeType
                      url
                    }
                  }
                }
              }
            }
            variants(first: 50) {
              edges {
                node {
                  price { amount }
                  selectedOptions { name value }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const getProductByHandleQuery = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      description
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      media(first: 10) {
        edges {
          node {
            mediaContentType
            ... on MediaImage {
              image {
                url
                altText
              }
            }
            ... on Video {
              sources {
                format
                mimeType
                url
              }
            }
          }
        }
      }
      variants(first: 50) {
        edges {
          node {
            id
            sku
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

export const cartCreateMutation = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;
