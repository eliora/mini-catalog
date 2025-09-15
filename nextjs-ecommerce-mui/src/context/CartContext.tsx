'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { supabaseBrowserClient } from '@/lib/supabaseClient';
import { getGlobalRealtimeManager } from '@/lib/realtime';
import { CartState, CartItem, Cart, CartStorageData, AddToCartRequest, UpdateCartItemRequest } from '@/types/cart';
import { Product } from '@/types/product';

const CartContext = createContext<CartState | null>(null);

// Storage key for cart data
const CART_STORAGE_KEY = 'mini-catalog-cart';
const CART_VERSION = '1.0';

function sanitizeCartItem(item: any): CartItem {
  return {
    product_id: String(item.product_id || item.ref || ''),
    product_name: item.product_name || item.productName || '',
    quantity: Math.max(1, parseInt(item.quantity) || 1),
    unit_price: parseFloat(item.unit_price || item.unitPrice) || 0,
    total_price: 0, // Will be calculated
    unit_type: item.unit_type || '',
    notes: item.notes || item.notice || '',
    // Optional product details for display
    product: item.product ? {
      id: item.product.id,
      ref: item.product.ref,
      product_name: item.product.product_name || item.product.name,
      main_pic: item.product.main_pic || item.product.mainPic,
      product_type: item.product.product_type || item.product.productType,
    } : undefined,
  };
}

function calculateCartTotals(items: CartItem[]): { subtotal: number; total: number; itemCount: number } {
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return {
    subtotal,
    total: subtotal, // Can add tax, shipping, etc. later
    itemCount,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(() => {
    // Initialize cart from localStorage
    try {
      if (typeof window === 'undefined') {
        return { items: [], subtotal: 0, total: 0, itemCount: 0, lastUpdated: new Date() };
      }
      
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const data: CartStorageData = JSON.parse(stored);
        if (data.version === CART_VERSION) {
          const sanitizedItems = data.items.map(sanitizeCartItem).filter(item => item.product_id);
          const totals = calculateCartTotals(sanitizedItems);
          
          return {
            items: sanitizedItems,
            ...totals,
            lastUpdated: new Date(data.lastUpdated),
          };
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    
    return { items: [], subtotal: 0, total: 0, itemCount: 0, lastUpdated: new Date() };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Debounce localStorage writes to improve performance
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save cart to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce localStorage write by 300ms to avoid blocking on rapid clicks
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const storageData: CartStorageData = {
          items: cart.items,
          lastUpdated: cart.lastUpdated.toISOString(),
          version: CART_VERSION,
        };
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(storageData));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cart]);

  // Real-time cart sync setup (for future multi-device support)
  useEffect(() => {
    // TODO: Implement real-time cart sync when user is authenticated
    // This would sync cart across devices for logged-in users
    
    const realtimeManager = getGlobalRealtimeManager(supabaseBrowserClient);
    
    // For now, we'll just set up the infrastructure
    // In the future, this could sync with a server-side cart table
    
    return () => {
      // Cleanup subscriptions when component unmounts
    };
  }, []);

  // Add item to cart
  const addItem = useCallback(async (product: Product, quantity: number, notes?: string): Promise<void> => {
    setIsLoading(true);
    setError(undefined);

    try {
      const newItem: CartItem = {
        product_id: product.id || product.ref || '',
        product_name: product.product_name || product.name || '',
        quantity: Math.max(1, quantity),
        unit_price: 0, // Will be updated with pricing logic
        total_price: 0,
        unit_type: product.size || product.unit || '',
        notes: notes || '',
        product: {
          id: product.id,
          ref: product.ref,
          product_name: product.product_name || product.name,
          main_pic: product.main_pic,
          product_type: product.product_type || product.category,
        },
      };

      setCart(prev => {
        const existingIndex = prev.items.findIndex(item => 
          item.product_id === newItem.product_id
        );

        let newItems: CartItem[];
        
        if (existingIndex !== -1) {
          // Update existing item quantity
          newItems = [...prev.items];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + quantity,
            notes: notes || newItems[existingIndex].notes,
          };
        } else {
          // Add new item
          newItems = [...prev.items, newItem];
        }

        // Recalculate totals
        const totals = calculateCartTotals(newItems);
        
        return {
          items: newItems,
          ...totals,
          lastUpdated: new Date(),
        };
      });

      console.log(`✅ Added ${quantity}x ${product.product_name || product.name} to cart`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
      setError(errorMessage);
      console.error('Error adding item to cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update item in cart
  const updateItem = useCallback(async (productId: string, quantity: number, notes?: string): Promise<void> => {
    setIsLoading(true);
    setError(undefined);

    try {
      setCart(prev => {
        const itemIndex = prev.items.findIndex(item => item.product_id === productId);
        
        if (itemIndex === -1) {
          throw new Error('Item not found in cart');
        }

        const newItems = [...prev.items];
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          newItems.splice(itemIndex, 1);
        } else {
          // Update item
          newItems[itemIndex] = {
            ...newItems[itemIndex],
            quantity,
            notes: notes !== undefined ? notes : newItems[itemIndex].notes,
          };
        }

        // Recalculate totals
        const totals = calculateCartTotals(newItems);
        
        return {
          items: newItems,
          ...totals,
          lastUpdated: new Date(),
        };
      });

      console.log(`✅ Updated cart item ${productId}: quantity=${quantity}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update cart item';
      setError(errorMessage);
      console.error('Error updating cart item:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remove item from cart
  const removeItem = useCallback(async (productId: string): Promise<void> => {
    setIsLoading(true);
    setError(undefined);

    try {
      setCart(prev => {
        const newItems = prev.items.filter(item => item.product_id !== productId);
        const totals = calculateCartTotals(newItems);
        
        return {
          items: newItems,
          ...totals,
          lastUpdated: new Date(),
        };
      });

      console.log(`✅ Removed item ${productId} from cart`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item from cart';
      setError(errorMessage);
      console.error('Error removing cart item:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear entire cart
  const clearCart = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(undefined);

    try {
      setCart({
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0,
        lastUpdated: new Date(),
      });

      console.log('✅ Cart cleared');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
      setError(errorMessage);
      console.error('Error clearing cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Utility functions
  const getItemCount = useCallback((): number => {
    return cart.itemCount;
  }, [cart.itemCount]);

  const getSubtotal = useCallback((): number => {
    return cart.subtotal;
  }, [cart.subtotal]);

  const getTotal = useCallback((): number => {
    return cart.total;
  }, [cart.total]);

  const hasItem = useCallback((productId: string): boolean => {
    return cart.items.some(item => item.product_id === productId);
  }, [cart.items]);

  const getItem = useCallback((productId: string): CartItem | undefined => {
    return cart.items.find(item => item.product_id === productId);
  }, [cart.items]);

  const value = useMemo((): CartState => ({
    // State
    cart,
    isLoading,
    error,
    
    // Actions
    addItem,
    updateItem,
    removeItem,
    clearCart,
    
    // Legacy aliases for backward compatibility
    addToCart: addItem,
    updateQuantity: (productId: string, quantity: number) => updateItem(productId, quantity),
    removeFromCart: removeItem,
    
    // Calculations
    getItemCount,
    getSubtotal,
    getTotal,
    
    // Utilities
    hasItem,
    getItem,
  }), [
    cart,
    isLoading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getItemCount,
    getSubtotal,
    getTotal,
    hasItem,
    getItem,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
