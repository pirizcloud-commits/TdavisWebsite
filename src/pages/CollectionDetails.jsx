import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { shopifyFetch, getCollectionProductsQuery } from '../lib/ShopifyClient'
import ProductCard from '../components/ProductCard'
import SEO from '../components/SEO'
import { getBreadcrumbSchema } from '../lib/jsonld'

export default function CollectionDetails() {
  const { handle } = useParams()
  const [collection, setCollection] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)

  useEffect(() => {
    async function fetchCollection() {
      setLoading(true)
      setApiError(false)
      try {
        const { status, body } = await shopifyFetch({
          query: getCollectionProductsQuery,
          variables: { handle, first: 250 }
        })

        if (status === 200 && body.data?.collection) {
          setCollection(body.data.collection)
          const edges = body.data.collection.products?.edges || []
          
          const formattedProducts = edges.map(({ node }) => {
            let parsedMedia = node.media?.edges.map(e => {
              if (e.node.mediaContentType === 'VIDEO') {
                const mp4Source = e.node.sources?.find(s => s.format === 'mp4' || s.mimeType === 'video/mp4') || e.node.sources?.[0];
                return { type: 'video', url: mp4Source?.url };
              }
              if (e.node.mediaContentType === 'IMAGE') {
                return { type: 'image', url: e.node.image?.url };
              }
              return null;
            }).filter(Boolean) || [];
            
            parsedMedia.sort((a, b) => (a.type === 'video' ? -1 : (b.type === 'video' ? 1 : 0)));

            // Extract variants for guard
            return {
              id: node.id,
              handle: node.handle,
              title: node.title,
              price: parseFloat(node.priceRange?.minVariantPrice?.amount || '0').toFixed(2),
              images: node.images?.edges.map(e => e.node.url) || [],
              media: parsedMedia,
              availableForSale: node.availableForSale,
              onSale: false,
              variants: node.variants
            };
          });
          setProducts(formattedProducts)
        } else {
          setCollection(null)
        }
      } catch (error) {
        console.error("Error fetching collection:", error)
        setCollection(null)
        setApiError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchCollection()
  }, [handle])

  if (loading) {
    return (
      <main className="container" style={{ padding: '100px 40px', minHeight: '60vh' }}>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Loading collection...</p>
      </main>
    )
  }

  if (apiError) {
    return (
      <main className="container" style={{ padding: '100px 40px', minHeight: '60vh' }}>
        <SEO 
          title="Error Loading Collection" 
          description="There was a temporary error loading this collection." 
          noindex={true}
        />
        <h2>Error Loading Collection</h2>
        <p style={{ marginTop: '16px', marginBottom: '24px' }}>
          We encountered an unexpected issue while fetching the collection. Please try again.
        </p>
        <button onClick={() => window.location.reload()} className="btn-primary" style={{ border: 'none', cursor: 'pointer' }}>
          Retry
        </button>
      </main>
    )
  }

  if (!collection) {
    return (
      <main className="container" style={{ padding: '100px 40px', minHeight: '60vh' }}>
        <SEO 
          title="Collection Not Found" 
          description="This collection could not be found." 
          noindex={true}
        />
        <h1>Collection Not Found</h1>
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
          We couldn&rsquo;t find that collection. It may have been moved or renamed.
        </p>
        <p style={{ marginTop: '16px' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>Return to Shop All</Link>
        </p>
      </main>
    )
  }

  const collectionUrl = handle === 'frontpage' ? 'https://dazzlingdesignzllc.com/' : `https://dazzlingdesignzllc.com/collections/${handle}`
  const isEmpty = products.length === 0;
  
  const jsonLd = [];

  // BreadcrumbList and CollectionPage only for populated non-frontpage collections
  if (!isEmpty && handle !== 'frontpage') {
    jsonLd.push(
      getBreadcrumbSchema([
        { name: "Home", url: "https://dazzlingdesignzllc.com/" },
        { name: collection.title, url: collectionUrl }
      ]),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${collectionUrl}#webpage`,
        "url": collectionUrl,
        "name": collection.title,
        "description": collection.description || undefined,
        "publisher": {
          "@id": "https://dazzlingdesignzllc.com/#organization"
        }
      }
    );
  }

  return (
    <main>
      <SEO 
        title={collection.title}
        description={collection.description || `Shop ${collection.title} at Dazzling Designz.`}
        canonicalUrl={isEmpty ? undefined : collectionUrl}
        noindex={isEmpty || handle === 'frontpage'}
        jsonLd={jsonLd.length > 0 ? jsonLd : undefined}
        ogImage={collection.image?.url}
      />
      
      <section className="container" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
        <h1 style={{ marginBottom: '16px', fontSize: '2.5rem' }}>{collection.title}</h1>
        {collection.description && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '800px', lineHeight: '1.6' }}>
            {collection.description}
          </p>
        )}
        
        {isEmpty ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <h3 style={{ marginBottom: '16px' }}>This collection is currently empty.</h3>
            <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Shop All
            </Link>
          </div>
        ) : (
          <div className="product-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
