'use client';

/**
 * ProductDisplay Component - UNIVERSAL RENDERER (Mobile + Desktop)
 * 
 * 🔧 COMPONENT PURPOSE: Main product rendering engine for all view modes
 * 🌐 DEVICE TARGET: Universal - handles mobile, tablet, desktop
 * 🎯 TRIGGER: Always active - core display component of catalog
 * 
 * WHAT IT DOES:
 * Main product rendering engine that handles all product display modes and layouts.
 * This is the core component that renders the product grid/list and manages infinite scrolling.
 * 
 * USAGE CONTEXT:
 * - Used by CatalogClean as the main product display area
 * - Renders products in multiple view modes: catalog (cards), list, compact
 * - Handles infinite scrolling with Intersection Observer
 * - Manages loading states and empty states
 * - Central hub for all product rendering logic
 * 
 * VIEW MODES:
 * 1. CATALOG (default): Grid of ProductCard components - optimized for desktop
 * 2. LIST: Vertical list of ProductListItem with accordions - good for mobile
 * 3. COMPACT: Same as list but more condensed layout
 * 
 * RESPONSIVE BEHAVIOR:
 * - Catalog view: Responsive grid (xs=12, sm=6, md=4, lg=3)
 * - List/Compact: Full-width items stacked vertically
 * - Uses ProductRenderer component for unified rendering logic
 * - Skeleton loading adapts to current view mode
 * 
 * FEATURES:
 * - Infinite scroll with Intersection Observer (300px trigger distance)
 * - Loading skeletons for initial load and "load more"
 * - Empty state handling with helpful messages
 * - Memoized view mode checks for performance
 * - Unified product prop passing via ProductRenderer
 * - Proper cleanup of observers and refs
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - React.memo prevents unnecessary re-renders
 * - useMemo for expensive view mode calculations
 * - Reusable LoadingIndicator and ProductRenderer components
 * - Efficient infinite scroll implementation
 */

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import { Product } from '@/types/product';
import LoadingIndicator from './LoadingIndicator';
import ProductRenderer from './ProductRenderer';

interface ProductDisplayProps {
  products: Product[];
  viewMode?: string;
  getCurrentQuantity: (ref: string) => number;
  onDecrement: (product: Product) => void;
  onIncrement: (product: Product) => void;
  onQuantityChange: (ref: string, value: string | number) => void;
  onProductInfoClick: (product: Product) => void;
  onImageClick: (src: string) => void;
  shouldRenderContent: (content: any) => boolean;
  parseJsonField: (field: any) => any;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  canViewPrices?: boolean;
  productPrices?: Record<string, any>;
}

const ProductDisplay: React.FC<ProductDisplayProps> = React.memo(({
  products,
  viewMode = 'catalog',
  getCurrentQuantity,
  onDecrement,
  onIncrement,
  onQuantityChange,
  onProductInfoClick,
  onImageClick,
  shouldRenderContent,
  parseJsonField,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  canViewPrices = false,
  productPrices = {}
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Memoize view mode checks
  const isCardView = useMemo(() => viewMode === 'catalog', [viewMode]);
  const isListView = useMemo(() => viewMode === 'list' || viewMode === 'compact', [viewMode]);

  // Intersection Observer for infinite scroll with proper cleanup
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, loadingMore, onLoadMore]);

  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const option = {
      root: null,
      rootMargin: '300px', // Load when 300px away from viewport for smoother scrolling
      threshold: 0
    };
    
    const observer = new IntersectionObserver(handleObserver, option);
    observerRef.current = observer;
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [handleObserver]);

  // Show loading skeletons on initial load
  if (loading && (!products || products.length === 0)) {
    return <LoadingIndicator type="skeleton" isCardView={isCardView} />;
  }

  if (!products || products.length === 0) {
    return <LoadingIndicator type="empty" />;
  }

  if (isListView) {
    return (
      <Box>
        {products.map((product) => (
          <ProductRenderer
            key={product.ref}
            product={product}
            viewMode={viewMode}
            getCurrentQuantity={getCurrentQuantity}
            onDecrement={onDecrement}
            onIncrement={onIncrement}
            onQuantityChange={onQuantityChange}
            onProductInfoClick={onProductInfoClick}
            onImageClick={onImageClick}
            shouldRenderContent={shouldRenderContent}
            parseJsonField={parseJsonField}
            canViewPrices={canViewPrices}
            productPrices={productPrices}
          />
        ))}
        
        <LoadingIndicator 
          type="infinite-scroll" 
          loadingMore={loadingMore} 
          hasMore={hasMore} 
          loadMoreRef={loadMoreRef} 
        />
      </Box>
    );
  }

  // Default catalog/grid view using flexbox instead of Grid
  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          className: 'catalog-container'
        }}
      >
        {products.map((product) => (
          <ProductRenderer
            key={product.ref}
            product={product}
            viewMode={viewMode}
            getCurrentQuantity={getCurrentQuantity}
            onDecrement={onDecrement}
            onIncrement={onIncrement}
            onQuantityChange={onQuantityChange}
            onProductInfoClick={onProductInfoClick}
            onImageClick={onImageClick}
            shouldRenderContent={shouldRenderContent}
            parseJsonField={parseJsonField}
            canViewPrices={canViewPrices}
            productPrices={productPrices}
          />
        ))}
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <LoadingIndicator 
          type="infinite-scroll" 
          loadingMore={loadingMore} 
          hasMore={hasMore} 
          loadMoreRef={loadMoreRef} 
        />
      </Box>
    </Box>
  );
});

ProductDisplay.displayName = 'ProductDisplay';

export default ProductDisplay;
