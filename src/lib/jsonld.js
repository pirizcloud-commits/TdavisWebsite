export const DOMAIN = 'https://dazzlingdesignzllc.com';

export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": `${DOMAIN}/#organization`,
  "name": "Dazzling Designz",
  "url": DOMAIN,
  "logo": `${DOMAIN}/dazzling_designz_logo_full.jpeg`,
  "sameAs": [
    "https://www.instagram.com/dazzlingdesignz_bytd/",
    "https://www.tiktok.com/@dazzlingdesignz_bytd"
  ]
});

export const getWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${DOMAIN}/#website`,
  "url": DOMAIN,
  "name": "Dazzling Designz",
  "publisher": {
    "@id": `${DOMAIN}/#organization`
  }
});

export const getAboutPageSchema = () => removeEmpty({
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${DOMAIN}/about#webpage`,
  "url": `${DOMAIN}/about`,
  "name": "About Tamara Davis - Dazzling Designz",
  "publisher": {
    "@id": `${DOMAIN}/#organization`
  },
  "mainEntity": {
    "@type": "Person",
    "name": "Tamara Davis",
    "jobTitle": "Owner and Creator",
    "worksFor": {
      "@id": `${DOMAIN}/#organization`
    }
  }
});

export const getBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

// Removes empty strings, null, undefined, empty arrays, and empty objects recursively
const removeEmpty = (obj) => {
  if (Array.isArray(obj)) {
    const arr = obj.map(removeEmpty).filter(val => val !== null && val !== undefined && val !== '');
    return arr.length > 0 ? arr : undefined;
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = Object.entries(obj).reduce((acc, [k, v]) => {
      const val = removeEmpty(v);
      if (val !== undefined && val !== null && val !== '') {
        acc[k] = val;
      }
      return acc;
    }, {});
    return Object.keys(newObj).length > 0 ? newObj : undefined;
  }
  return obj;
};

// Strips HTML tags and decodes entities safely
const stripHtml = (html) => {
  if (!html) return undefined;
  // Basic entity decoding mapping
  const entities = {
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' '
  };
  
  let decoded = html.replace(/&amp;|&quot;|&#39;|&lt;|&gt;|&nbsp;/g, match => entities[match] || match);
  let stripped = decoded.replace(/<[^>]*>?/gm, '').trim();
  
  return stripped.length > 0 ? stripped : undefined;
};

export const getProductSchema = (product, productUrl) => {
  if (!product) return null;
  
  // Use primary variant for all variant-level data to avoid mismatching price and availability
  const variant = product.variants?.edges?.[0]?.node;
  const isAvailable = variant?.availableForSale;
  const sku = variant?.sku;
  
  let offer = undefined;
  if (variant?.price?.amount) {
    offer = {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": variant.price.currencyCode,
      "price": parseFloat(variant.price.amount).toFixed(2),
      "availability": isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@id": `${DOMAIN}/#organization`
      }
    };
  }

  const images = product.images?.edges?.map(e => e.node?.url).filter(Boolean) || [];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    "name": product.title,
    "description": stripHtml(product.descriptionHtml || product.description),
    "image": images.length > 0 ? images : undefined,
    "sku": sku,
    "url": productUrl,
    "brand": {
      "@type": "Brand",
      "name": "Dazzling Designz"
    },
    "offers": offer
  };

  return removeEmpty(schema);
};
