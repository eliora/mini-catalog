import React, { useState, useCallback, useEffect } from 'react';
import { Box, Alert, Button, CircularProgress, Typography, Stack, Chip } from '@mui/material';
import { useProductsInfiniteQuery } from '../hooks/useProductsInfiniteQuery';
import { useCart } from '../context/CartContext';
import usePricing from '../hooks/usePricing';
import { useMobileFilterDrawer } from './catalog/FilterPanel';
import { getFilterOptions } from '../api/products';
import { parseJsonField, shouldRenderContent } from '../utils/dataHelpers';
import { SearchLoadingOverlay, SearchResultsSkeleton } from './common/SkeletonLoading';
import ProductDisplay from './catalog/ProductDisplay';
import FilterSidebar from './catalog/FilterSidebar';
import MobileFilterChips from './catalog/MobileFilterChips';
import SearchHeader from './common/SearchHeader';
import ProductDetailsDialog from './catalog/ProductDetailsDialog';
import ImageZoomDialog from './catalog/ImageZoomDialog';
import SupabaseError from './SupabaseError';

/**
 * Clean Catalog implementation with pure TanStack Query
 * No manual state management for products/loading/pagination
 */
const CatalogClean = () => {
  // ===== CART & PRICING (EXTERNAL STATE) =====
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const { canViewPrices, loadPrices } = usePricing();
  
  // ===== UI STATE (LOCAL ONLY) =====
  const [imageZoom, setImageZoom] = useState({ open: false, src: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('catalogViewMode') || 'list';
  });

  // ===== FILTER STATE (DRIVES QUERY) =====
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLines, setSelectedLines] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  // ===== FILTER OPTIONS (FOR DROPDOWNS) =====
  const [filterOptions, setFilterOptions] = useState({
    lines: [],
    productTypes: [],
    skinTypes: [],
    types: []
  });

  // ===== TANSTACK QUERY (REPLACES ALL MANUAL STATE) =====
  const filters = {
    selectedLines,
    selectedProductTypes,
    selectedSkinTypes,
    selectedTypes
  };

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
  } = useProductsInfiniteQuery(filters, searchTerm);

  // ===== MOBILE FILTER DRAWER =====
  const mobileFilter = useMobileFilterDrawer();

  // ===== LOAD FILTER OPTIONS (ONE-TIME) =====
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Error loading filter options:', error);
        setFilterOptions({
          lines: [],
          productTypes: [],
          skinTypes: [],
          types: []
        });
      }
    };

    loadFilterOptions();
  }, []);

  // ===== LOAD PRICES FOR DISPLAYED PRODUCTS =====
  useEffect(() => {
    const loadPricesForProducts = async () => {
      if (canViewPrices && products.length > 0) {
        const productRefs = products.map(p => p.ref);
        try {
          await loadPrices(productRefs);
          console.log('✅ Loaded prices for', productRefs.length, 'products');
        } catch (priceError) {
          console.warn('⚠️ Failed to load prices:', priceError.message);
        }
      }
    };

    loadPricesForProducts();
  }, [products, canViewPrices, loadPrices]);

  // ===== HEADER SEARCH INTEGRATION =====
  useEffect(() => {
    const handleHeaderSearch = (event) => {
      const { searchTerm: headerSearchTerm } = event.detail;
      setSearchTerm(headerSearchTerm);
    };

    window.addEventListener('headerSearch', handleHeaderSearch);
    return () => {
      window.removeEventListener('headerSearch', handleHeaderSearch);
    };
  }, []);

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
      addToCart(product, next);
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

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedLines([]);
    setSelectedProductTypes([]);
    setSelectedSkinTypes([]);
    setSelectedTypes([]);
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
  const activeFilterCount = selectedLines.length + selectedProductTypes.length + selectedSkinTypes.length + selectedTypes.length;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Box className="catalog-container" sx={{ width: '90%', maxWidth: 'none', p: 2, m: '0 auto' }}>
      {/* ACTIVE FILTERS ON TOP (DESKTOP ONLY) */}
      {hasActiveFilters && (
        <Box sx={{ 
          display: { xs: 'none', md: 'block' }, // Hide on mobile
          bgcolor: 'grey.50', 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          p: 2 
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            מסננים פעילים:
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
            {selectedLines.map(line => (
              <Chip
                key={`line-${line}`}
                label={line}
                size="small"
                color="secondary"
                onDelete={() => setSelectedLines(selectedLines.filter(item => item !== line))}
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            ))}
            {selectedProductTypes.map(type => (
              <Chip
                key={`type-${type}`}
                label={type}
                size="small"
                color="success"
                onDelete={() => setSelectedProductTypes(selectedProductTypes.filter(item => item !== type))}
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            ))}
            {selectedSkinTypes.map(type => (
              <Chip
                key={`skin-${type}`}
                label={type}
                size="small"
                color="warning"
                onDelete={() => setSelectedSkinTypes(selectedSkinTypes.filter(item => item !== type))}
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            ))}
            {selectedTypes.map(type => (
              <Chip
                key={`general-${type}`}
                label={type}
                size="small"
                color="info"
                onDelete={() => setSelectedTypes(selectedTypes.filter(item => item !== type))}
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            ))}
            <Chip
              label="נקה הכל"
              size="small"
              variant="outlined"
              color="error"
              onClick={handleClearSearch}
              sx={{ fontSize: '0.75rem', height: 20 }}
            />
          </Stack>
        </Box>
      )}

      {/* SEARCH HEADER */}
      <SearchHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={handleClearSearch}
        placeholder="חיפוש מוצרים..."
        filteredCount={products.length}
        totalCount={products.length} // TanStack Query handles totals
        countLabel="מוצרים"
        activeFilters={hasActiveFilters ? {
          selectedLines,
          selectedProductTypes,
          selectedSkinTypes,
          selectedTypes
        } : null}
        activeFilterCount={activeFilterCount}
        onFilterRemove={(filterType, value) => {
          switch (filterType) {
            case 'selectedLines':
              setSelectedLines(prev => prev.filter(item => item !== value));
              break;
            case 'selectedProductTypes':
              setSelectedProductTypes(prev => prev.filter(item => item !== value));
              break;
            case 'selectedSkinTypes':
              setSelectedSkinTypes(prev => prev.filter(item => item !== value));
              break;
            case 'selectedTypes':
              setSelectedTypes(prev => prev.filter(item => item !== value));
              break;
            default:
              break;
          }
        }}
        onViewModeChange={handleViewModeChange}
        onFilterClick={handleFilterClick}
        viewMode={viewMode}
        isLoading={isFetching}
      />

      {/* MOBILE FILTER CHIPS */}
      <MobileFilterChips
        filterOptions={filterOptions}
        selectedLines={selectedLines}
        selectedProductTypes={selectedProductTypes}
        selectedSkinTypes={selectedSkinTypes}
        selectedTypes={selectedTypes}
        onLinesChange={setSelectedLines}
        onProductTypesChange={setSelectedProductTypes}
        onSkinTypesChange={setSelectedSkinTypes}
        onTypesChange={setSelectedTypes}
        disabled={isLoading}
      />

      {/* MAIN LAYOUT WITH SIDEBAR */}
      <Box sx={{ display: 'flex', gap: { xs: 0, md: 2 }, minHeight: '100vh' }}>
        {/* LEFT SIDEBAR - FILTERS (DESKTOP ONLY) */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <FilterSidebar
            filterOptions={filterOptions}
            selectedLines={selectedLines}
            selectedProductTypes={selectedProductTypes}
            selectedSkinTypes={selectedSkinTypes}
            selectedTypes={selectedTypes}
            onLinesChange={setSelectedLines}
            onProductTypesChange={setSelectedProductTypes}
            onSkinTypesChange={setSelectedSkinTypes}
            onTypesChange={setSelectedTypes}
            disabled={isLoading}
            mobileOpen={false} // Not used on desktop
            onMobileToggle={() => {}} // Not used on desktop
          />
        </Box>

        {/* MAIN CONTENT AREA */}
        <Box sx={{ 
          flex: 1, 
          minWidth: 0,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}>
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
              />
            </SearchLoadingOverlay>
          )}
        </Box>
      </Box>

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
