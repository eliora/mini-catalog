import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useCart } from '../context/CartContext';
import EcommerceButtonLayout from './bazaar/EcommerceButtonLayout';
import SearchHeader from './common/SearchHeader';
import ProductDisplay from './catalog/ProductDisplay';
import ProductDetailsDialog from './catalog/ProductDetailsDialog';
import ImageZoomDialog from './catalog/ImageZoomDialog';
import FilterPanel, { useMobileFilterDrawer } from './catalog/FilterPanel';
import { getProducts, getProductLines } from '../api/products';
import { parseJsonField, shouldRenderContent } from '../utils/dataHelpers';
import { getProductTypeDisplay } from '../utils/imageHelpers';
import SupabaseError from './SupabaseError';

const Catalog = () => {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [imageZoom, setImageZoom] = useState({ open: false, src: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('catalogViewMode') || 'catalog';
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

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Starting getProducts call...');
      console.log('🔍 Environment check:', {
        hasUrl: !!process.env.REACT_APP_SUPABASE_URL,
        hasKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY,
        urlPreview: process.env.REACT_APP_SUPABASE_URL?.substring(0, 30) + '...'
      });
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const data = await Promise.race([getProducts(), timeoutPromise]);
      console.log('✅ Products loaded:', data?.length, 'items');
      console.log('📊 First product sample:', data?.[0]);
      setProducts(data);
    } catch (error) {
      console.error('❌ Error loading products:', error);
      console.error('❌ Error details:', error.message, error.stack);
      const msg = (error && error.message) || error || 'שגיאת רשת';
      setError('שגיאה בטעינת מוצרים: ' + msg);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Filter products based on search and multiple filters
  const filteredProducts = useMemo(() => {
    let filtered = products;
    console.log('🎯 Starting filter with:', { selectedLine, selectedProductType, selectedSkinType, selectedType });

    // Filter by product line/category (handle comma-separated values)
    if (selectedLine) {
      console.log('🔍 Filtering by line:', selectedLine);
      filtered = filtered.filter(product => {
        const productLine = product.productLine || '';
        return productLine.split(',').map(item => item.trim()).includes(selectedLine);
      });
      console.log('📊 After line filter:', filtered.length, 'products');
    }

    // Filter by product type (handle comma-separated values)
    if (selectedProductType) {
      console.log('🔍 Filtering by productType:', selectedProductType);
      filtered = filtered.filter(product => {
        const productType1 = product.productType || '';
        const productType2 = product.product_type || '';
        const types1 = productType1.split(',').map(item => item.trim());
        const types2 = productType2.split(',').map(item => item.trim());
        return types1.includes(selectedProductType) || types2.includes(selectedProductType);
      });
      console.log('📊 After productType filter:', filtered.length, 'products');
    }

    // Filter by skin type (handle comma-separated values)
    if (selectedSkinType) {
      console.log('🔍 Filtering by skinType:', selectedSkinType);
      filtered = filtered.filter(product => {
        const skinType = product.skin_type_he || '';
        return skinType.split(',').map(item => item.trim()).includes(selectedSkinType);
      });
      console.log('📊 After skinType filter:', filtered.length, 'products');
    }

    // Filter by type (handle comma-separated values)
    if (selectedType) {
      console.log('🔍 Filtering by type:', selectedType);
      filtered = filtered.filter(product => {
        const type = product.type || '';
        return type.split(',').map(item => item.trim()).includes(selectedType);
      });
      console.log('📊 After type filter:', filtered.length, 'products');
    }

    // Filter by search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.ref?.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.productName?.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.productName2?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    console.log('✅ Final filtered products:', filtered.length);
    return filtered;
  }, [products, searchTerm, selectedLine, selectedProductType, selectedSkinType, selectedType]);

  // Get unique values for filter options (handle comma-separated values)
  const filterOptions = useMemo(() => {
    console.log('🔍 Products for filtering:', products);
    
    // Extract and split comma-separated values
    const lines = [...new Set(
      products
        .map(p => p.productLine)
        .filter(Boolean)
        .flatMap(line => line.split(',').map(item => item.trim()))
        .filter(Boolean)
    )];
    
    const productTypes = [...new Set(
      products
        .flatMap(p => [p.productType, p.product_type])
        .filter(Boolean)
        .flatMap(type => type.split(',').map(item => item.trim()))
        .filter(Boolean)
    )];
    
    const skinTypes = [...new Set(
      products
        .map(p => p.skin_type_he)
        .filter(Boolean)
        .flatMap(skinType => skinType.split(',').map(item => item.trim()))
        .filter(Boolean)
    )];
    
    const types = [...new Set(
      products
        .map(p => p.type)
        .filter(Boolean)
        .flatMap(type => type.split(',').map(item => item.trim()))
        .filter(Boolean)
    )];

    console.log('📊 Filter options (after splitting):', { lines, productTypes, skinTypes, types });

    return {
      lines: lines.sort(),
      productTypes: productTypes.sort(),
      skinTypes: skinTypes.sort(),
      types: types.sort()
    };
  }, [products]);

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
      <Alert severity="error" sx={{ m: 2 }}>
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