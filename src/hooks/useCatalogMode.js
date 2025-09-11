import { useMemo } from 'react';

/**
 * Hook for managing catalog display modes and pricing visibility
 * Provides consistent behavior across product components
 */
export const useCatalogMode = () => {
  const catalogMode = useMemo(() => {
    // For now, we'll use a simple catalog mode
    // In the future, this could be controlled by user settings or admin configuration
    return {
      showPrices: true,
      showOrderFunctionality: true,
      displayMode: 'full' // 'full', 'catalog-only', 'price-only'
    };
  }, []);

  const getPriceDisplayProps = useMemo(() => {
    return {
      visible: catalogMode.showPrices,
      format: 'currency', // 'currency', 'points', 'hidden'
      currency: '₪'
    };
  }, [catalogMode.showPrices]);

  const shouldShowOrderFunctionality = useMemo(() => {
    return catalogMode.showOrderFunctionality;
  }, [catalogMode.showOrderFunctionality]);

  const getDisplayMode = useMemo(() => {
    return catalogMode.displayMode;
  }, [catalogMode.displayMode]);

  return {
    catalogMode,
    getPriceDisplayProps,
    shouldShowOrderFunctionality,
    getDisplayMode
  };
};
