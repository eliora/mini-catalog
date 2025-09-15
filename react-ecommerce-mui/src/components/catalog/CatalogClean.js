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
import { Box, Alert, Button, CircularProgress } from '@mui/material';
import { useProductsInfiniteQuery } from '../../hooks/useProductsInfiniteQuery';
import { useCart } from '../../context/CartContext';
import usePricing from '../../hooks/usePricing';
import { useMobileFilterDrawer } from './FilterPanel';
import { useCatalogFilters } from '../../hooks/useCatalogFilters';
import { parseJsonField, shouldRenderContent } from '../../utils/dataHelpers';
import { SearchLoadingOverlay, SearchResultsSkeleton } from '../common/SkeletonLoading';

// Components
import ProductDisplay from './ProductDisplay';
import CatalogLayout from './CatalogLayout';
import SearchHeader from '../common/SearchHeader';
import ProductDetailsDialog from './ProductDetailsDialog';
import ImageZoomDialog from './ImageZoomDialog';
import SupabaseError from '../ui/SupabaseError';

const CatalogClean = () => {
  // ===== EXTERNAL STATE HOOKS =====
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const { canViewPrices, prices } = usePricing();
  const mobileFilter = useMobileFilterDrawer();
  const filterState = useCatalogFilters();
  // ===== LOCAL UI STATE =====
  const [imageZoom, setImageZoom] = useState({ open: false, src: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('catalogViewMode') || 'list';
  });

  // ===== TANSTACK QUERY FOR PRODUCTS =====
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

  // ===== HEADER SEARCH INTEGRATION =====
  useEffect(() => {
    const handleHeaderSearch = (event) => {
      const { searchTerm: headerSearchTerm } = event.detail;
      filterState.setSearchTerm(headerSearchTerm);
    };

    window.addEventListener('headerSearch', handleHeaderSearch);
    return () => {
      window.removeEventListener('headerSearch', handleHeaderSearch);
    };
  }, [filterState]);

  // ===== CART MANAGEMENT =====
  const getCurrentQuantity = useCallback((ref) => {
    const cartItem = cart.find(item => item.ref === ref);
    return cartItem ? cartItem.quantity : 0;
  }, [cart]);

  const handleQuantityChange = useCallback((ref, value) => {
    const numValue = parseInt(value, 10);
    const newQuantity = isNaN(numValue) ? 0 : Math.max(0, numValue);

    const product = products.find(p => p.ref === ref);
    if (!product) return;

    const cartItem = cart.find(i => i.ref === ref);

    if (newQuantity === 0) {
      if (cartItem) removeFromCart(ref);
    } else {
      if (cartItem) {
        updateQuantity(ref, newQuantity);
      } else {
        addToCart(product, newQuantity);
      }
    }
  }, [products, cart, removeFromCart, updateQuantity, addToCart]);

  const handleIncrement = useCallback((product) => {
    const current = getCurrentQuantity(product.ref);
    const next = Math.min(99, current + 1);
    
    if (current > 0) {
      updateQuantity(product.ref, next);
    } else {
      // For new items, add with quantity 1, not next (which would be 1 + existing 0 = 1)
      addToCart(product, 1);
    }
  }, [getCurrentQuantity, updateQuantity, addToCart]);

  const handleDecrement = useCallback((product) => {
    const current = getCurrentQuantity(product.ref);
    if (current > 1) {
      updateQuantity(product.ref, current - 1);
    } else if (current === 1) {
      removeFromCart(product.ref);
    }
  }, [getCurrentQuantity, updateQuantity, removeFromCart]);

  // ===== UI HANDLERS =====
  const handleZoom = (src) => {
    setImageZoom({ open: true, src });
  };

  const handleViewModeChange = (newMode) => {
    if (newMode) {
      setViewMode(newMode);
      localStorage.setItem('catalogViewMode', newMode);
    }
  };

  const handleFilterClick = () => {
    if (mobileFilter.isMobile) {
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

  // ===== COMPUTED VALUES =====
  // All filter-related computed values are now handled by useCatalogFilters hook

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
        totalCount={products.length} // TanStack Query handles totals
        countLabel="מוצרים"
        activeFilters={filterState.activeFilters}
        activeFilterCount={filterState.activeFilterCount}
        onFilterRemove={filterState.removeFilter}
        onViewModeChange={handleViewModeChange}
        onFilterClick={handleFilterClick}
        viewMode={viewMode}
        isLoading={isFetching}
      />

      {/* MAIN LAYOUT WITH FILTERS AND CONTENT */}
      <CatalogLayout
        filterState={filterState}
        mobileFilter={mobileFilter}
        isLoading={isLoading}
      >
        {/* PRODUCTS DISPLAY */}
        {isLoading ? (
          <SearchResultsSkeleton viewMode={viewMode} count={6} />
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
        currentQuantity={selectedProduct ? getCurrentQuantity(selectedProduct.ref) : 0}
        onDecrement={handleDecrement}
        onIncrement={handleIncrement}
        onQuantityChange={handleQuantityChange}
        onImageClick={handleZoom}
        shouldRenderContent={shouldRenderContent}
        parseJsonField={parseJsonField}
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
