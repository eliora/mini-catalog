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

function sanitizeCartItem(item: Record<string, unknown>): CartItem {
  return {
    product_id: String(item.product_id || item.ref || ''),
    product_name: String(item.product_name || item.productName || ''),
    quantity: Math.max(1, parseInt(String(item.quantity)) || 1),
    unit_price: parseFloat(String(item.unit_price || item.unitPrice)) || 0,
    total_price: 0, // Will be calculated
    unit_type: String(item.unit_type || ''),
    notes: String(item.notes || item.notice || ''),
    // Optional product details for display
    product: item.product ? {
      id: String((item.product as Record<string, unknown>).id || ''),
      ref: String((item.product as Record<string, unknown>).ref || ''),
      product_name: String((item.product as Record<string, unknown>).product_name || (item.product as Record<string, unknown>).name || ''),
      main_pic: String((item.product as Record<string, unknown>).main_pic || (item.product as Record<string, unknown>).mainPic || ''),
      product_type: String((item.product as Record<string, unknown>).product_type || (item.product as Record<string, unknown>).productType || ''),
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
          const sanitizedItems = (data.items as unknown as Record<string, unknown>[]).map(sanitizeCartItem).filter(item => item.product_id);
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
      console.log('🛒 Adding product to cart:', product);
      
      const newItem: CartItem = {
        product_id: product.id || product.ref || '',
        product_name: product.product_name || '',
        quantity: Math.max(1, quantity),
        unit_price: 0, // Will be updated with pricing logic
        total_price: 0,
        unit_type: product.size || '',
        notes: notes || '',
        // Legacy compatibility fields for UI components
        product_ref: product.ref,
        ref: product.ref,
        productName: product.hebrew_name || product.product_name || '',
        productName2: product.english_name || product.product_name_2 || '',
        product_name_2: product.english_name || product.product_name_2 || '',
        unitPrice: 0, // Will be updated with pricing logic
        size: product.size || '',
        // Product details for display
        product: {
          id: product.id,
          ref: product.ref,
          product_name: product.product_name,
          hebrew_name: product.hebrew_name,
          english_name: product.english_name,
          product_line: product.product_line,
          main_pic: product.main_pic,
          product_type: product.product_type,
          size: product.size,
          description: product.description,
          description_he: product.description_he,
          short_description_he: product.short_description_he,
          ingredients: product.ingredients,
          active_ingredients: product.active_ingredients,
          active_ingredients_he: product.active_ingredients_he,
          usage_instructions: product.usage_instructions,
          usage_instructions_he: product.usage_instructions_he,
          pics: product.pics,
        },
      };

      console.log('📦 Created cart item:', newItem);

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

  // Update item price in cart
  const updateItemPrice = useCallback(async (productId: string, unitPrice: number): Promise<void> => {
    setIsLoading(true);
    setError(undefined);

    try {
      setCart(prev => {
        const itemIndex = prev.items.findIndex(item => item.product_id === productId);
        
        if (itemIndex === -1) {
          console.warn(`Item with ID ${productId} not found in cart for price update`);
          return prev;
        }

        const newItems = [...prev.items];
        
        // Update item price
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          unit_price: unitPrice,
          unitPrice: unitPrice, // Legacy field
          total_price: unitPrice * newItems[itemIndex].quantity,
        };

        // Recalculate totals
        const totals = calculateCartTotals(newItems);
        
        return {
          items: newItems,
          ...totals,
          lastUpdated: new Date(),
        };
      });

      console.log(`💰 Updated price for item ${productId}: ₪${unitPrice}`);
    } catch (error) {
      console.error('Error updating item price:', error);
      setError('Failed to update item price');
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
    updateItemPrice,
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
    updateItemPrice,
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
