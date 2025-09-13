/**
 * ProductAccordionContent Component - RESPONSIVE (Mobile + Desktop)
 * 
 * 🔧 COMPONENT PURPOSE: Detailed product view for LIST/COMPACT modes
 * 📱 DEVICE TARGET: Mobile-first, but works on desktop
 * 🎯 TRIGGER: User clicks to expand product in list view
 * 
 * WHAT IT DOES:
 * Displays detailed product information inside accordion/expandable sections within the catalog.
 * This is the content that appears when users click to expand a product in LIST VIEW.
 * 
 * USAGE CONTEXT:
 * - Used by ProductListItem component when user expands product details
 * - Appears in LIST/COMPACT view modes (not card view)
 * - Shows inside accordion panels for space-efficient detailed product info
 * - Loads additional product data via API when expanded
 * 
 * RESPONSIVE BEHAVIOR:
 * - Desktop: Shows description + image gallery side-by-side in 2 columns
 * - Mobile: Shows description only (images hidden to save space)
 * - Uses useMediaQuery to detect mobile vs desktop
 * 
 * FEATURES:
 * - Image gallery with thumbnail navigation (desktop only)
 * - Product descriptions with HTML content parsing
 * - Active ingredients section
 * - Mini-accordions for usage instructions and ingredients
 * - Lazy loading optimized images via ImageGallery component
 * - Memoized for performance (renders hundreds of times)
 * 
 * @param {Object} product - Main product data
 * @param {Object} accordionData - Additional product details from API
 * @param {boolean} isLoadingDetails - Loading state for additional details
 * @param {boolean} shouldRenderContent - Whether to render content (for performance)
 */

import React, { useMemo } from 'react';
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
import ImageGallery from './ImageGallery';
import ContentRenderer from './ContentRenderer';

const ProductAccordionContent = React.memo(({ product, accordionData, isLoadingDetails, shouldRenderContent }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Use accordion data if available, otherwise fall back to basic product data
  const productData = accordionData || product;
  const productName = product?.productName || product?.hebrew_name || '';

  // Memoize image gallery creation - must be before early return
  const images = useMemo(() => {
    if (!product) return [];
    
    const imageList = [];
    
    // Add main image
    if (product.mainPic || product.main_pic) {
      imageList.push(product.mainPic || product.main_pic);
    }
    
    // Add additional images from pics field
    if (productData?.pics) {
      const additionalPics = Array.isArray(productData.pics) 
        ? productData.pics 
        : productData.pics.split(' | ').filter(Boolean);
      imageList.push(...additionalPics);
    }
    
    return [...new Set(imageList)]; // Remove duplicates
  }, [productData?.pics, product]);

  if (!product) return null;

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
            <ContentRenderer 
              content={productData.description || productData.description_he} 
              shouldRenderContent={shouldRenderContent}
              fallback={
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  אין תיאור זמין למוצר זה
                </Typography>
              }
            />

            {/* Active Ingredients */}
            {shouldRenderContent(productData.activeIngredients || productData.wirkunginhaltsstoffe_he || productData.active_ingredients_he) && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                  רכיבים פעילים
                </Typography>
                <ContentRenderer 
                  content={productData.activeIngredients || productData.wirkunginhaltsstoffe_he || productData.active_ingredients_he}
                  shouldRenderContent={shouldRenderContent}
                />
              </Box>
            )}
          </Box>
        </Grid>

        {/* Column 2: Image Gallery - Desktop only */}
        {!isMobile && images.length > 0 && (
          <Grid item xs={12} md={4}>
            <ImageGallery
              images={images}
              productName={productName}
              mainHeight={360}
            />
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
              <ContentRenderer 
                content={productData.usageInstructions || productData.anwendung_he || productData.usage_instructions_he}
                shouldRenderContent={shouldRenderContent}
              />
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
              <ContentRenderer content={productData.ingredients} shouldRenderContent={shouldRenderContent} />
            </AccordionDetails>
          </Accordion>
        )}
      </Stack>
    </Box>
  );
});

export default ProductAccordionContent;
