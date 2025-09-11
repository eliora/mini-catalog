import React, { useState, useRef, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';
import { ImageNotSupported as ImageIcon } from '@mui/icons-material';
import { processImageUrl } from '../utils/imageHelpers';

/**
 * OptimizedImage Component
 * 
 * Features:
 * - Lazy loading with Intersection Observer
 * - Progressive loading (placeholder → thumbnail → full image)
 * - Skeleton loading states
 * - Error handling with fallbacks
 * - URL-based image transformation for thumbnails
 * - Blur-to-sharp transition effect
 */
const OptimizedImage = ({
  src,
  alt = '',
  width = 200,
  height = 200,
  onClick = null,
  priority = false, // For above-the-fold images
  quality = 75, // Image quality (1-100)
  sizes = '100vw', // Responsive image sizes
  objectFit = 'contain',
  borderRadius = 1,
  backgroundColor = 'grey.50',
  style = {},
  ...props
}) => {
  const [loadState, setLoadState] = useState('idle'); // idle, loading, loaded, error
  const [currentSrc, setCurrentSrc] = useState('');
  const [isIntersecting, setIsIntersecting] = useState(priority);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const loadingAbortController = useRef(null);



  // Intersection Observer for lazy loading with proper cleanup
  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1,
      }
    );

    observerRef.current = observer;
    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [priority]);

  // Optimized image loading with transformations and cleanup
  useEffect(() => {
    if (!src || !isIntersecting) return;

    // Cancel previous loading if exists
    if (loadingAbortController.current) {
      loadingAbortController.current.abort();
    }

    loadingAbortController.current = new AbortController();
    setLoadState('loading');

    // Apply image transformations for optimized loading
    const optimizedSrc = processImageUrl(src, {
      width: Math.round(width),
      quality: quality,
      format: 'webp' // Use WebP for better compression
    });

    const img = new Image();
    
    const handleLoad = () => {
      if (!loadingAbortController.current?.signal.aborted) {
        setCurrentSrc(optimizedSrc);
        setLoadState('loaded');
      }
    };
    
    const handleError = () => {
      if (!loadingAbortController.current?.signal.aborted) {
        // Fallback to original image if optimized version fails
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          if (!loadingAbortController.current?.signal.aborted) {
            setCurrentSrc(src);
            setLoadState('loaded');
          }
        };
        fallbackImg.onerror = () => {
          if (!loadingAbortController.current?.signal.aborted) {
            setLoadState('error');
          }
        };
        fallbackImg.src = src;
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = optimizedSrc;

    return () => {
      if (loadingAbortController.current) {
        loadingAbortController.current.abort();
      }
      // Clean up image event listeners
      img.onload = null;
      img.onerror = null;
    };
  }, [src, isIntersecting, width, quality]);

  // Render placeholder/skeleton
  if (!isIntersecting || !src) {
    return (
      <Box
        ref={containerRef}
        sx={{
          width,
          height,
          borderRadius,
          backgroundColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
          ...style,
        }}
        onClick={onClick}
        {...props}
      >
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{ borderRadius }}
        />
      </Box>
    );
  }

  // Render error state
  if (loadState === 'error') {
    return (
      <Box
        ref={containerRef}
        sx={{
          width,
          height,
          borderRadius,
          backgroundColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onClick ? 'pointer' : 'default',
          ...style,
        }}
        onClick={onClick}
        {...props}
      >
        <ImageIcon color="disabled" sx={{ fontSize: Math.min(width, height) * 0.3 }} />
      </Box>
    );
  }

  // Render loading or loaded image
  return (
    <Box
      ref={containerRef}
      sx={{
        width,
        height,
        borderRadius,
        backgroundColor,
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
      {...props}
    >
      {/* Loading skeleton overlay */}
      {loadState === 'loading' && !currentSrc && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            borderRadius,
          }}
        />
      )}
      
      {/* Actual image */}
      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          sizes={sizes}
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            opacity: loadState === 'loaded' ? 1 : 0.8,
            ...style,
          }}
          onLoad={() => {
            if (loadState !== 'loaded') {
              setLoadState('loaded');
            }
          }}
          onError={() => {
            setLoadState('error');
          }}
        />
      )}
    </Box>
  );
};

export default React.memo(OptimizedImage);
