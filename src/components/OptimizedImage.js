import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Skeleton, IconButton } from '@mui/material';
import { ImageNotSupported as ImageIcon } from '@mui/icons-material';

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

  // Generate thumbnail URL by appending transformation params
  const generateThumbnailUrl = useCallback((originalUrl, targetWidth = 150) => {
    if (!originalUrl) return '';
    
    try {
      // For Supabase Storage URLs, add transformation parameters
      if (originalUrl.includes('supabase.co/storage')) {
        const url = new URL(originalUrl);
        url.searchParams.set('width', targetWidth.toString());
        url.searchParams.set('height', targetWidth.toString());
        url.searchParams.set('resize', 'contain');
        url.searchParams.set('quality', Math.min(quality, 60).toString()); // Lower quality for thumbnails
        url.searchParams.set('format', 'webp'); // Use modern format
        return url.toString();
      }
      
      // For external URLs, try adding common transformation params
      // This works with many CDN services
      const url = new URL(originalUrl);
      url.searchParams.set('w', targetWidth.toString());
      url.searchParams.set('h', targetWidth.toString());
      url.searchParams.set('f', 'webp');
      url.searchParams.set('q', Math.min(quality, 60).toString());
      return url.toString();
    } catch (error) {
      // If URL parsing fails, return original
      console.warn('Failed to generate thumbnail URL:', error);
      return originalUrl;
    }
  }, [quality]);

  // Generate optimized full-size URL
  const generateOptimizedUrl = useCallback((originalUrl, targetWidth) => {
    if (!originalUrl) return '';
    
    try {
      if (originalUrl.includes('supabase.co/storage')) {
        const url = new URL(originalUrl);
        if (targetWidth) {
          url.searchParams.set('width', targetWidth.toString());
          url.searchParams.set('resize', 'contain');
        }
        url.searchParams.set('quality', quality.toString());
        url.searchParams.set('format', 'webp');
        return url.toString();
      }
      
      const url = new URL(originalUrl);
      if (targetWidth) {
        url.searchParams.set('w', targetWidth.toString());
      }
      url.searchParams.set('f', 'webp');
      url.searchParams.set('q', quality.toString());
      return url.toString();
    } catch (error) {
      return originalUrl;
    }
  }, [quality]);

  // Intersection Observer for lazy loading
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

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [priority]);

  // Progressive image loading
  useEffect(() => {
    if (!src || !isIntersecting) return;

    setLoadState('loading');

    // Load thumbnail first
    const thumbnailUrl = generateThumbnailUrl(src, Math.min(width, 150));
    const thumbnailImg = new Image();
    
    thumbnailImg.onload = () => {
      setCurrentSrc(thumbnailUrl);
      
      // Then load full image
      const fullUrl = generateOptimizedUrl(src, width);
      const fullImg = new Image();
      
      fullImg.onload = () => {
        setCurrentSrc(fullUrl);
        setLoadState('loaded');
      };
      
      fullImg.onerror = () => {
        // Try original URL as fallback
        const originalImg = new Image();
        originalImg.onload = () => {
          setCurrentSrc(src);
          setLoadState('loaded');
        };
        originalImg.onerror = () => {
          setLoadState('error');
        };
        originalImg.src = src;
      };
      
      fullImg.src = fullUrl;
    };
    
    thumbnailImg.onerror = () => {
      // Skip thumbnail, try full image directly
      const fullUrl = generateOptimizedUrl(src, width);
      const fullImg = new Image();
      
      fullImg.onload = () => {
        setCurrentSrc(fullUrl);
        setLoadState('loaded');
      };
      
      fullImg.onerror = () => {
        setLoadState('error');
      };
      
      fullImg.src = fullUrl;
    };
    
    thumbnailImg.src = thumbnailUrl;
  }, [src, isIntersecting, generateThumbnailUrl, generateOptimizedUrl, width]);

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
            transition: 'opacity 0.3s ease-in-out, filter 0.3s ease-in-out',
            opacity: loadState === 'loaded' ? 1 : 0.7,
            filter: loadState === 'loaded' ? 'none' : 'blur(2px)',
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
