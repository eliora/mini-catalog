/**
 * usePriceLoader Hook
 * 
 * Custom hook that handles loading prices from Supabase RLS-protected table
 * and updating cart items with the loaded prices.
 * Only loads prices when not in edit mode to avoid overriding manual changes.
 * 
 * @param {Array} cart - Cart items
 * @param {Function} updateItemPrice - Function to update item price in cart
 * @param {boolean} editMode - Whether admin is in price edit mode
 */

import { useEffect, useRef } from 'react';
import { getPrices } from '../api/prices';

export const usePriceLoader = (cart, updateItemPrice, editMode = false) => {
  const loadedRefs = useRef(new Set());
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
      
      const refs = Array.from(new Set(cart.map(i => String(i.ref)))).filter(Boolean);
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
