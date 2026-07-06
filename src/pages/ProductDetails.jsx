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

  const price = parseFloat(product.priceRange?.minVariantPrice?.amount || '0').toFixed(2);

  const productMedia = product.media?.edges.map(e => {
    if (e.node.mediaContentType === 'VIDEO') {
       const mp4Source = e.node.sources?.find(s => s.format === 'mp4' || s.mimeType === 'video/mp4') || e.node.sources?.[0];
       return { type: 'video', url: mp4Source?.url };
    }
    if (e.node.mediaContentType === 'IMAGE') {
       return { type: 'image', url: e.node.image?.url };
    }
    return null;
  }).filter(Boolean) || (product.images?.edges.map(e => ({ type: 'image', url: e.node.url })) || []);
  
  const currentMedia = productMedia[currentImageIndex] || { type: 'image', url: '' }
  
  const handleAddToCart = () => {
    const variantIdStr = product.variants?.edges[0]?.node?.id
    if (!variantIdStr) return alert("Product is unavailable")
    
    addToCart({
      id: product.id,
      title: product.title,
      price: price,
      image: product.images?.edges[0]?.node?.url || ''
    }, variantIdStr)
  }

  return (
    <main className="container" style={{ padding: '80px 40px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>
        {/* Product Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Image */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--border-radius-lg)', padding: '20px', position: 'relative' }}>
             {currentMedia.url && (
               currentMedia.type === 'video' ? (
                 <video 
                   src={currentMedia.url} 
                   autoPlay muted loop playsInline controls
                   style={{ width: '100%', height: 'auto', borderRadius: 'var(--border-radius-md)', objectFit: 'cover', transition: 'all 0.3s ease' }} 
                 />
               ) : (
                 <img 
                   src={currentMedia.url} 
                   alt={product.title} 
                   style={{ width: '100%', height: 'auto', borderRadius: 'var(--border-radius-md)', objectFit: 'cover', transition: 'all 0.3s ease' }} 
                 />
               )
             )}
             
             {productMedia.length > 1 && (
               <>
                 <button 
                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? productMedia.length - 1 : prev - 1)}
                  style={{ position: 'absolute', left: '30px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                 >
                   <ChevronLeft size={24} />
                 </button>
                 <button 
                  onClick={() => setCurrentImageIndex(prev => prev === productMedia.length - 1 ? 0 : prev + 1)}
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
          {productMedia.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {productMedia.map((item, i) => (
                item.type === 'video' ? (
                  <video
                    key={i}
                    src={item.url}
                    muted playsInline
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
                ) : (
                  <img 
                    key={i}
                    src={item.url}
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
                )
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
              style={{ width: '100%', opacity: product.variants?.edges[0]?.node?.availableForSale ? 1 : 0.5, cursor: product.variants?.edges[0]?.node?.availableForSale ? 'pointer' : 'not-allowed' }}
              onClick={handleAddToCart}
              disabled={!product.variants?.edges[0]?.node?.availableForSale}
            >
              {product.variants?.edges[0]?.node?.availableForSale === false ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
