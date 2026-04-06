import React from 'react';

export default function JewelryCare() {
  return (
    <main className="page-container" style={{ padding: '80px 0' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '40px', letterSpacing: '4px', fontSize: '1.2rem' }}>
          JEWELRY CARE & INSTRUCTIONS
        </h1>
        
        <div style={{ 
            fontSize: '0.9rem', 
            lineHeight: '1.8', 
            color: 'var(--text-secondary)',
            textAlign: 'left'
        }}>
          <p style={{ marginBottom: '30px' }}>
            Each Dazzling Designz piece is thoughtfully crafted to reflect beauty, grace, and purpose. To preserve the elegance and longevity of your pearl bracelet, please follow these care instructions:
          </p>
          
          <ul style={{ marginBottom: '30px', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '15px' }}>
              <strong>Keep your piece away</strong> from water, perfumes, lotions, oils, and cosmetics
            </li>
            <li style={{ marginBottom: '15px' }}>
              <strong>Gently roll</strong> the bracelet on and off your wrist—avoid pulling or overstretching
            </li>
            <li style={{ marginBottom: '15px' }}>
              <strong>Store</strong> in a cool, dry place, preferably in a soft pouch or jewelry box
            </li>
            <li style={{ marginBottom: '15px' }}>
              <strong>Handle with care</strong> to protect the delicate pearls and meaningful charm details
            </li>
          </ul>
          
          <p style={{ fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
            May your piece remain as radiant as your faith and as timeless as your style.
          </p>
        </div>
      </div>
    </main>
  );
}
