/**
 * Custom hook for managing pricing access and display
 * Show prices to authenticated users - Supabase RLS handles actual permissions
 */

import { useState, useCallback } from 'react';
import { getPrices } from '../api/prices';
import { useAuth } from '../context/AuthContext';

export const usePricing = () => {
  const { user } = useAuth();
  const [prices, setPrices] = useState({});
  const [pricesLoading, setPricesLoading] = useState(false);

  // Show prices to any authenticated user - let Supabase RLS handle actual permissions
  const canViewPrices = !!user;

  // Load prices for specific products
  const loadPrices = useCallback(async (productRefs) => {
    try {
      setPricesLoading(true);
      const newPrices = await getPrices(productRefs);
      setPrices(prev => ({ ...prev, ...newPrices }));
      return newPrices;
    } catch (error) {
      console.error('Error loading prices:', error);
      return {};
    } finally {
      setPricesLoading(false);
    }
  }, []);

  // Get price for a specific product
  const getProductPrice = useCallback((productRef) => {
    return prices[productRef] || null;
  }, [prices]);

  // Format price for display
  const formatPrice = useCallback((productRef, options = {}) => {
    const price = getProductPrice(productRef);
    if (!price) {
      return canViewPrices ? 'Price not available' : 'Login to view prices';
    }

    const {
      showCurrency = true,
      showDiscount = true,
      locale = 'he-IL'
    } = options;

    const { unitPrice, currency = 'ILS', discountPrice } = price;

    // Show discount price if available
    if (showDiscount && discountPrice && discountPrice < unitPrice) {
      const originalFormatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(unitPrice);
      
      const discountFormatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(discountPrice);

      return {
        display: discountFormatted,
        original: originalFormatted,
        isDiscounted: true,
        currency: currency
      };
    }

    // Regular price
    const formatted = showCurrency 
      ? new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency
        }).format(unitPrice)
      : unitPrice.toString();

    return {
      display: formatted,
      original: null,
      isDiscounted: false,
      currency: currency
    };
  }, [getProductPrice, canViewPrices]);

  // Check if user should see price placeholder
  const shouldShowPricePlaceholder = useCallback(() => {
    return !canViewPrices;
  }, [canViewPrices]);

  // Get pricing access message for users
  const getPricingMessage = useCallback(() => {
    if (canViewPrices) return null;
    // Don't show any sign-in prompts per task requirements
    return null;
  }, [canViewPrices]);

  return {
    // Show prices to authenticated users - Supabase RLS handles actual permissions
    canViewPrices, // True if user is authenticated
    
    // Prices data
    prices,
    pricesLoading,
    
    // Functions
    loadPrices,
    getProductPrice,
    formatPrice,
    shouldShowPricePlaceholder,
    getPricingMessage
  };
};

export default usePricing;
