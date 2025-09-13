import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from 'react';

const CartContext = createContext(null);

function sanitizeItem(item) {
  return {
    ref: String(item.ref ?? ''),
    productName: item.productName || '',
    unitPrice: parseFloat(item.unitPrice) || 0,
    productName2: item.productName2 || '',
    line: item.line || '',
    notice: item.notice || '',
    size: item.size || '',
    productType: item.productType || '',
    mainPic: item.mainPic || '',
    quantity: Math.max(1, parseInt(item.quantity) || 1),
  };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('cart');
      const parsed = raw ? JSON.parse(raw) : [];
      return parsed.map(sanitizeItem).filter(i => i.ref);
    } catch {
      return [];
    }
  });

  // Debounce localStorage writes to improve performance
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce localStorage write by 300ms to avoid blocking on rapid clicks
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem('cart', JSON.stringify(cart));
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cart]);

  const addToCart = useCallback((product, quantity) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(i => String(i.ref) === String(product.ref));
      if (existingIndex !== -1) {
        // Update existing item - more efficient than map
        const newCart = [...prev];
        newCart[existingIndex] = { ...newCart[existingIndex], quantity: newCart[existingIndex].quantity + quantity };
        return newCart;
      }
      // Add new item
      return [...prev, sanitizeItem({ ...product, quantity })];
    });
  }, []);

  const updateQuantity = useCallback((ref, quantity) => {
    setCart(prev => {
      const index = prev.findIndex(i => String(i.ref) === String(ref));
      if (index === -1) return prev;
      
      // More efficient than map - only update the specific item
      const newCart = [...prev];
      newCart[index] = sanitizeItem({ ...newCart[index], quantity });
      return newCart;
    });
  }, []);

  const removeFromCart = useCallback((ref) => {
    setCart(prev => {
      const index = prev.findIndex(i => String(i.ref) === String(ref));
      if (index === -1) return prev;
      
      // More efficient than filter - splice out the specific item
      const newCart = [...prev];
      newCart.splice(index, 1);
      return newCart;
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const updateItemPrice = useCallback((ref, newPrice) => {
    setCart(prev => {
      const index = prev.findIndex(i => i.ref === ref);
      if (index === -1) return prev;
      
      const newCart = [...prev];
      newCart[index] = { ...newCart[index], unitPrice: parseFloat(newPrice) || 0 };
      return newCart;
    });
  }, []);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const value = useMemo(() => ({ cart, addToCart, updateQuantity, updateItemPrice, removeFromCart, clearCart, getCartItemCount }), [cart, addToCart, updateQuantity, updateItemPrice, removeFromCart, clearCart, getCartItemCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}


