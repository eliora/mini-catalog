'use client';

/**
 * CatalogClean Component - Main Product Catalog Interface
 * 
 * Clean catalog implementation with pure TanStack Query for efficient data management.
 * Provides comprehensive product browsing with filtering, search, and cart functionality.
 * 
 * Features:
 * - Infinite scroll product loading with TanStack Query
 * - Advanced filtering (lines, product types, skin types, general types)
 * - Real-time search functionality
 * - Shopping cart integration with quantity management
 * - Price display for authorized users
 * - Mobile-responsive design with drawer filters
 * - Product detail dialogs and image zoom
 * - Error handling with retry functionality
 * 
 * Architecture:
 * - Uses extracted custom hooks for filter management
 * - Leverages TanStack Query for server state management
 * - Implements responsive layout with desktop sidebar and mobile drawer
 * - Integrates with cart context for state management
 * - Provides comprehensive error handling and loading states
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Box, Alert, Button, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import { useProductsInfiniteQuery } from '@/hooks/useProductsInfiniteQuery';
import { useCart } from '@/context/CartContext';
import { usePricing } from '@/hooks/usePricing';
import useCatalogPricing from '@/hooks/useCatalogPricing';
import { useMobileFilterDrawer } from './FilterPanel';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';
import { parseJsonField, shouldRenderContent } from '@/utils/dataHelpers';
import { SearchLoadingOverlay, SearchResultsSkeleton } from '@/components/common/SkeletonLoading';

// Components
import ProductDisplay from './ProductDisplay';
import CatalogLayout from './CatalogLayout';
import SearchHeader from '@/components/common/SearchHeader';
import ProductDetailsDialog from './ProductDetailsDialog';
import ImageZoomDialog from './ImageZoomDialog';
import MobileFilterChips from './mobile/MobileFilterChips';
import SupabaseError from '@/components/ui/SupabaseError';
import { Product } from '@/types/product';

const CatalogClean: React.FC = () => {
  // ===== RESPONSIVE DESIGN =====
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ===== EXTERNAL STATE HOOKS =====
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const mobileFilter = useMobileFilterDrawer();
  const filterState = useCatalogFilters();
  
  // ===== PRODUCTS DATA (must be before pricing hooks) =====
  const {
    products,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    refetch
  } = useProductsInfiniteQuery(filterState.filters, filterState.searchTerm);
  
  // ===== PRICING HOOKS (after products are available) =====
  const { canViewPrices } = usePricing();
  const { pricesData: prices, pricesLoading } = useCatalogPricing({ 
    products: products, 
    enabled: !!products?.length 
  });
  
  // ===== LOCAL UI STATE =====
  const [imageZoom, setImageZoom] = useState<{ open: boolean; src: string }>({ 
    open: false, 
    src: '' 
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // Force list view only (card/catalog view removed)
  const viewMode = 'list';


  // ===== HEADER SEARCH INTEGRATION =====
  useEffect(() => {
    const handleHeaderSearch = (event: CustomEvent<{ searchTerm: string }>) => {
      const { searchTerm: headerSearchTerm } = event.detail;
      filterState.setSearchTerm(headerSearchTerm);
    };

    window.addEventListener('headerSearch', handleHeaderSearch as EventListener);
    return () => {
      window.removeEventListener('headerSearch', handleHeaderSearch as EventListener);
    };
  }, [filterState]);

  // ===== CART MANAGEMENT =====
  const getCurrentQuantity = useCallback((ref: string): number => {
    const cartItem = cart.items.find(item => 
      item.product_id === ref || (item.product_ref || item.ref) === ref
    );
    return cartItem ? cartItem.quantity : 0;
  }, [cart]);

  const handleQuantityChange = useCallback((ref: string, value: string | number) => {
    const numValue = typeof value === 'number' ? value : parseInt(value, 10);
    const newQuantity = isNaN(numValue) ? 0 : Math.max(0, numValue);

    const product = products.find(p => p.ref === ref);
    if (!product) return;

    const cartItem = cart.items.find(i => 
      i.product_id === ref || (i.product_ref || i.ref) === ref
    );

    if (newQuantity === 0) {
      if (cartItem) removeFromCart(cartItem.product_id);
    } else {
      if (cartItem) {
        updateQuantity(cartItem.product_id, newQuantity);
      } else {
        addToCart(product, newQuantity);
      }
    }
  }, [products, cart, removeFromCart, updateQuantity, addToCart]);

  const handleIncrement = useCallback((product: Product) => {
    const current = getCurrentQuantity(product.ref);
    const next = Math.min(99, current + 1);
    
    if (current > 0) {
      updateQuantity(product.ref, next);
    } else {
      // For new items, add with quantity 1, not next (which would be 1 + existing 0 = 1)
      addToCart(product, 1);
    }
  }, [getCurrentQuantity, updateQuantity, addToCart]);

  const handleDecrement = useCallback((product: Product) => {
    const current = getCurrentQuantity(product.ref);
    if (current > 1) {
      updateQuantity(product.ref, current - 1);
    } else if (current === 1) {
      removeFromCart(product.ref);
    }
  }, [getCurrentQuantity, updateQuantity, removeFromCart]);

  // Dialog-specific handlers that don't need ref
  const handleDialogIncrement = useCallback(() => {
    if (selectedProduct) {
      handleIncrement(selectedProduct);
    }
  }, [selectedProduct, handleIncrement]);

  const handleDialogDecrement = useCallback(() => {
    if (selectedProduct) {
      handleDecrement(selectedProduct);
    }
  }, [selectedProduct, handleDecrement]);

  const handleDialogQuantityChange = useCallback((value: string) => {
    if (selectedProduct) {
      handleQuantityChange(selectedProduct.ref, value);
    }
  }, [selectedProduct, handleQuantityChange]);

  // ===== UI HANDLERS =====
  const handleZoom = (src: string) => {
    setImageZoom({ open: true, src });
  };

  // View mode change handler removed (list view only)

  const handleFilterClick = () => {
    if (isMobile) {
      mobileFilter.openDrawer();
    }
  };

  // ===== INFINITE SCROLL HANDLER =====
  const handleLoadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ===== ERROR HANDLING =====
  if (isError && error) {
    if (error.message?.includes('Supabase not configured') || error.message?.includes('REACT_APP_SUPABASE')) {
      return <SupabaseError error={error} onRetry={() => window.location.reload()} />;
    }
    
    return (
      <Alert 
        severity="error" 
        sx={{ m: 2 }}
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => refetch()}
            sx={{ ml: 2 }}
          >
            נסה שוב
          </Button>
        }
      >
        שגיאה בטעינת מוצרים: {error.message}
      </Alert>
    );
  }

  // ===== RENDER =====
  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      {/* SEARCH HEADER */}
      <SearchHeader
        searchTerm={filterState.searchTerm}
        onSearchChange={filterState.setSearchTerm}
        onClearSearch={filterState.clearAllFilters}
        placeholder="חיפוש מוצרים..."
        filteredCount={products.length}
        activeFilters={filterState.activeFilters}
        onFilterRemove={filterState.removeFilter}
        actions={null}
      />

      {/* MAIN LAYOUT WITH FILTERS AND CONTENT */}
      <CatalogLayout
        filterState={filterState}
        mobileFilter={mobileFilter}
        isLoading={isLoading}
      >
        {/* MOBILE FILTER CHIPS */}
        {isMobile && (
          <MobileFilterChips
            filterOptions={{
              lines: filterState.filterOptions?.lines || [],
              productTypes: filterState.filterOptions?.productTypes || [],
              skinTypes: filterState.filterOptions?.skinTypes || [],
              types: filterState.filterOptions?.types || []
            }}
            selectedLines={filterState.selectedLines || []}
            selectedProductTypes={filterState.selectedProductTypes || []}
            selectedSkinTypes={filterState.selectedSkinTypes || []}
            selectedTypes={filterState.selectedGeneralTypes || []}
            onLinesChange={filterState.setSelectedLines}
            onProductTypesChange={filterState.setSelectedProductTypes}
            onSkinTypesChange={filterState.setSelectedSkinTypes}
            onTypesChange={filterState.setSelectedGeneralTypes}
            disabled={isLoading}
          />
        )}
        
        {/* PRODUCTS DISPLAY */}
        {isLoading ? (
          <SearchResultsSkeleton viewMode={viewMode as 'list' | 'catalog'} count={6} />
        ) : (
          <SearchLoadingOverlay loading={isFetching && !isFetchingNextPage}>
            <ProductDisplay
              products={products}
              viewMode={viewMode}
              getCurrentQuantity={getCurrentQuantity}
              onDecrement={handleDecrement}
              onIncrement={handleIncrement}
              onQuantityChange={handleQuantityChange}
              onProductInfoClick={setSelectedProduct}
              onImageClick={handleZoom}
              shouldRenderContent={shouldRenderContent}
              parseJsonField={parseJsonField}
              loading={false} // TanStack Query handles loading
              loadingMore={isFetchingNextPage}
              hasMore={hasNextPage}
              onLoadMore={handleLoadMore}
              canViewPrices={canViewPrices}
              productPrices={prices}
            />
          </SearchLoadingOverlay>
        )}
      </CatalogLayout>

      {/* LOAD MORE INDICATOR */}
      {isFetchingNextPage && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* PRODUCT DETAILS DIALOG */}
      <ProductDetailsDialog
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        quantity={selectedProduct ? getCurrentQuantity(selectedProduct.ref) : 0}
        onDecrement={handleDialogDecrement}
        onIncrement={handleDialogIncrement}
        onQuantityChange={(value) => handleDialogQuantityChange(String(value))}
        onImageClick={handleZoom}
        canViewPrices={canViewPrices}
        productPrice={selectedProduct ? prices[selectedProduct.ref] : undefined}
      />

      {/* IMAGE ZOOM DIALOG */}
      <ImageZoomDialog
        open={imageZoom.open}
        imageSrc={imageZoom.src}
        onClose={() => setImageZoom({ open: false, src: '' })}
      />
    </Box>
  );
};

export default CatalogClean;
