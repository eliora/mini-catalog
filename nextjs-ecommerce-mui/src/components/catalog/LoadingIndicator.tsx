'use client';

/**
 * LoadingIndicator - Ultra-efficient loading states
 * 
 * Optimized for ProductDisplay with minimal overhead.
 * Handles skeletons, infinite scroll triggers, and loading states.
 */

import React from 'react';
import { Box, Typography, CircularProgress, Skeleton } from '@mui/material';

interface LoadingIndicatorProps {
  type: 'skeleton' | 'infinite-scroll' | 'empty';
  isCardView?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
}

// Memoized skeleton components
const CardSkeleton: React.FC = React.memo(() => (
  <Box sx={{ flex: '1 1 300px', minWidth: 280, maxWidth: 400, p: 2 }}>
    <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
    <Skeleton variant="text" sx={{ mb: 1 }} />
    <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
    <Skeleton variant="text" width="40%" />
  </Box>
));

const ListSkeleton: React.FC = React.memo(() => (
  <Box sx={{ display: 'flex', p: 2, gap: 2, width: '100%' }}>
    <Skeleton variant="rectangular" width={80} height={80} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="70%" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="50%" />
    </Box>
  </Box>
));

const LoadingIndicator: React.FC<LoadingIndicatorProps> = React.memo(({ 
  type, 
  isCardView, 
  loadingMore, 
  hasMore, 
  loadMoreRef 
}) => {
  if (type === 'skeleton') {
    const SkeletonComponent = isCardView ? CardSkeleton : ListSkeleton;
    
    if (isCardView) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonComponent key={index} />
          ))}
        </Box>
      );
    } else {
      return (
        <Box>
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonComponent key={index} />
          ))}
        </Box>
      );
    }
  }

  if (type === 'empty') {
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

  if (type === 'infinite-scroll') {
    return (
      <div 
        ref={loadMoreRef} 
        style={{ 
          height: loadingMore ? 60 : 20,
          backgroundColor: hasMore ? 'rgba(0,0,0,0.05)' : 'transparent',
          margin: '10px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
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
    );
  }

  return null;
});

LoadingIndicator.displayName = 'LoadingIndicator';

export default LoadingIndicator;
