/**
 * Custom hook for loading and managing prices in catalog components
 */

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePricing } from './usePricing';
import { Product } from '@/types/product';

interface UseCatalogPricingProps {
  products: Product[];
  enabled?: boolean;
}

export const useCatalogPricing = ({ products, enabled = true }: UseCatalogPricingProps) => {
  const { canViewPrices, loadPrices, checkingAccess } = usePricing();

  // Extract product refs from products
  const productRefs = products.map(p => p.ref).filter(Boolean);

  // Load prices for all visible products
  const { data: pricesData, isLoading: pricesLoading, error } = useQuery({
    queryKey: ['catalog-prices', productRefs],
    queryFn: () => loadPrices(productRefs),
    enabled: enabled && canViewPrices && productRefs.length > 0 && !checkingAccess,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false, // Don't retry on permission errors
  });

  return {
    canViewPrices,
    pricesLoading: pricesLoading || checkingAccess,
    pricesError: error,
    pricesData: pricesData || {}
  };
};

export default useCatalogPricing;
