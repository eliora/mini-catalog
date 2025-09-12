/**
 * Custom hook for managing pricing access and display
 * Handles role-based pricing visibility for verified members
 */

import { useState, useEffect, useCallback } from 'react';
import { getPrices } from '../api/prices';
import { useAuth } from '../context/AuthContext';

export const usePricing = () => {
  const { user, isAuthenticated, getUserProfile } = useAuth();
  const [pricingInfo, setPricingInfo] = useState({
    canViewPrices: false,
    role: 'anonymous',
    tier: null,
    loading: true,
    error: null
  });

  const [prices, setPrices] = useState({});
  const [pricesLoading, setPricesLoading] = useState(false);

  // Check user's pricing permissions
  const checkPricingAccess = useCallback(async () => {
    try {
      setPricingInfo(prev => ({ ...prev, loading: true, error: null }));
      
      if (!isAuthenticated || !user) {
        setPricingInfo({
          canViewPrices: false,
          role: 'anonymous',
          tier: null,
          loading: false,
          error: null
        });
        return false;
      }

      // Get user profile to check role
      const profile = await getUserProfile();
      const userRole = profile?.user_role || 'standard';
      
      const canView = userRole === 'admin' || userRole === 'verified_member';
      
      setPricingInfo({
        canViewPrices: canView,
        role: isAuthenticated ? 'authenticated' : 'anonymous',
        tier: userRole === 'admin' ? 'admin' : (userRole === 'verified_member' ? 'verified_member' : null),
        loading: false,
        error: null
      });
      
      return canView;
    } catch (error) {
      console.error('Error checking pricing access:', error);
      setPricingInfo({
        canViewPrices: false,
        role: 'unknown',
        tier: null,
        loading: false,
        error: error.message
      });
      return false;
    }
  }, [isAuthenticated, user, getUserProfile]);

  // Load prices for specific products
  const loadPrices = useCallback(async (productRefs) => {
    if (!pricingInfo.canViewPrices) {
      console.info('User cannot view prices - skipping price load');
      return {};
    }

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
  }, [pricingInfo.canViewPrices]);

  // Get price for a specific product
  const getProductPrice = useCallback((productRef) => {
    if (!pricingInfo.canViewPrices) {
      return null;
    }
    return prices[productRef] || null;
  }, [prices, pricingInfo.canViewPrices]);

  // Format price for display
  const formatPrice = useCallback((productRef, options = {}) => {
    const price = getProductPrice(productRef);
    if (!price) {
      return pricingInfo.canViewPrices ? 'Price not available' : 'Login to view prices';
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
  }, [getProductPrice, pricingInfo.canViewPrices]);

  // Check if user should see price placeholder
  const shouldShowPricePlaceholder = useCallback(() => {
    return !pricingInfo.canViewPrices && !pricingInfo.loading;
  }, [pricingInfo.canViewPrices, pricingInfo.loading]);

  // Get pricing access message for users - removed "Sign in" alerts per requirements
  const getPricingMessage = useCallback(() => {
    if (pricingInfo.loading) return 'Loading...';
    if (pricingInfo.error) return 'Error loading pricing info';
    if (pricingInfo.canViewPrices) return null;
    
    // Don't show any sign-in prompts per task requirements
    return null;
  }, [pricingInfo]);

  // Initialize pricing access check (only when auth state changes)
  useEffect(() => {
    checkPricingAccess();
  }, [isAuthenticated, user, checkPricingAccess]); // Include checkPricingAccess dependency

  return {
    // Pricing access info
    canViewPrices: pricingInfo.canViewPrices,
    role: pricingInfo.role,
    tier: pricingInfo.tier,
    loading: pricingInfo.loading,
    error: pricingInfo.error,
    
    // Prices data
    prices,
    pricesLoading,
    
    // Functions
    checkPricingAccess,
    loadPrices,
    getProductPrice,
    formatPrice,
    shouldShowPricePlaceholder,
    getPricingMessage,
    
    // Utilities
    refreshAccess: checkPricingAccess
  };
};

export default usePricing;
