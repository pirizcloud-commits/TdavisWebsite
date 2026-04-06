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
        let variables = { first: 20 }
        
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
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-banner">
            <img
              src="/images/bead_hero.png"
              alt="Premium Bead Jewelry"
              className="hero-img"
            />
            <div className="hero-overlay">
              <h2 className="hero-title">
                HANDCRAFTED<br />ELEGANCE
              </h2>
              <p className="hero-desc">
                Discover our exclusive collection of vibrant, hand-crafted bead jewelry designed for every occasion.
              </p>
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
