import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title, 
  description, 
  canonicalUrl, 
  ogImage = "https://dazzlingdesignzllc.com/dazzling_designz_logo_full.jpeg",
  jsonLd,
  noindex
}) {
  const siteTitle = 'Dazzling Designz';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex, follow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />
      
      {jsonLd && (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data).replace(/</g, '\\u003c')}
        </script>
      ))}
    </Helmet>
  );
}
