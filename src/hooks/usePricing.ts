/**
 * Custom hook for managing pricing access and display
 * Integrates with secure pricing system using RLS policies
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPrices, canViewPrices, PricesMap, PriceInfo } from '@/api/prices';
import { useAuth } from '@/context/AuthContext';

export interface FormattedPrice {
  display: string;
  original?: string;
  isDiscounted: boolean;
  currency: string;
}

export const usePricing = () => {
  const { user, isAuthenticated } = useAuth();
  const [prices, setPrices] = useState<PricesMap>({});

  // Check if user can view prices using React Query for caching
  const { data: userCanViewPrices = false, isLoading: checkingAccess } = useQuery({
    queryKey: ['pricing-access', user?.id],
    queryFn: canViewPrices,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false, // Don't retry on permission errors
  });

  // Load prices for specific products
  const loadPrices = useCallback(async (productRefs: string | string[]): Promise<PricesMap> => {
    try {
      if (!userCanViewPrices) {
        console.info('User cannot view prices, skipping price fetch');
        return {};
      }

      const newPrices = await getPrices(productRefs);
      setPrices(prev => ({ ...prev, ...newPrices }));
      return newPrices;
    } catch (error) {
      console.error('Error loading prices:', error);
      return {};
    }
  }, [userCanViewPrices]);

  // Get price for a specific product
  const getProductPrice = useCallback((productRef: string): PriceInfo | null => {
    return prices[productRef] || null;
  }, [prices]);

  // Format price for display
  const formatPrice = useCallback((
    productRef: string, 
    options: {
      showCurrency?: boolean;
      showDiscount?: boolean;
      locale?: string;
    } = {}
  ): FormattedPrice | null => {
    const price = getProductPrice(productRef);
    if (!price || !userCanViewPrices) {
      return null;
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
      original: undefined,
      isDiscounted: false,
      currency: currency
    };
  }, [getProductPrice, userCanViewPrices]);

  // Simple price formatting for backward compatibility
  const formatPriceSimple = useCallback((price: number | string | null | undefined): string => {
    if (!userCanViewPrices) return '';
    if (!price || isNaN(Number(price))) return '';
    const numPrice = parseFloat(price.toString());
    if (numPrice === 0) return 'חינם';
    return `₪${numPrice.toFixed(2)}`;
  }, [userCanViewPrices]);

  // Check if user should see price placeholder
  const shouldShowPricePlaceholder = useCallback((): boolean => {
    return !userCanViewPrices;
  }, [userCanViewPrices]);

  // Get pricing access message for users (silent catalog mode)
  const getPricingMessage = useCallback((): string | null => {
    // Always return null for silent catalog mode - no pricing messages
    return null;
  }, []);

  return {
    // Access control
    canViewPrices: userCanViewPrices,
    checkingAccess,
    
    // Prices data
    prices,
    
    // Functions
    loadPrices,
    getProductPrice,
    formatPrice,
    formatPriceSimple,
    shouldShowPricePlaceholder,
    getPricingMessage
  };
};

export default usePricing;