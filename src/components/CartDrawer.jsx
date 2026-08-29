import { useCart } from '../lib/CartContext';
import { X, Plus, Minus, Trash2 } from 'lucide-react';

export default function CartDrawer() {
  const { isCartOpen, toggleCart, cartItems, updateQuantity, removeFromCart, checkout, isCheckingOut } = useCart();

  if (!isCartOpen) return null;

  const cartTotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

  return (
    <>
      <div 
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} 
        onClick={toggleCart} 
      />
      <div 
        className="animate-fade"
        data-testid="cart-drawer"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '400px',
          background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)',
          zIndex: 1000, display: 'flex', flexDirection: 'column'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '900', fontStyle: 'italic', margin: 0 }}>YOUR CART</h2>
          <button className="icon-btn" onClick={toggleCart} aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {cartItems.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.variantId} style={{ display: 'flex', gap: '16px' }}>
                <img src={item.image} alt={item.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>{item.title}</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>${item.price}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '100px', overflow: 'hidden' }}>
                      <button aria-label="Decrease quantity" onClick={() => updateQuantity(item.variantId, -1)} style={{ background: 'none', border: 'none', color: 'white', padding: '4px 8px', cursor: 'pointer' }}><Minus size={14} /></button>
                      <span data-testid="item-quantity" style={{ fontSize: '12px', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button aria-label="Increase quantity" onClick={() => updateQuantity(item.variantId, 1)} style={{ background: 'none', border: 'none', color: 'white', padding: '4px 8px', cursor: 'pointer' }}><Plus size={14} /></button>
                    </div>
                    <button aria-label={`Remove ${item.title} from cart`} onClick={() => removeFromCart(item.variantId)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '18px', fontWeight: 'bold' }}>
              <span>Subtotal</span>
              <span data-testid="cart-subtotal">${cartTotal.toFixed(2)}</span>
            </div>
            <button 
              className="btn-primary" 
              style={{ width: '100%', textAlign: 'center' }} 
              onClick={checkout}
              disabled={isCheckingOut}
              data-testid="checkout-btn"
            >
              {isCheckingOut ? 'PROCESSING...' : 'CHECKOUT'}
            </button>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '12px' }}>
              Shipping & taxes calculated at checkout.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
