import React, { createContext, useContext, useState, useEffect } from 'react';
import { shopifyFetch, cartCreateMutation } from './ShopifyClient';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('dazzling_cart');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('dazzling_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const addToCart = (product, variantId) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.variantId === variantId);
      if (existing) {
        return prev.map(item =>
          item.variantId === variantId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, variantId, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (variantId) => {
    setCartItems(prev => prev.filter(item => item.variantId !== variantId));
  };

  const updateQuantity = (variantId, amount) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.variantId === variantId) {
          const newQty = Math.max(1, item.quantity + amount);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const checkout = async () => {
    if (cartItems.length === 0) return;
    setIsCheckingOut(true);

    try {
      const lines = cartItems.map(item => ({
        merchandiseId: item.variantId,
        quantity: item.quantity
      }));

      const { status, body } = await shopifyFetch({
        query: cartCreateMutation,
        variables: { input: { lines } }
      });

      if (status === 200 && body.data?.cartCreate?.cart?.checkoutUrl) {
        window.location.href = body.data.cartCreate.cart.checkoutUrl;
      } else {
        console.error("Failed to create checkout", body);
        alert("There was an issue initiating checkout. Please try again.");
        setIsCheckingOut(false);
      }
    } catch (error) {
      console.error(error);
      setIsCheckingOut(false);
    }
  };

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        checkout,
        totalQuantity,
        isCheckingOut
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
