import Header from './components/Header'
import ProductCard from './components/ProductCard'
import Footer from './components/Footer'
import { mockProducts } from './mockData'

function App() {
  return (
    <div className="site-wrapper">
      <Header />

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
                <button className="btn-primary">
                  Shop All Beads
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Collection Section */}
        <section className="products">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">COLLECTIONS ✨</h2>
                <p className="section-subtitle">8 PRODUCTS FOUND</p>
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
              {mockProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default App
