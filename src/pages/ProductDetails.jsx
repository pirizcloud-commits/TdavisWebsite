import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { shopifyFetch, getProductByHandleQuery } from '../lib/ShopifyClient'
import { useCart } from '../lib/CartContext'

export default function ProductDetails() {
  const { handle } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { addToCart } = useCart()

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { status, body } = await shopifyFetch({
          query: getProductByHandleQuery,
          variables: { handle }
        })

        if (status === 200 && body.data?.product) {
          setProduct(body.data.product)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [handle])

  if (loading) {
    return (
      <main className="container" style={{ padding: '100px 40px', minHeight: '60vh' }}>
        <h2>Loading product details...</h2>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="container" style={{ padding: '100px 40px', minHeight: '60vh' }}>
        <h2>Product not found</h2>
      </main>
    )
  }

  const price = parseFloat(product.priceRange?.minVariantPrice?.amount || '0').toFixed(2)
  const productImages = product.images?.edges.map(e => e.node.url) || []
  const currentImage = productImages[currentImageIndex] || ''
  
  const handleAddToCart = () => {
    const variantIdStr = product.variants?.edges[0]?.node?.id
    if (!variantIdStr) return alert("Product is unavailable")
    
    addToCart({
      id: product.id,
      title: product.title,
      price: price,
      image: productImages[0] || ''
    }, variantIdStr)
  }

  return (
    <main className="container" style={{ padding: '80px 40px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>
        {/* Product Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Image */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--border-radius-lg)', padding: '20px', position: 'relative' }}>
             {currentImage && (
               <img 
                 src={currentImage} 
                 alt={product.title} 
                 style={{ width: '100%', height: 'auto', borderRadius: 'var(--border-radius-md)', objectFit: 'cover', transition: 'all 0.3s ease' }} 
               />
             )}
             
             {productImages.length > 1 && (
               <>
                 <button 
                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? productImages.length - 1 : prev - 1)}
                  style={{ position: 'absolute', left: '30px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                 >
                   <ChevronLeft size={24} />
                 </button>
                 <button 
                  onClick={() => setCurrentImageIndex(prev => prev === productImages.length - 1 ? 0 : prev + 1)}
                  style={{ position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                 >
                   <ChevronRight size={24} />
                 </button>
               </>
             )}
          </div>
          
          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {productImages.map((img, i) => (
                <img 
                  key={i}
                  src={img}
                  alt={`${product.title} view ${i + 1}`}
                  onClick={() => setCurrentImageIndex(i)}
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    objectFit: 'cover', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    border: i === currentImageIndex ? '2px solid white' : '2px solid transparent',
                    opacity: i === currentImageIndex ? 1 : 0.5,
                    transition: 'all 0.2s ease',
                    background: 'var(--card-bg)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => { if (i !== currentImageIndex) e.currentTarget.style.opacity = '0.5' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', fontStyle: 'italic', lineHeight: '1.1' }}>
            {product.title}
          </h1>
          
          <p style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-secondary)' }}>
            ${price}
          </p>
          
          <div 
            style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} 
          />

          <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
            <button 
              className="btn-primary" 
              style={{ width: '100%' }}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
