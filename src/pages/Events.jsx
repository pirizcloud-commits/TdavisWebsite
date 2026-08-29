import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { getBreadcrumbSchema } from '../lib/jsonld'
import { EVENTS } from '../lib/eventsGallery'

const IMG = (basename) => `/images/events/${basename}.jpeg`;

function eventMeta(ev) {
  const parts = [ev.date, ev.location].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'Details coming soon';
}

export default function Events() {
  const pageUrl = 'https://dazzlingdesignzllc.com/events';
  const pageDescription = 'See Dazzling Designz out in the community, sharing handcrafted jewelry and connecting with guests. Browse each event and its photo album.';

  const [openEvent, setOpenEvent] = useState(null); // event object or null
  const [lightbox, setLightbox] = useState(null);   // { src, alt } or null

  // Lock body scroll while a modal is open, and wire up Escape to close.
  useEffect(() => {
    const anyOpen = openEvent || lightbox;
    document.body.style.overflow = anyOpen ? 'hidden' : '';
    function onKey(e) {
      if (e.key === 'Escape') { if (lightbox) setLightbox(null); else setOpenEvent(null); }
    }
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [openEvent, lightbox]);

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://dazzlingdesignzllc.com/' },
    { name: 'Events & Community', url: pageUrl }
  ]);
  const webPageSchema = {
    '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${pageUrl}#webpage`,
    'url': pageUrl, 'name': 'Dazzling Designz in the Community', 'description': pageDescription,
    'publisher': { '@id': 'https://dazzlingdesignzllc.com/#organization' }
  };

  return (
    <main>
      <SEO
        title="Events & Community"
        description={pageDescription}
        canonicalUrl={pageUrl}
        ogImage="https://dazzlingdesignzllc.com/images/events/dazzling-designz-event-jewelry-display.jpeg"
        jsonLd={[breadcrumbs, webPageSchema]}
      />

      <style>{`
        .ev-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        .ev-card { background: var(--surface-color, #1a1a1d); border: 1px solid var(--border-color, #26262b);
          border-radius: 14px; overflow: hidden; cursor: pointer; transition: transform .2s, border-color .2s;
          display: flex; flex-direction: column; text-align: left; padding: 0; color: inherit; font: inherit; width: 100%; }
        .ev-card:hover, .ev-card:focus-visible { transform: translateY(-3px); border-color: #e4bf7a; outline: none; }
        .ev-cover { position: relative; aspect-ratio: 4 / 3; overflow: hidden; }
        .ev-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ev-count { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,.6); color: #fff;
          font-size: .72rem; padding: 5px 10px; border-radius: 100px; }
        .ev-body { padding: 16px 18px 20px; }
        .ev-body h3 { margin: 0 0 6px; font-size: 1.2rem; }
        .ev-meta { color: #e4bf7a; font-size: .78rem; letter-spacing: .04em; text-transform: uppercase; margin-bottom: 10px; }
        .ev-blurb { color: var(--text-secondary); font-size: .9rem; line-height: 1.5; margin: 0; }
        .ev-view { margin-top: 14px; color: #e4bf7a; font-size: .85rem; font-weight: 600; }
        .ev-modal { position: fixed; inset: 0; background: rgba(8,8,10,.96); z-index: 1200; overflow: auto; }
        .ev-mhead { position: sticky; top: 0; background: rgba(15,15,17,.92); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border-color, #26262b); }
        .ev-mhead h2 { margin: 0; font-size: 1.4rem; }
        .ev-mmeta { color: #e4bf7a; font-size: .78rem; text-transform: uppercase; letter-spacing: .04em; margin-top: 4px; }
        .ev-x { background: none; border: 1px solid #3a3a40; color: #eee; border-radius: 100px; width: 42px; height: 42px; font-size: 1.3rem; cursor: pointer; }
        .ev-album { max-width: 1040px; margin: 0 auto; padding: 24px; columns: 3; column-gap: 14px; }
        .ev-ph { border: none; padding: 0; background: none; cursor: zoom-in; display: block; width: 100%;
          margin: 0 0 14px; break-inside: avoid; border-radius: 10px; overflow: hidden; }
        .ev-ph img { width: 100%; display: block; border-radius: 10px; }
        .ev-lightbox { position: fixed; inset: 0; background: rgba(0,0,0,.93); z-index: 1300; display: flex;
          align-items: center; justify-content: center; cursor: zoom-out; padding: 20px; }
        .ev-lightbox img { max-width: 92vw; max-height: 92vh; border-radius: 8px; }
        @media (max-width: 800px) { .ev-album { columns: 2; } }
        @media (max-width: 520px) { .ev-album { columns: 1; } }
        .ev-shop { display: inline-block; padding: 18px 40px; border-radius: 100px; font-weight: 900;
          text-transform: uppercase; letter-spacing: 2px; font-size: .82rem; text-decoration: none;
          cursor: pointer; transition: var(--transition, all .3s ease); border: 1px solid #e4bf7a; }
        .ev-shop--gold { background: #e4bf7a; color: #000; }
        .ev-shop--gold:hover { background: transparent; color: #e4bf7a; border-color: #e4bf7a; }
        .ev-shop--outline { background: transparent; color: #e4bf7a; }
        .ev-shop--outline:hover { background: #e4bf7a; color: #000; }
      `}</style>

      <section className="container" style={{ paddingTop: '100px', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ marginBottom: '20px', fontSize: '2.5rem' }}>Dazzling Designz in the Community</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{pageDescription}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '26px' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Events</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>{EVENTS.length} event{EVENTS.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="ev-grid">
          {EVENTS.map((ev) => (
            <button key={ev.id} className="ev-card" data-testid="event-card" onClick={() => setOpenEvent(ev)}
              aria-label={`Open the ${ev.name} photo album, ${ev.photos.length} photos`}>
              <div className="ev-cover">
                <img src={IMG(ev.cover)} alt="" loading="lazy" />
                <span className="ev-count">{ev.photos.length} photos</span>
              </div>
              <div className="ev-body">
                <h3>{ev.name}</h3>
                <div className="ev-meta">{eventMeta(ev)}</div>
                <p className="ev-blurb">{ev.description}</p>
                <div className="ev-view">View album &rarr;</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: '70px', paddingTop: '40px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '24px' }}>Explore the Collection</h2>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/collections/necklaces" className="ev-shop ev-shop--outline">Shop Necklaces</Link>
            <Link to="/collections/bracelets-1" className="ev-shop ev-shop--outline">Shop Bracelets</Link>
            <Link to="/" className="ev-shop ev-shop--gold">Shop All</Link>
          </div>
        </div>
      </section>

      {openEvent && (
        <div className="ev-modal" role="dialog" aria-modal="true" aria-label={`${openEvent.name} photo album`}>
          <div className="ev-mhead">
            <div>
              <h2>{openEvent.name}</h2>
              <div className="ev-mmeta">{eventMeta(openEvent)} &middot; {openEvent.photos.length} photos</div>
            </div>
            <button className="ev-x" onClick={() => setOpenEvent(null)} aria-label="Close album">&times;</button>
          </div>
          <div className="ev-album">
            {openEvent.photos.map((p) => (
              <button key={p.basename} className="ev-ph" data-testid="gallery-item"
                onClick={() => setLightbox({ src: IMG(p.basename), alt: p.alt })} aria-label={`Enlarge: ${p.alt}`}>
                <img src={IMG(p.basename)} alt={p.alt} loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      )}

      {lightbox && (
        <div className="ev-lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <img src={lightbox.src} alt={lightbox.alt} />
        </div>
      )}
    </main>
  );
}
