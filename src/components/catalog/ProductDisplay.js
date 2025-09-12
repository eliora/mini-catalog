import React, { useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Skeleton
} from '@mui/material';
import ProductCard from '../ProductCard';
import ProductListItem from '../ProductListItem';

const ProductDisplay = ({
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
  onLoadMore
}) => {
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for infinite scroll with proper cleanup
  const handleObserver = useCallback((entries) => {
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

  // Loading skeleton component
  const ProductSkeleton = ({ isCard = true }) => (
    isCard ? (
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="text" sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" />
        </Box>
      </Grid>
    ) : (
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', p: 2, gap: 2 }}>
          <Skeleton variant="rectangular" width={80} height={80} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" sx={{ mb: 1 }} />
            <Skeleton variant="text" width="70%" sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" />
          </Box>
        </Box>
      </Grid>
    )
  );
  // Show loading skeletons on initial load
  if (loading && (!products || products.length === 0)) {
    const isCardView = viewMode === 'catalog';
    return (
      <Grid container spacing={isCardView ? 2 : 0}>
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductSkeleton key={index} isCard={isCardView} />
        ))}
      </Grid>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          לא נמצאו מוצרים
        </Typography>
        <Typography variant="body2" color="text.secondary">
          נסה לשנות את מונחי החיפוש או המסננים
        </Typography>
      </Box>
    );
  }

  if (viewMode === 'list' || viewMode === 'compact') {
    return (
      <Box>
        {products.map((product) => (
          <ProductListItem
            key={product.ref}
            product={product}
            quantity={getCurrentQuantity(product.ref)}
            onDecrement={() => onDecrement(product)}
            onIncrement={() => onIncrement(product)}
            onQuantityChange={(value) => onQuantityChange(product.ref, value)}
            onProductInfoClick={() => onProductInfoClick(product)}
            onImageClick={onImageClick}
            shouldRenderContent={shouldRenderContent}
            parseJsonField={parseJsonField}
          />
        ))}
        
        {/* Single loading/trigger element for infinite scroll */}
        <div 
          ref={loadMoreRef} 
          style={{ 
            height: loadingMore ? 60 : 20,
            backgroundColor: hasMore ? 'rgba(0,0,0,0.05)' : 'transparent',
            margin: '10px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: loadingMore ? 'row' : 'row'
          }}
        >
          {loadingMore ? (
            <>
              <CircularProgress size={20} />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                טוען מוצרים נוספים...
              </Typography>
            </>
          ) : hasMore ? (
            <Typography variant="caption" color="text.secondary">
              גלול למטה לעוד מוצרים
            </Typography>
          ) : null}
        </div>
      </Box>
    );
  }

  // Default catalog/grid view
  return (
    <Grid container spacing={2} className="catalog-container">
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product.ref}>
          <ProductCard
            product={product}
            quantity={getCurrentQuantity(product.ref)}
            onDecrement={() => onDecrement(product)}
            onIncrement={() => onIncrement(product)}
            onQuantityChange={(value) => onQuantityChange(product.ref, value)}
            onProductInfoClick={() => onProductInfoClick(product)}
            onImageClick={onImageClick}
            shouldRenderContent={shouldRenderContent}
            parseJsonField={parseJsonField}
          />
        </Grid>
      ))}
      
      {/* Single loading/trigger element for infinite scroll */}
      <Grid item xs={12}>
        <div 
          ref={loadMoreRef} 
          style={{ 
            height: loadingMore ? 60 : 20,
            backgroundColor: hasMore ? 'rgba(0,0,0,0.05)' : 'transparent',
            margin: '10px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: loadingMore ? 'row' : 'row'
          }}
        >
          {loadingMore ? (
            <>
              <CircularProgress size={20} />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                טוען מוצרים נוספים...
              </Typography>
            </>
          ) : hasMore ? (
            <Typography variant="caption" color="text.secondary">
              גלול למטה לעוד מוצרים
            </Typography>
          ) : null}
        </div>
      </Grid>
    </Grid>
  );
};

export default React.memo(ProductDisplay);
