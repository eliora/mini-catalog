/**
 * usePriceLoader Hook
 * 
 * Custom hook that handles loading prices from Supabase RLS-protected table
 * and updating cart items with the loaded prices.
 * Only loads prices when not in edit mode to avoid overriding manual changes.
 */

import { useEffect, useRef } from 'react';
import { getPrices } from '@/api/prices';
import { CartItem } from '@/types/cart';

export const usePriceLoader = (
  cart: CartItem[], 
  updateItemPrice: (ref: string, price: number) => void, 
  editMode: boolean = false
): void => {
  const loadedRefs = useRef(new Set<string>());
  
  useEffect(() => {
    // Don't load prices when in edit mode to avoid overriding manual changes
    if (editMode) {
      return;
    }

    const loadCartPrices = async () => {
      if (!cart || cart.length === 0) {
        loadedRefs.current.clear();
        return;
      }
      
      const refs = Array.from(new Set(cart.map(i => String(i.product_ref || i.ref)))).filter(Boolean);
      if (refs.length === 0) return;
      
      // Only load prices for items we haven't loaded yet
      const newRefs = refs.filter(ref => !loadedRefs.current.has(ref));
      if (newRefs.length === 0) return;
      
      try {
        const pricesMap = await getPrices(newRefs);
        const hasAccess = pricesMap && Object.keys(pricesMap).length > 0;
        
        if (hasAccess) {
          newRefs.forEach(ref => {
            const p = pricesMap[ref];
            if (p && typeof p.unitPrice === 'number') {
              updateItemPrice(ref, p.unitPrice);
              loadedRefs.current.add(ref);
            }
          });
        }
      } catch (error) {
        console.error('Error loading prices:', error);
      }
    };

    loadCartPrices();
  }, [cart, updateItemPrice, editMode]);
};
