import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import { useCart } from '../context/CartContext';
import EcommerceButtonLayout from './bazaar/EcommerceButtonLayout';
import SearchHeader from './common/SearchHeader';
import ProductDisplay from './catalog/ProductDisplay';
import ProductDetailsDialog from './catalog/ProductDetailsDialog';
import ImageZoomDialog from './catalog/ImageZoomDialog';
import FilterPanel, { useMobileFilterDrawer } from './catalog/FilterPanel';
import { getProducts, getProductLines, getFilterOptions } from '../api/products';
import { parseJsonField, shouldRenderContent } from '../utils/dataHelpers';
import { getProductTypeDisplay } from '../utils/imageHelpers';
import SupabaseError from './SupabaseError';

const Catalog = () => {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, hasMore: true, pageSize: 15 }); // Reduced for faster initial load
  
  const [imageZoom, setImageZoom] = useState({ open: false, src: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('catalogViewMode') || 'list';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedProductType, setSelectedProductType] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [productLines, setProductLines] = useState([]);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const mobileFilter = useMobileFilterDrawer();
  // eslint-disable-next-line no-unused-vars

  const loadProducts = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
        setProducts([]);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      // Loading products with optimized server-side filtering
      
      // Products API now has built-in timeout and retry logic with pagination
      // Pass filters to server for database-level filtering (MUCH faster)
      const filters = {
        productType: selectedProductType,
        skinType: selectedSkinType, 
        type: selectedType
      };
      
      const result = await getProducts(searchTerm, selectedLine, page, pagination.pageSize, filters);
      
      if (append && page > 1) {
        setProducts(prev => [...prev, ...result.products]);
      } else {
        setProducts(result.products);
      }
      
      setPagination(prev => ({
        ...prev,
        page: result.pagination.page,
        hasMore: result.pagination.hasMore
      }));
    } catch (error) {
      console.error('❌ Error loading products:', error);
      console.error('❌ Error details:', error.message, error.stack);
      
      // Provide user-friendly error messages
      let userMessage;
      if (error.message?.includes('timeout')) {
        userMessage = 'החיבור איטי מדי - אנא נסה שוב';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        userMessage = 'בעיית חיבור לאינטרנט - אנא בדוק את החיבור';
      } else if (error.message?.includes('Supabase not configured')) {
        userMessage = 'שגיאת הגדרות מערכת';
      } else {
        userMessage = error.message || 'שגיאה לא ידועה';
      }
      
      setError('שגיאה בטעינת מוצרים: ' + userMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pagination.pageSize, searchTerm, selectedLine, selectedProductType, selectedSkinType, selectedType]);

  const loadMoreProducts = useCallback(async () => {
    if (!loadingMore && pagination.hasMore) {
      await loadProducts(pagination.page + 1, true);
    }
  }, [loadProducts, loadingMore, pagination.hasMore, pagination.page]);

  const loadProductLines = useCallback(async () => {
    try {
      const data = await getProductLines();
      setProductLines(data);
    } catch (error) {
      console.error('Error loading product lines:', error);
      // Don't show error for product lines as it's not critical
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadProductLines();
  }, [loadProducts, loadProductLines]);

  // 🚀 PERFORMANCE OPTIMIZATION: No client-side filtering needed!
  // All filtering now happens at database level for maximum performance
  // Products from API are already filtered, so we can use them directly
  const filteredProducts = products;

  // 🚀 PERFORMANCE OPTIMIZATION: Load filter options separately from products
  const [filterOptions, setFilterOptions] = useState({
    lines: [],
    productTypes: [],
    skinTypes: [],
    types: []
  });

  // Load filter options once on component mount (much faster than processing all products)
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        console.log('🔍 Loading filter options efficiently...');
        const options = await getFilterOptions();
        setFilterOptions(options);
        console.log('✅ Filter options loaded:', options);
      } catch (error) {
        console.error('❌ Error loading filter options:', error);
        // Fallback to empty options
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

  // Get current quantity for a product directly from the cart
  const getCurrentQuantity = useCallback((productRef) => {
    const cartItem = cart.find(item => item.ref === productRef);
    return cartItem ? cartItem.quantity : 0;
  }, [cart]);

  const handleQuantityChange = (ref, value) => {
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
  };

  const handleIncrement = useCallback((product) => {
    const current = getCurrentQuantity(product.ref);
    const next = Math.min(99, current + 1);
    
    if (current > 0) {
      updateQuantity(product.ref, next);
    } else {
      addToCart(product, next);
    }
  }, [getCurrentQuantity, addToCart, updateQuantity]);

  const handleDecrement = useCallback((product) => {
    const current = getCurrentQuantity(product.ref);
    const next = Math.max(0, current - 1);
    
    if (next === 0) {
      removeFromCart(product.ref);
    } else {
      updateQuantity(product.ref, next);
    }
  }, [getCurrentQuantity, updateQuantity, removeFromCart]);

  const handleZoom = (src) => {
    setImageZoom({ open: true, src });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleViewModeChange = (newMode) => {
    if (newMode) {
      setViewMode(newMode);
      localStorage.setItem('catalogViewMode', newMode);
    }
  };


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    // Check if it's a Supabase configuration error
    if (error.includes('Supabase not configured') || error.includes('REACT_APP_SUPABASE')) {
      return <SupabaseError error={{ message: error }} onRetry={() => window.location.reload()} />;
    }
    
    return (
      <Alert 
        severity="error" 
        sx={{ m: 2 }}
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => {
              setError(null);
              loadProducts();
            }}
            sx={{ ml: 2 }}
          >
            נסה שוב
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  // Cart navigation handlers removed since cart buttons are removed

  const handleFilterClick = () => {
    if (mobileFilter.isMobile) {
      mobileFilter.openDrawer();
    } else {
      setFilterPanelOpen(!filterPanelOpen);
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedLine(category === selectedLine ? '' : category);
  };

  return (
    <Box className="catalog-container" sx={{ py: 3, width: '100%', maxWidth: 'none' }}>
      <SearchHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={handleClearSearch}
        placeholder="חיפוש מוצרים..."
        filteredCount={filteredProducts.length}
        countLabel="מוצרים"
        activeFilters={[
          ...(selectedLine ? [{ label: `קו מוצרים: ${selectedLine}`, value: selectedLine, type: 'line' }] : []),
          ...(selectedProductType ? [{ label: `סוג מוצר: ${getProductTypeDisplay(selectedProductType)}`, value: selectedProductType, type: 'productType' }] : []),
          ...(selectedSkinType ? [{ label: `סוג עור: ${selectedSkinType}`, value: selectedSkinType, type: 'skinType' }] : []),
          ...(selectedType ? [{ label: `סוג אריזה: ${getProductTypeDisplay(selectedType)}`, value: selectedType, type: 'type' }] : [])
        ]}
        onFilterRemove={(filter) => {
          switch (filter.type) {
            case 'line':
              setSelectedLine('');
              break;
            case 'productType':
              setSelectedProductType('');
              break;
            case 'skinType':
              setSelectedSkinType('');
              break;
            case 'type':
              setSelectedType('');
              break;
            default:
              break;
          }
        }}
        actions={
          <EcommerceButtonLayout
            onFilterClick={handleFilterClick}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            compact={true}
          />
        }
      />

      <FilterPanel
        filterOptions={filterOptions}
        selectedLine={selectedLine}
        selectedProductType={selectedProductType}
        selectedSkinType={selectedSkinType}
        selectedType={selectedType}
        onLineChange={setSelectedLine}
        onProductTypeChange={setSelectedProductType}
        onSkinTypeChange={setSelectedSkinType}
        onTypeChange={setSelectedType}
        open={mobileFilter.isMobile ? true : filterPanelOpen}
        mobileDrawerOpen={mobileFilter.open}
        onMobileDrawerToggle={mobileFilter.setOpen}
      />

      <ProductDisplay
        products={filteredProducts}
        viewMode={viewMode}
        getCurrentQuantity={getCurrentQuantity}
        onDecrement={handleDecrement}
        onIncrement={handleIncrement}
        onQuantityChange={handleQuantityChange}
        onProductInfoClick={setSelectedProduct}
        onImageClick={handleZoom}
        shouldRenderContent={shouldRenderContent}
        parseJsonField={parseJsonField}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={pagination.hasMore}
        onLoadMore={loadMoreProducts}
      />

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

      {/* Debug components have been moved to /debug route */}

      <ImageZoomDialog
        open={imageZoom.open}
        imageSrc={imageZoom.src}
        onClose={() => setImageZoom({ open: false, src: '' })}
      />
    </Box>
  );
};

export default Catalog;