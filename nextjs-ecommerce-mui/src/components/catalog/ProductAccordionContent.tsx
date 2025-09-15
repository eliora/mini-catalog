'use client';

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
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import ImageGallery from './ImageGallery';
import ContentRenderer from '@/components/catalog/ContentRenderer';
import { Product } from '@/types/product';

interface ProductAccordionContentProps {
  product: Product;
  accordionData?: any;
  isLoadingDetails: boolean;
  shouldRenderContent: (content: any) => boolean;
  parseJsonField?: (field: any) => any;
  onImageClick?: (imageSrc: string) => void;
}

const ProductAccordionContent: React.FC<ProductAccordionContentProps> = React.memo(({ 
  product, 
  accordionData, 
  isLoadingDetails, 
  shouldRenderContent, 
  parseJsonField,
  onImageClick 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Use accordion data if available, otherwise fall back to basic product data
  const productData = accordionData || product;
  const productName = product?.product_name || product?.productName || '';


  // Memoize image gallery creation - must be before early return
  const images = useMemo(() => {
    if (!product) return [];
    
    const imageList: string[] = [];
    
    // Add main image
    if (product.main_pic || product.mainPic) {
      imageList.push(product.main_pic || product.mainPic || '');
    }
    
    // Add additional images from pics field
    if (productData?.pics) {
      const additionalPics = Array.isArray(productData.pics) 
        ? productData.pics 
        : String(productData.pics).split(' | ').filter(Boolean);
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
      <Box sx={{ 
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        mb: 3
      }}>
        {/* Column 1: Product Info */}
        <Box sx={{ flex: { xs: '1', md: isMobile ? '1' : '2' } }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
            תיאור המוצר
          </Typography>
                 <ContentRenderer
                   content={productData.description || productData.description_he || product.short_description_he}
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

        {/* Column 2: Image Gallery - Desktop only */}
        {!isMobile && (
          <Box sx={{ flex: '0 0 33%', maxWidth: '300px' }}>
            <ImageGallery
              images={images}
              productName={productName}
              mainHeight={360}
            />
            
          </Box>
        )}
      </Box>

      {/* Mobile Image Gallery */}
      {isMobile && images.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ImageGallery
            images={images}
            productName={productName}
            mainHeight={250}
            onImageClick={onImageClick}
          />
        </Box>
        
      )}

      {/* Row 2: Inner Accordions */}
      <Box sx={{ width: '100%', mt: 3 }}>
        {/* Usage Instructions Accordion - Show only if data exists */}
        {shouldRenderContent(productData.usageInstructions || productData.anwendung_he || productData.usage_instructions_he) && (
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="usage-content"
              id="usage-header"
              sx={{
                cursor: 'pointer',
                minHeight: 48,
                px: 2,
                bgcolor: 'background.paper',
                '& .MuiAccordionSummary-content': { my: 0 }
              }}
            >
              <Typography>הוראות שימוש</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ContentRenderer
                content={productData.usageInstructions || productData.anwendung_he || productData.usage_instructions_he}
                shouldRenderContent={shouldRenderContent}
                fallback={
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    אין הוראות שימוש זמינות למוצר זה
                  </Typography>
                }
              />
            </AccordionDetails>
          </Accordion>
        )}

        {/* Ingredients Accordion - Show only if data exists */}
        {shouldRenderContent(productData.ingredients) && (
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="ingredients-content"
              id="ingredients-header"
              sx={{
                cursor: 'pointer',
                minHeight: 48,
                px: 2,
                bgcolor: 'background.paper',
                '& .MuiAccordionSummary-content': { my: 0 }
              }}
            >
              <Typography>רכיבים</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ContentRenderer 
                content={productData.ingredients} 
                shouldRenderContent={shouldRenderContent}
                fallback={
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    אין רכיבים זמינים למוצר זה
                  </Typography>
                }
              />
            </AccordionDetails>
          </Accordion>
        )}
      </Box>

    </Box>
  );
});

ProductAccordionContent.displayName = 'ProductAccordionContent';

export default ProductAccordionContent;
