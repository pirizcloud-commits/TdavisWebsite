import React from 'react';

export default function About() {
  return (
    <main className="page-container" style={{ padding: '80px 0' }}>
      <div className="container">
        <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '60px', letterSpacing: '4px', fontSize: '1.2rem' }}>
          TAMARA DAVIS
        </h1>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          gap: '60px', 
          maxWidth: '1000px', 
          margin: '0 auto', 
          alignItems: 'flex-start',
          flexWrap: 'wrap'
        }}>
          
          <div style={{ flex: '1 1 400px' }}>
            <img 
              src="/tamara_davis.png" 
              alt="Tamara Davis" 
              style={{ 
                  width: '100%', 
                  height: 'auto',
                  display: 'block',
                  filter: 'brightness(0.9)',
                  objectFit: 'cover'
              }} 
            />
          </div>
          
          <div style={{ 
              flex: '1 1 400px',
              fontSize: '0.9rem', 
              lineHeight: '1.8', 
              color: 'var(--text-secondary)',
              textAlign: 'left'
          }}>
            <p style={{ marginBottom: '20px' }}>
              Tamara Davis is the visionary behind Dazzling Designz, a custom jewelry brand where luxury meets faith and purpose. A native Californian with deep North Carolina roots, Tamara brings a unique blend of bold style, cultural influence, and spiritual inspiration into every piece she creates.
            </p>
            <p style={{ marginBottom: '20px' }}>
              Driven by her love for God and passion for design, Tamara crafts jewelry that goes beyond beauty—each piece is a reflection of faith, strength, and individuality. Her mission is to create dazzling, high-quality designs that not only elevate your style but also serve as meaningful reminders of who you are and what you stand for.
            </p>
            <p>
              At Dazzling Designz, every creation is intentional, elegant, and made to shine.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
