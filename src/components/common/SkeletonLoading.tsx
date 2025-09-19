import React from 'react';
import {
  Box,
  Skeleton,
  Stack,
  Card,
  CardContent
} from '@mui/material';

/**
 * Reusable Skeleton Loading Components
 * Provides consistent loading states across the application
 */

// ProductCardSkeleton removed since ProductCard component was deleted

// Product List Item Skeleton (for accordion view)
interface ProductListSkeletonProps {
  count?: number;
}

export const ProductListSkeleton: React.FC<ProductListSkeletonProps> = ({ count = 3 }) => {
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
interface SearchResultsSkeletonProps {
  viewMode?: 'list' | 'catalog';
  count?: number;
}

export const SearchResultsSkeleton: React.FC<SearchResultsSkeletonProps> = ({ 
  viewMode: _viewMode = 'list', // eslint-disable-line @typescript-eslint/no-unused-vars 
  count = 6 
}) => {
  // ProductCard removed, all views now use ProductListSkeleton
  return <ProductListSkeleton count={count} />;
};

// Accordion Content Skeleton (for product details)
export const AccordionContentSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        {/* Main Image */}
        <Box sx={{ flex: { xs: '1', md: '1 1 50%' } }}>
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
        </Box>
        
        {/* Product Details */}
        <Box sx={{ flex: { xs: '1', md: '1 1 50%' } }}>
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
        </Box>
      </Box>
    </Box>
  );
};

// Filter Loading Skeleton
export const FilterSkeleton: React.FC = () => {
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
interface SearchLoadingOverlayProps {
  children: React.ReactNode;
  loading?: boolean;
}

export const SearchLoadingOverlay: React.FC<SearchLoadingOverlayProps> = ({ 
  children, 
  loading = false 
}) => {
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

const SkeletonComponents = {
  ProductListSkeleton,
  SearchResultsSkeleton,
  AccordionContentSkeleton,
  FilterSkeleton,
  SearchLoadingOverlay
};

export default SkeletonComponents;

