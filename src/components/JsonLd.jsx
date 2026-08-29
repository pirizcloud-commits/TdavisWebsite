import React from 'react';

export default function JsonLd({ data }) {
  if (!data) return null;
  const jsonString = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
