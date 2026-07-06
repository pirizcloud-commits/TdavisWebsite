import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { shopifyFetch, getProductsQuery, getCollectionsQuery, getCollectionProductsQuery } from '../lib/ShopifyClient'

export default function Home() {
  const [products, setProducts] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const filter = searchParams.get('filter') || ''

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        let query = getProductsQuery;
        let variables = { first: 20, sortKey: 'CREATED_AT', reverse: true }
        
        if (filter === 'new-arrivals') {
          variables = { first: 8, sortKey: 'CREATED_AT', reverse: true }
        } else if (filter === 'customs') {
          variables = { first: 20, query: 'title:*custom*' }
        } else if (filter === 'collection' && searchParams.get('handle')) {
          query = getCollectionProductsQuery;
          variables = { first: 20, handle: searchParams.get('handle') };
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

          const formattedProducts = edges.map(({ node }) => ({
            id: node.id,
            handle: node.handle,
            title: node.title,
            price: parseFloat(node.priceRange?.minVariantPrice?.amount || '0').toFixed(2),
            images: node.images?.edges.map(e => e.node.url) || [],
            media: node.media?.edges.map(e => {
              if (e.node.mediaContentType === 'VIDEO') {
                const mp4Source = e.node.sources?.find(s => s.format === 'mp4' || s.mimeType === 'video/mp4') || e.node.sources?.[0];
                return { type: 'video', url: mp4Source?.url };
              }
              if (e.node.mediaContentType === 'IMAGE') {
                return { type: 'image', url: e.node.image?.url };
              }
              return null;
            }).filter(Boolean) || [],
            availableForSale: node.availableForSale,
            onSale: false
          }))
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
  }, [filter, searchParams.get('handle')])

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main>
      {/* Featured Flyer Section */}
      <section className="promo-section" style={{ padding: '40px 0' }}>
        <div className="container">
          <div className="promo-container">
            <div className="promo-content">
              <h2 className="promo-title">Dazzling Designz Promo</h2>
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
