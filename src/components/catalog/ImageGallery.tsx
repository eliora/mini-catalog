'use client';

/**
 * ImageGallery Component - Ultra-efficient reusable image gallery
 * 
 * Optimized for high-frequency rendering with minimal overhead.
 * Used by ProductDetailsDialog and ProductAccordionContent.
 * 
 * @param images - Image URLs array
 * @param productName - Product name for alt text
 * @param onImageClick - Optional click handler
 * @param mainHeight - Main image height (default 360)
 * @param showThumbnails - Show thumbnail navigation
 */

import React, { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';
import { getThumbnailUrl } from '@/utils/imageHelpers';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  onImageClick?: (imageSrc: string) => void;
  mainHeight?: number;
  showThumbnails?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = React.memo(({
  images = [],
  productName = '',
  onImageClick,
  mainHeight = 360,
  showThumbnails = true
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Memoize processed image URLs
  const processedImages = useMemo(() => ({
    main: images.map(img => getThumbnailUrl(img)),
    thumbs: showThumbnails ? images.map(img => getThumbnailUrl(img)) : []
  }), [images, showThumbnails]);

  if (!images.length) return null;

  const currentImage = processedImages.main[selectedIndex];
  const isImageKitUrl = currentImage?.includes('ik.imagekit.io') || currentImage?.includes('via.placeholder.com');

  return (
    <Box>
      {/* Main Image */}
      <Box
        sx={{
          width: '100%',
          height: mainHeight,
          bgcolor: 'grey.50',
          borderRadius: 1,
          mb: showThumbnails && images.length > 1 ? 1.5 : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: onImageClick ? 'pointer' : (images.length > 1 ? 'pointer' : 'default'),
          position: 'relative'
        }}
        onClick={() => {
          if (onImageClick) {
            onImageClick(images[selectedIndex]);
          } else if (images.length > 1) {
            setSelectedIndex((prev) => (prev + 1) % images.length);
          }
        }}
      >
        {currentImage ? (
          isImageKitUrl ? (
            <Image
              src={currentImage}
              alt={`${productName} - תמונה ${selectedIndex + 1}`}
              fill
              style={{
                objectFit: 'contain',
                transition: 'opacity 0.2s ease'
              }}
              sizes={`${mainHeight}px`}
              priority={selectedIndex === 0}
            />
          ) : (
            <img
              src={currentImage}
              alt={`${productName} - תמונה ${selectedIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transition: 'opacity 0.2s ease'
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
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            אין תמונה זמינה
          </Box>
        )}
      </Box>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <Box sx={{ display: 'flex', gap: 0.5, overflowX: 'auto' }}>
          {processedImages.thumbs.map((thumb, index) => {
            const isThumbImageKit = thumb?.includes('ik.imagekit.io') || thumb?.includes('via.placeholder.com');
            return (
              <Box
                key={index}
                sx={{
                  minWidth: 72,
                  width: 72,
                  height: 72,
                  bgcolor: 'grey.50',
                  borderRadius: 0.5,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  opacity: selectedIndex === index ? 1 : 0.7,
                  border: selectedIndex === index ? 2 : 1,
                  borderColor: selectedIndex === index ? 'primary.main' : 'grey.200',
                  position: 'relative',
                  '&:hover': { opacity: 1, borderColor: 'primary.main' }
                }}
                onClick={() => setSelectedIndex(index)}
              >
                {thumb ? (
                  isThumbImageKit ? (
                    <Image
                      src={thumb}
                      alt={`תמונה ${index + 1}`}
                      fill
                      style={{
                        objectFit: 'cover'
                      }}
                      sizes="72px"
                    />
                  ) : (
                    <img
                      src={thumb}
                      alt={`תמונה ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
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
                      fontSize: '0.75rem',
                      color: 'text.secondary'
                    }}
                  >
                    אין תמונה
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
});

ImageGallery.displayName = 'ImageGallery';

export default ImageGallery;
