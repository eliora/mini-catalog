'use client';

import React from 'react';
import { Box, BoxProps } from '@mui/material';
import Image from 'next/image';
import { getThumbnailUrl } from '@/utils/imageHelpers';
import { Product } from '@/types/product';

interface ProductImageProps extends Omit<BoxProps, 'component' | 'src' | 'alt' | 'onClick'> {
  product: Product;
  onImageClick?: (imageSrc: string) => void;
  size?: number;
  borderRadius?: number;
  padding?: number;
  priority?: boolean; // For Next.js Image optimization
  quality?: number; // Image quality (1-100)
}

const ProductImage: React.FC<ProductImageProps> = ({ 
  product, 
  onImageClick, 
  size = 80, 
  borderRadius = 1,
  padding = 0.5,
  priority = false,
  quality = 80,
  sx,
  ...boxProps 
}) => {
  // Get image source with fallback handling - use cleaned URL from imageHelpers
  const imageSrc = getThumbnailUrl(product.mainPic || product.main_pic || '');
  const altText = product.productName || product.hebrew_name || 'Product image';
  
  // Check if image is from ImageKit (use Next.js Image) or external (use regular img)
  const isImageKitUrl = imageSrc?.includes('ik.imagekit.io') || imageSrc?.includes('via.placeholder.com');
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImageClick) {
      onImageClick(product.mainPic || product.main_pic || '');
    }
  };

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius,
        cursor: onImageClick ? 'pointer' : 'default',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        p: padding,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx
      }}
      onClick={onImageClick ? handleClick : undefined}
      {...boxProps}
    >
      {imageSrc ? (
        isImageKitUrl ? (
          // Use Next.js Image for ImageKit URLs (optimized)
          <Image
            src={imageSrc}
            alt={altText}
            fill
            style={{
              objectFit: 'contain',
              padding: `${padding * 8}px`, // Convert MUI spacing to pixels
            }}
            priority={priority}
            quality={quality}
            sizes={`${size}px`}
            onError={(e) => {
              // Fallback to placeholder on error
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/${size}x${size}/f5f5f5/cccccc?text=No+Image`;
            }}
          />
        ) : (
          // Use Next.js Image for external URLs
          <Image
            src={imageSrc}
            alt={altText}
            fill
            style={{
              objectFit: 'contain',
              padding: `${padding * 8}px`, // Convert MUI spacing to pixels
            }}
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={(e) => {
              // Fallback to placeholder on error
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/${size}x${size}/f5f5f5/cccccc?text=No+Image`;
            }}
          />
        )
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.100',
            color: 'text.secondary',
            fontSize: '0.75rem',
            textAlign: 'center'
          }}
        >
          No Image
        </Box>
      )}
    </Box>
  );
};

export default React.memo(ProductImage);

