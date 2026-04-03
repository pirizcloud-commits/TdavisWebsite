import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { shopifyFetch, getProductByHandleQuery } from '../lib/ShopifyClient'
import { useCart } from '../lib/CartContext'

export default function ProductDetails() {
  const { handle } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
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
  const image = product.images?.edges[0]?.node?.url || ''
  
  const handleAddToCart = () => {
    const variantIdStr = product.variants?.edges[0]?.node?.id
    if (!variantIdStr) return alert("Product is unavailable")
    
    addToCart({
      id: product.id,
      title: product.title,
      price: price,
      image: image
    }, variantIdStr)
  }

  return (
    <main className="container" style={{ padding: '80px 40px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>
        {/* Product Image */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--border-radius-lg)', padding: '20px' }}>
           {image && (
             <img 
               src={image} 
               alt={product.title} 
               style={{ width: '100%', height: 'auto', borderRadius: 'var(--border-radius-md)', objectFit: 'cover' }} 
             />
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
