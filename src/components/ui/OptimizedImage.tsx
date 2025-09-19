/**
 * OptimizedImage Component - Next.js Optimized Image with TypeScript
 * 
 * Enhanced image component that leverages Next.js Image optimization
 * while maintaining the flexibility of the original OptimizedImage.
 * 
 * Features:
 * - Next.js Image optimization with automatic WebP conversion
 * - Lazy loading with Intersection Observer fallback
 * - Progressive loading states with skeleton
 * - Error handling with fallback icons
 * - TypeScript support with proper prop types
 * - URL-based image transformation compatibility
 * - Responsive image sizing
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Box, Skeleton } from '@mui/material';
import { ImageNotSupported as ImageIcon } from '@mui/icons-material';
import { processImageUrl } from '../../utils/imageHelpers';

type ObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

interface OptimizedImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  onClick?: (() => void) | null;
  priority?: boolean; // For above-the-fold images
  quality?: number; // Image quality (1-100)
  sizes?: string; // Responsive image sizes
  objectFit?: ObjectFit;
  borderRadius?: number;
  backgroundColor?: string;
  style?: React.CSSProperties;
  fill?: boolean; // Next.js Image fill prop
  className?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  // Allow any additional props to be passed through
  [key: string]: unknown;
}

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt = '',
  width = 200,
  height = 200,
  onClick = null,
  priority = false,
  quality = 75,
  sizes = '100vw',
  objectFit = 'contain',
  borderRadius = 1,
  backgroundColor = 'grey.50',
  style = {},
  fill = false,
  className = '',
  placeholder = 'empty',
  blurDataURL,
  ...props
}) => {
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [useNextImage, setUseNextImage] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading (fallback when priority is false)
  useEffect(() => {
    if (priority || useNextImage) return; // Next.js Image handles lazy loading

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
        rootMargin: '50px',
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
  }, [priority, useNextImage]);

  // Determine if we should use Next.js Image or fallback
  const shouldUseNextImage = src && (src.startsWith('/') || src.startsWith('http'));

  // Handle image load states
  const handleLoadingStart = () => {
    setLoadState('loading');
  };

  const handleLoadingComplete = () => {
    setLoadState('loaded');
  };

  const handleError = () => {
    setLoadState('error');
    // Fallback to custom image loading if Next.js Image fails
    if (useNextImage) {
      setUseNextImage(false);
    }
  };

  // Common container styles
  const containerStyles = {
    width: fill ? '100%' : width,
    height: fill ? '100%' : height,
    borderRadius,
    backgroundColor,
    position: 'relative' as const,
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  // Render loading/placeholder state
  if (!isIntersecting || !src || loadState === 'idle') {
    return (
      <Box
        ref={containerRef}
        sx={containerStyles}
        onClick={onClick || undefined}
        className={className}
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
  if (loadState === 'error' && !useNextImage) {
    return (
      <Box
        ref={containerRef}
        sx={containerStyles}
        onClick={onClick || undefined}
        className={className}
        {...props}
      >
        <ImageIcon 
          color="disabled" 
          sx={{ fontSize: Math.min(Number(width), Number(height)) * 0.3 }} 
        />
      </Box>
    );
  }

  // Process image URL for optimization (if needed)
  const optimizedSrc = shouldUseNextImage && !src.startsWith('http') 
    ? src 
    : processImageUrl(src, {
        width: Math.round(Number(width)),
        quality: quality,
        format: 'webp'
      });

  return (
    <Box
      ref={containerRef}
      sx={containerStyles}
      onClick={onClick || undefined}
      className={className}
      {...props}
    >
      {/* Loading skeleton overlay */}
      {loadState === 'loading' && (
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

      {/* Next.js optimized image or fallback */}
      {shouldUseNextImage && useNextImage ? (
        <Image
          src={optimizedSrc}
          alt={alt}
          width={fill ? undefined : Number(width)}
          height={fill ? undefined : Number(height)}
          fill={fill}
          sizes={sizes}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          style={{
            objectFit,
            opacity: loadState === 'loaded' ? 1 : 0.8,
            transition: 'opacity 0.3s ease',
          }}
          onLoadingComplete={handleLoadingComplete}
          onLoad={handleLoadingStart}
          onError={handleError}
        />
      ) : (
        /* Fallback Next.js Image element */
        <Image
          src={optimizedSrc}
          alt={alt}
          width={fill ? undefined : Number(width)}
          height={fill ? undefined : Number(height)}
          fill={fill}
          sizes={sizes}
          style={{
            objectFit,
            opacity: loadState === 'loaded' ? 1 : 0.8,
            transition: 'opacity 0.3s ease',
          }}
          onLoad={handleLoadingComplete}
          onError={handleError}
        />
      )}
    </Box>
  );
};

export default React.memo(OptimizedImage);
