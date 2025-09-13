/**
 * ProductAccordionContent Component
 * 
 * Displays detailed product information in an accordion layout within the catalog.
 * Handles image galleries, product specifications, descriptions, and related metadata.
 * 
 * Features:
 * - Image gallery with thumbnail navigation
 * - Responsive design (mobile/desktop layouts)
 * - Product specifications display
 * - HTML content parsing for descriptions
 * - Lazy loading optimized images
 * 
 * Used by ProductListItem component in catalog accordion displays.
 * 
 * @param {Object} product - Main product data
 * @param {Object} accordionData - Additional product details from API
 * @param {boolean} isLoadingDetails - Loading state for additional details
 * @param {boolean} shouldRenderContent - Whether to render content (for performance)
 * @param {Function} parseJsonField - Utility to parse JSON fields safely
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Stack,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { containsHtml } from '../../utils/dataHelpers';
import { processImageUrl } from '../../utils/imageHelpers';

const ProductAccordionContent = ({ product, accordionData, isLoadingDetails, shouldRenderContent, parseJsonField }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  if (!product) return null;

  // Get optimized main image URL (360px for main display)
  const getMainImageUrl = (url) => {
    return processImageUrl(url, { width: 360, quality: 85, format: 'webp' });
  };

  // Get optimized thumbnail URL (72px for thumbnails)
  const getThumbnailImageUrl = (url) => {
    return processImageUrl(url, { width: 72, quality: 80, format: 'webp' });
  };

  // Use accordion data if available, otherwise fall back to basic product data
  const productData = accordionData || product;

  const renderHtmlContent = (content) => {
    if (!shouldRenderContent(content)) return null;
    
    if (containsHtml(content)) {
      return (
        <Typography 
          variant="body2" 
          sx={{ 
            lineHeight: 1.6,
            '& p': { mb: 1 },
            '& ul': { mb: 1, pl: 2 },
            '& li': { mb: 0.5 }
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    
    return (
      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
        {content}
      </Typography>
    );
  };

  // Get images for gallery
  const getImageGallery = () => {
    const images = [];
    
    // Add main image
    if (product.mainPic || product.main_pic) {
      images.push(product.mainPic || product.main_pic);
    }
    
    // Add additional images from pics field
    if (productData.pics) {
      const additionalPics = Array.isArray(productData.pics) 
        ? productData.pics 
        : productData.pics.split(' | ').filter(Boolean);
      images.push(...additionalPics);
    }
    
    return [...new Set(images)]; // Remove duplicates
  };

  const images = getImageGallery();

  if (isLoadingDetails) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          טוען פרטים נוספים...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      {/* Row 1: Product Description + Image Gallery (Desktop only) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Column 1: Product Info */}
        <Grid item xs={12} md={isMobile ? 12 : 8}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
              תיאור המוצר
            </Typography>
            {shouldRenderContent(productData.description || productData.description_he) ? (
              renderHtmlContent(productData.description || productData.description_he)
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                אין תיאור זמין למוצר זה
              </Typography>
            )}

            {/* Active Ingredients - moved under product description */}
            {shouldRenderContent(productData.activeIngredients || productData.wirkunginhaltsstoffe_he || productData.active_ingredients_he) && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                  רכיבים פעילים
                </Typography>
                {renderHtmlContent(
                  productData.activeIngredients || 
                  productData.wirkunginhaltsstoffe_he || 
                  productData.active_ingredients_he
                )}
              </Box>
            )}
          </Box>
        </Grid>

        {/* Column 2: Image Gallery - Desktop only */}
        {!isMobile && (
          <Grid item xs={12} md={4}>
          <Box>
            {images.length > 0 ? (
              <Box>
                {/* Main Image Display - 360px for optimal viewing */}
                <Box
                  sx={{
                    width: '100%',
                    height: 360, // Set to 360px
                    backgroundColor: 'grey.50',
                    borderRadius: 1,
                    mb: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <Box
                    component="img"
                    src={getMainImageUrl(images[selectedImageIndex])}
                    alt={`${product.productName || product.hebrew_name} - תמונה ראשית`}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      transition: 'all 0.3s ease',
                      cursor: images.length > 1 ? 'pointer' : 'default'
                    }}
                    onClick={() => {
                      if (images.length > 1) {
                        setSelectedImageIndex((prev) => (prev + 1) % images.length);
                      }
                    }}
                  />
                </Box>
                
                {/* Compact Horizontal Thumbnails - Only show if more than 1 image */}
                {images.length > 1 && (
                  <Box 
                    sx={{ 
                      display: 'flex',
                      gap: 0.5,
                      overflowX: 'auto',
                      pb: 0.5,
                      '&::-webkit-scrollbar': {
                        height: 4,
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: 'grey.100',
                        borderRadius: 2,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'grey.400',
                        borderRadius: 2,
                      }
                    }}
                  >
                    {images.map((image, index) => (
                      <Box
                        key={index}
                        sx={{
                          minWidth: 72,
                          width: 72,
                          height: 72,
                          backgroundColor: 'grey.50',
                          borderRadius: 0.5,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          opacity: selectedImageIndex === index ? 1 : 0.7,
                          border: selectedImageIndex === index ? 2 : 1,
                          borderColor: selectedImageIndex === index ? 'primary.main' : 'grey.200',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': {
                            opacity: 1,
                            borderColor: 'primary.main',
                            transform: 'scale(1.05)'
                          }
                        }}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <Box
                          component="img"
                          src={getThumbnailImageUrl(image)}
                          alt={`תמונה ${index + 1}`}
                          sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                אין תמונות זמינות
              </Typography>
            )}
          </Box>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Row 3: Mini Accordions */}
      <Stack spacing={2}>
        {/* Usage Instructions Mini Accordion */}
        {shouldRenderContent(productData.usageInstructions || productData.anwendung_he || productData.usage_instructions_he) && (
          <Accordion elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                הוראות שימוש
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderHtmlContent(
                productData.usageInstructions || 
                productData.anwendung_he || 
                productData.usage_instructions_he
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Ingredients Mini Accordion */}
        {shouldRenderContent(productData.ingredients) && (
          <Accordion elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                רכיבים
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderHtmlContent(productData.ingredients)}
            </AccordionDetails>
          </Accordion>
        )}
      </Stack>
    </Box>
  );
};

export default ProductAccordionContent;
