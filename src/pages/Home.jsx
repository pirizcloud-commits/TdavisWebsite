import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import SEO from '../components/SEO'
import { shopifyFetch, getProductsQuery, getCollectionsQuery, getCollectionProductsQuery } from '../lib/ShopifyClient'
import { getOrganizationSchema, getWebSiteSchema } from '../lib/jsonld'

export default function Home() {
  const [products, setProducts] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const filter = searchParams.get('filter') || ''

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        let query = getProductsQuery;
        let variables = { first: 250, sortKey: 'CREATED_AT', reverse: true };
        
        if (filter === 'new-arrivals') {
          variables = { first: 8, sortKey: 'CREATED_AT', reverse: true }
        } else if (filter === 'customs') {
          variables = { first: 250, query: 'title:*custom*' }
        } else if (filter === 'category' && searchParams.get('type')) {
          variables = { first: 250, query: searchParams.get('type') }
        } else if (filter === 'collection' && searchParams.get('handle')) {
          query = getCollectionProductsQuery;
          variables = { first: 250, handle: searchParams.get('handle') };
        }

        const { status, body } = await shopifyFetch({
          query,
          variables,
        })

        if (status === 200) {
          let edges = []
          if (filter === 'collection' && searchParams.get('handle')) {
            edges = body.data?.collection?.products?.edges || []
          } else {
            edges = body.data?.products?.edges || []
          }

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
            
            // Prioritize videos to be the default image if available
            parsedMedia.sort((a, b) => (a.type === 'video' ? -1 : (b.type === 'video' ? 1 : 0)));

            return {
              id: node.id,
              handle: node.handle,
              title: node.title,
              price: parseFloat(node.priceRange?.minVariantPrice?.amount || '0').toFixed(2),
              images: node.images?.edges.map(e => e.node.url) || [],
              media: parsedMedia,
              availableForSale: node.availableForSale,
              onSale: false
            };
          });
          setProducts(formattedProducts)
        }
      } catch (error) {
        console.error("Error fetching shopify products:", error)
      } finally {
        setLoading(false)
      }
    }

    async function fetchCollections() {
      try {
        const { status, body } = await shopifyFetch({
          query: getCollectionsQuery,
          variables: { first: 20 }
        })
        if (status === 200) {
          const edges = body.data?.collections?.edges || []
          setCollections(edges.map(e => e.node).filter(c => c.handle !== 'frontpage'))
        }
      } catch (err) {
        console.error("Error fetching collections:", err)
      }
    }

    fetchCollections()
    fetchProducts()
  }, [filter, searchParams])

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFiltered = !!filter || !!searchQuery;

  return (
    <main>
      <SEO 
        title="Dazzling Designz | Custom Jewelry & Accessories" 
        description="Shop custom jewelry, beads, bracelets, and necklaces designed by Tamara Davis."
        canonicalUrl="https://dazzlingdesignzllc.com/"
        jsonLd={[getOrganizationSchema(), getWebSiteSchema()]}
        noindex={isFiltered}
      />
      {/* Featured Flyer Section */}
      <section className="promo-section" style={{ padding: '40px 0' }}>
        <div className="container">
          <div className="promo-container">
            <div className="promo-content">
              <h1 className="promo-title">
                Dazzling Designz
                <span className="visually-hidden"> Custom Jewelry & Premium Accessories</span>
              </h1>
              <p className="promo-desc">Explore what's new and discover the unique flair of our latest featured designs. Custom pieces curated just for you!</p>
              <button 
                className="btn-primary promo-btn"
                onClick={() => document.getElementById('products-grid').scrollIntoView({ behavior: 'smooth' })}
              >
                Shop Now
              </button>
            </div>
            <div className="promo-image-wrapper">
              <img 
                src="/images/dazzling-design-flyer.png" 
                alt="Dazzling Designz Featured Event" 
                className="promo-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TEMPORARILY DISABLED HERO SECTION
      <section className="hero">
        <div className="container">
          <div className="hero-banner">
            <img
              src="/dazzling_designz_logo_full.jpeg"
              alt="Dazzling Designz"
              className="hero-img"
            />
            <div className="hero-overlay">
              <button 
                className="btn-primary" 
                onClick={() => document.getElementById('products-grid').scrollIntoView({ behavior: 'smooth' })}
              >
                Shop All Beads
              </button>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Collection Section */}
      <section className="products" id="products-grid">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                {searchQuery 
                  ? `RESULTS FOR "${searchQuery.toUpperCase()}"` 
                  : filter === 'new-arrivals' 
                    ? 'NEW ARRIVALS ✨'
                    : filter === 'customs'
                      ? 'CUSTOMS ✨'
                      : filter === 'category' && searchParams.get('type')
                        ? `${searchParams.get('type').toUpperCase()} ✨`
                        : filter === 'collection' && searchParams.get('handle')
                          ? `${searchParams.get('handle').replace(/-/g, ' ').toUpperCase()} ✨`
                          : 'COLLECTIONS ✨'}
              </h2>
              <p className="section-subtitle">{filteredProducts.length} PRODUCT{filteredProducts.length !== 1 ? 'S' : ''} FOUND</p>
            </div>

            <div className="section-actions">
              <select className="sort-select">
                <option>Sort By: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="product-grid">
            {loading ? (
              <p>Loading products...</p>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p>No products found matching your search.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
