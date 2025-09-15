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
  const isUltraSmall = useMediaQuery('(max-width:450px)'); // Custom breakpoint for ultra-small devices
  
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
    <Box sx={{ 
      p: { 
        xs: isUltraSmall ? 1 : 2,  // Ultra-small-mobile (< 450px) vs mobile 
        md: 2 
      } 
    }}>
      {/* Row 1: Product Description + Image Gallery (Desktop only) */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: isUltraSmall ? 1.5 : 2.5, md: 3 },
        mb: { xs: isUltraSmall ? 1.5 : 2.5, md: 3 }
      }}>
        {/* Column 1: Product Info */}
        <Box sx={{ flex: { xs: '1', md: isMobile ? '1' : '2' } }}>
          <Typography 
            variant={isUltraSmall ? "body1" : "h6"} 
            sx={{ 
              fontWeight: 600, 
              mb: { xs: isUltraSmall ? 1 : 1.5, md: 2 }, 
              color: 'primary.main',
              fontSize: { xs: isUltraSmall ? '0.875rem' : '1.rem', md: '1.05rem' }
            }}
          >
            תיאור המוצר
          </Typography>
          <ContentRenderer
            content={productData.description || productData.description_he || product.short_description_he}
            shouldRenderContent={shouldRenderContent}
            fallback={
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontStyle: 'italic',
                  fontSize: { xs: isUltraSmall ? '0.7rem' : '0.8rem', md: '0.875rem' }
                }}
              >
                אין תיאור זמין למוצר זה
              </Typography>
            }
          />

          {/* Active Ingredients */}
          {shouldRenderContent(productData.activeIngredients || productData.wirkunginhaltsstoffe_he || productData.active_ingredients_he) && (
            <Box sx={{ mt: { xs: isUltraSmall ? 1.5 : 2, md: 3 } }}>
              <Typography 
                variant={isUltraSmall ? "body1" : "h6"} 
                sx={{ 
                  fontWeight: 600, 
                  mb: { xs: isUltraSmall ? 1 : 1.5, md: 2 }, 
                  color: 'primary.main',
                  fontSize: { xs: isUltraSmall ? '0.875rem' : '1.1rem', md: '1.25rem' }
                }}
              >
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
        <Box sx={{ 
          mb: { xs: isUltraSmall ? 1.5 : 2, md: 3 }
        }}>
          <ImageGallery
            images={images}
            productName={productName}
            mainHeight={isUltraSmall ? 180 : 220}  // Much smaller height for ultra-small-mobile (< 450px)
            onImageClick={onImageClick}
          />
        </Box>
      )}

      {/* Row 2: Inner Accordions */}
      <Stack spacing={isUltraSmall ? 1 : 1.5} sx={{ mt: { xs: isUltraSmall ? 1.5 : 2, md: 3 } }}>
        {/* Usage Instructions Accordion - Show only if data exists */}
        {shouldRenderContent(productData.usageInstructions || productData.anwendung_he || productData.usage_instructions_he) && (
          <Accordion 
            elevation={0} 
            sx={{ 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 1 
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="usage-content"
              id="usage-header"
              sx={{
                cursor: 'pointer',
                minHeight: isUltraSmall ? 36 : 44,
                px: { xs: isUltraSmall ? 1 : 1.5, md: 2 },
                bgcolor: 'background.paper',
                '&:hover': { backgroundColor: 'action.hover' },
                '& .MuiAccordionSummary-content': { 
                  my: isUltraSmall ? '6px' : '10px' 
                }
              }}
            >
              <Typography 
                variant={isUltraSmall ? "body2" : "subtitle1"} 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: isUltraSmall ? '0.75rem' : '0.9rem', md: '1rem' }
                }}
              >
                הוראות שימוש
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: isUltraSmall ? 1 : 1.5, md: 2 } }}>
              <Box sx={{ 
                fontSize: { xs: isUltraSmall ? '0.7rem' : '0.8rem', md: '0.875rem' },
                lineHeight: 1.4
              }}>
                <ContentRenderer
                  content={productData.usageInstructions || productData.anwendung_he || productData.usage_instructions_he}
                  shouldRenderContent={shouldRenderContent}
                  fallback={
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontStyle: 'italic',
                        fontSize: { xs: isUltraSmall ? '0.7rem' : '0.8rem', md: '0.875rem' }
                      }}
                    >
                      אין הוראות שימוש זמינות למוצר זה
                    </Typography>
                  }
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Ingredients Accordion - Show only if data exists */}
        {shouldRenderContent(productData.ingredients) && (
          <Accordion 
            elevation={0} 
            sx={{ 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 1 
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="ingredients-content"
              id="ingredients-header"
              sx={{
                cursor: 'pointer',
                minHeight: isUltraSmall ? 36 : 44,
                px: { xs: isUltraSmall ? 1 : 1.5, md: 2 },
                bgcolor: 'background.paper',
                '&:hover': { backgroundColor: 'action.hover' },
                '& .MuiAccordionSummary-content': { 
                  my: isUltraSmall ? '6px' : '10px' 
                }
              }}
            >
              <Typography 
                variant={isUltraSmall ? "body2" : "subtitle1"} 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: isUltraSmall ? '0.75rem' : '0.9rem', md: '1rem' }
                }}
              >
                רכיבים
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: isUltraSmall ? 1 : 1.5, md: 2 } }}>
              <Box sx={{ 
                fontSize: { xs: isUltraSmall ? '0.7rem' : '0.8rem', md: '0.875rem' },
                lineHeight: 1.4
              }}>
                <ContentRenderer 
                  content={productData.ingredients} 
                  shouldRenderContent={shouldRenderContent}
                  fallback={
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontStyle: 'italic',
                        fontSize: { xs: isUltraSmall ? '0.7rem' : '0.8rem', md: '0.875rem' }
                      }}
                    >
                      אין רכיבים זמינים למוצר זה
                    </Typography>
                  }
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
      </Stack>

    </Box>
  );
});

ProductAccordionContent.displayName = 'ProductAccordionContent';

export default ProductAccordionContent;
