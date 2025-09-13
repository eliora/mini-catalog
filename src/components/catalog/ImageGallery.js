/**
 * ImageGallery Component - Ultra-efficient reusable image gallery
 * 
 * Optimized for high-frequency rendering with minimal overhead.
 * Used by ProductDetailsDialog and ProductAccordionContent.
 * 
 * @param {Array} images - Image URLs array
 * @param {string} productName - Product name for alt text
 * @param {Function} onImageClick - Optional click handler
 * @param {number} mainHeight - Main image height (default 360)
 * @param {boolean} showThumbnails - Show thumbnail navigation
 */

import React, { useState, useMemo } from 'react';
import { Box, CardMedia } from '@mui/material';
import { processImageUrl } from '../../utils/imageHelpers';

const ImageGallery = React.memo(({ 
  images = [], 
  productName = '', 
  onImageClick,
  mainHeight = 360,
  showThumbnails = true 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Memoize processed image URLs
  const processedImages = useMemo(() => ({
    main: images.map(img => processImageUrl(img, { width: 360, quality: 85, format: 'webp' })),
    thumbs: showThumbnails ? images.map(img => processImageUrl(img, { width: 72, quality: 80, format: 'webp' })) : []
  }), [images, showThumbnails]);

  if (!images.length) return null;

  const currentImage = processedImages.main[selectedIndex];

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
          cursor: onImageClick ? 'pointer' : (images.length > 1 ? 'pointer' : 'default')
        }}
        onClick={() => {
          if (onImageClick) {
            onImageClick(images[selectedIndex]);
          } else if (images.length > 1) {
            setSelectedIndex((prev) => (prev + 1) % images.length);
          }
        }}
      >
        <CardMedia
          component="img"
          image={currentImage}
          alt={`${productName} - תמונה ${selectedIndex + 1}`}
          sx={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transition: 'opacity 0.2s ease'
          }}
        />
      </Box>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <Box sx={{ display: 'flex', gap: 0.5, overflowX: 'auto' }}>
          {processedImages.thumbs.map((thumb, index) => (
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
                '&:hover': { opacity: 1, borderColor: 'primary.main' }
              }}
              onClick={() => setSelectedIndex(index)}
            >
              <CardMedia
                component="img"
                image={thumb}
                alt={`תמונה ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
});

export default ImageGallery;
