import React from 'react';
import {
  Box,
  Skeleton,
  Grid,
  Stack,
  Card,
  CardContent
} from '@mui/material';

/**
 * Reusable Skeleton Loading Components
 * Provides consistent loading states across the application
 */

// Product Card Skeleton (for catalog view)
export const ProductCardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={6} sm={4} md={3} lg={2.4} key={index}>
          <Card sx={{ height: 240, borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={120} 
                sx={{ borderRadius: 1, mb: 1 }}
              />
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="60%" height={16} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                <Skeleton variant="text" width="40%" height={18} />
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </>
  );
};

// Product List Item Skeleton (for accordion view)
export const ProductListSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ mb: 1 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                {/* Product Image */}
                <Skeleton 
                  variant="rectangular" 
                  width={80} 
                  height={80} 
                  sx={{ borderRadius: 1, flexShrink: 0 }}
                />
                
                {/* Product Info */}
                <Box sx={{ flexGrow: 1 }}>
                  <Stack spacing={0.5}>
                    <Skeleton variant="text" width="70%" height={20} />
                    <Skeleton variant="text" width="50%" height={16} />
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Skeleton variant="text" width="30%" height={14} />
                      <Skeleton variant="text" width="20%" height={14} />
                    </Stack>
                  </Stack>
                </Box>
                
                {/* Price and Controls */}
                <Stack direction="column" spacing={1} alignItems="center" sx={{ minWidth: 120 }}>
                  <Skeleton variant="text" width="80%" height={18} />
                  <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      ))}
    </>
  );
};

// Search Results Skeleton
export const SearchResultsSkeleton = ({ viewMode = 'list', count = 6 }) => {
  if (viewMode === 'catalog') {
    return <ProductCardSkeleton count={count} />;
  }
  return <ProductListSkeleton count={count} />;
};

// Accordion Content Skeleton (for product details)
export const AccordionContentSkeleton = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Main Image */}
        <Grid item xs={12} md={6}>
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height={300} 
            sx={{ borderRadius: 2 }}
          />
          {/* Thumbnail Images */}
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton 
                key={index}
                variant="rectangular" 
                width={60} 
                height={60} 
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Stack>
        </Grid>
        
        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="60%" height={20} />
            
            {/* Description */}
            <Box>
              <Skeleton variant="text" width="100%" height={16} />
              <Skeleton variant="text" width="90%" height={16} />
              <Skeleton variant="text" width="70%" height={16} />
            </Box>
            
            {/* Properties */}
            <Stack spacing={1}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Stack key={index} direction="row" spacing={2}>
                  <Skeleton variant="text" width="30%" height={16} />
                  <Skeleton variant="text" width="40%" height={16} />
                </Stack>
              ))}
            </Stack>
            
            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

// Filter Loading Skeleton
export const FilterSkeleton = () => {
  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Box key={index}>
          <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
    </Stack>
  );
};

// Search Loading Overlay (subtle overlay for search)
export const SearchLoadingOverlay = ({ children, loading = false }) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            borderRadius: 2,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={80} height={16} />
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default {
  ProductCardSkeleton,
  ProductListSkeleton,
  SearchResultsSkeleton,
  AccordionContentSkeleton,
  FilterSkeleton,
  SearchLoadingOverlay
};
