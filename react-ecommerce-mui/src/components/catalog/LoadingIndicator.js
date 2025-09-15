/**
 * LoadingIndicator - Ultra-efficient loading states
 * 
 * Optimized for ProductDisplay with minimal overhead.
 * Handles skeletons, infinite scroll triggers, and loading states.
 * 
 * @param {string} type - 'skeleton', 'infinite-scroll', or 'empty'
 * @param {boolean} isCardView - Card vs list layout
 * @param {boolean} loadingMore - Show loading spinner
 * @param {boolean} hasMore - Show "scroll for more" message
 */

import React from 'react';
import { Box, Grid, Typography, CircularProgress, Skeleton } from '@mui/material';

// Memoized skeleton components
const CardSkeleton = React.memo(() => (
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Box sx={{ p: 2 }}>
      <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
      <Skeleton variant="text" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" />
    </Box>
  </Grid>
));

const ListSkeleton = React.memo(() => (
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
));

const LoadingIndicator = React.memo(({ type, isCardView, loadingMore, hasMore, loadMoreRef }) => {
  if (type === 'skeleton') {
    const SkeletonComponent = isCardView ? CardSkeleton : ListSkeleton;
    return (
      <Grid container spacing={isCardView ? 2 : 0}>
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonComponent key={index} />
        ))}
      </Grid>
    );
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

export default LoadingIndicator;
