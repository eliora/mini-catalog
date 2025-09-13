/**
 * ProductListItem Component - Accordion-Based Product Display
 * 
 * Advanced accordion component for displaying products in list view with expandable details.
 * Provides comprehensive product information with lazy-loaded detailed content and responsive design.
 * 
 * Features:
 * - Accordion-based expandable interface with smooth animations
 * - Lazy loading of detailed product information on expansion
 * - Responsive layouts (mobile vs desktop) with different information density
 * - Price loading integration with access control
 * - Quantity controls with real-time cart integration
 * - Image click-to-zoom functionality
 * - Error handling with retry capability
 * - Performance optimizations with React.memo
 * - Timeout handling for slow API responses
 * 
 * Architecture:
 * - Uses ResponsiveConfig for consistent sizing across devices
 * - Integrates with pricing hook for dynamic price loading
 * - Implements lazy loading pattern for accordion content
 * - Provides error boundaries and loading states
 * - Optimized for performance with useCallback and conditional rendering
 * 
 * Layout Patterns:
 * - Mobile: Vertical stack with compact information
 * - Desktop: Horizontal layout with expanded information
 * - Responsive price and quantity controls
 * - Consistent spacing and alignment
 * 
 * @param {Object} product - Product data object
 * @param {number} quantity - Current quantity in cart
 * @param {Function} onIncrement - Increment quantity callback
 * @param {Function} onDecrement - Decrement quantity callback
 * @param {Function} onQuantityChange - Direct quantity change callback
 * @param {Function} onImageClick - Image zoom callback
 * @param {Function} shouldRenderContent - Content rendering condition check
 * @param {Function} parseJsonField - JSON field parsing utility
 */

import React, { useState, useCallback } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Grid, Stack, Box, Typography, Button
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { getProductDetails } from '../../api/products';
import ProductAccordionContent from './ProductAccordionContent';
import { AccordionContentSkeleton } from '../common/SkeletonLoading';
import QuantityInput from '../common/QuantityInput';
import PriceDisplay from '../common/PriceDisplay';
import { usePricing } from '../../hooks/usePricing';
import ProductImage from '../common/ProductImage';
import ProductInfo from '../common/ProductInfo';
import ProductRef from '../common/ProductRef';
import ProductSize from '../common/ProductSize';
import useResponsiveConfig from '../common/ResponsiveConfig';

const ProductListItem = ({
  product,
  quantity,
  onIncrement,
  onDecrement,
  onQuantityChange,
  onImageClick,
  shouldRenderContent,
  parseJsonField
}) => {
  // ===== CONFIGURATION HOOKS =====
  const { isMobile, dimensions, spacing, size, variants } = useResponsiveConfig();
  const { canViewPrices, loadPrices, prices, pricesLoading } = usePricing();
  
  // ===== ACCORDION STATE =====
  const [expanded, setExpanded] = useState(false);
  const [accordionData, setAccordionData] = useState(null);
  const [loadingAccordion, setLoadingAccordion] = useState(false);
  
  // ===== COMPUTED VALUES =====
  // Get price for this product from the prices hook
  const productPrice = prices[product.ref] || null;

  // ===== PRICE LOADING EFFECT =====
  // Load price when component mounts if user can view prices
  React.useEffect(() => {
    if (canViewPrices && !productPrice && product.ref) {
      console.log('🔄 Loading price for product:', product.ref);
      loadPrices([product.ref]).catch(console.error);
    }
  }, [canViewPrices, productPrice, product.ref, loadPrices]);

  // ===== ACCORDION EXPANSION HANDLER =====
  // Handle accordion expansion with lazy loading of detailed product information
  const handleAccordionChange = useCallback(async (event, isExpanded) => {
    setExpanded(isExpanded);
    
    // Only load data if expanding and data hasn't been loaded yet
    if (isExpanded && !accordionData && !loadingAccordion) {
      setLoadingAccordion(true);
      
      // Set up timeout for slow API responses
      const timeoutId = setTimeout(() => {
        console.warn(`⏰ Accordion loading timeout for product ${product.ref}`);
        setAccordionData({ error: true, message: 'טעינה ארכה מדי - אנא נסה שוב' });
        setLoadingAccordion(false);
      }, 5000);
      
      try {
        // Load both product details and prices concurrently for optimal performance
        const [details] = await Promise.all([
          getProductDetails(product.ref),
          // Load price for this specific product when accordion opens (if not already loaded)
          canViewPrices && !prices[product.ref] ? loadPrices([product.ref]) : Promise.resolve()
        ]);
        
        clearTimeout(timeoutId);
        setAccordionData(details);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error(`❌ Failed to load accordion details for ${product.ref}:`, error);
        
        // Provide user-friendly error messages based on error type
        let userMessage = 'שגיאה בטעינת פרטי המוצר - אנא נסה שוב';
        if (error.message?.includes('timeout')) {
          userMessage = 'החיבור איטי מדי - אנא נסה שוב';
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          userMessage = 'בעיית חיבור - בדוק את החיבור לאינטרנט';
        }
        
        setAccordionData({ error: true, message: userMessage });
      } finally {
        setLoadingAccordion(false);
      }
    }
  }, [accordionData, loadingAccordion, product.ref, canViewPrices, prices, loadPrices]);

  // ===== RESPONSIVE PRICE AND CONTROLS COMPONENT =====
  // Smart responsive component for price display and quantity controls
  const PriceAndControls = ({ mobileLayout = false }) => {
    const screenType = isMobile ? 'mobile' : 'desktop';
    const controlSize = size;
    const variant = variants.button;
    const direction = (isMobile || mobileLayout) ? 'column' : 'row';
    
    return (
      <Stack 
        direction={direction} 
        spacing={direction === 'row' ? 2 : 1} 
        alignItems="center"
      >
        {/* Price and Size Information */}
        <Stack spacing={spacing.fine} alignItems="center">
          <PriceDisplay 
            price={productPrice} 
            canViewPrices={canViewPrices} 
            screenType={screenType} 
            align="center"
            loading={pricesLoading && !productPrice} 
          />
          <ProductSize product={product} size={size} />
        </Stack>
        
        {/* Quantity Controls - Prevent accordion expansion on interaction */}
        <Box 
          className="quantity-controls"
          onClick={(e) => e.stopPropagation()}
        >
          <QuantityInput
            value={quantity}
            onChange={onQuantityChange}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            size={controlSize}
            variant={variant}
            min={0}
            max={99}
          />
        </Box>
      </Stack>
    );
  };

  // ===== MOBILE LAYOUT COMPONENT =====
  // Optimized layout for mobile devices with vertical stacking
  const MobileLayout = () => (
    <Grid container spacing={1} alignItems="center">
      {/* Image and Reference Column */}
      <Grid item xs="auto">
        <Stack spacing={0.5} alignItems="center">
          <ProductImage product={product} onImageClick={onImageClick} size={80} padding={0.3} />
          <ProductRef product={product} size="small" />
        </Stack>
      </Grid>

      {/* Product Information Column */}
      <Grid item xs>
        <ProductInfo 
          product={product} 
          layout="vertical" 
          size="small" 
          showDescription={true}
        />
      </Grid>

      {/* Controls Column */}
      <Grid item xs="auto">
        <PriceAndControls mobileLayout={true} />
      </Grid>
    </Grid>
  );

  // ===== DESKTOP LAYOUT COMPONENT =====
  // Optimized layout for desktop devices with horizontal arrangement
  const DesktopLayout = () => (
    <Grid container spacing={2} alignItems="center" sx={{ mb: 0.5 }}>
      {/* Product Reference */}
      <Grid item xs="auto">
        <ProductRef product={product} showType={true} />
      </Grid>

      {/* Product Image */}
      <Grid item xs="auto">
        <ProductImage product={product} onImageClick={onImageClick} size={80} />
      </Grid>

      {/* Product Information */}
      <Grid item xs="auto">
        <ProductInfo 
          product={product} 
          layout="vertical" 
          size="medium" 
          showProductLine={true}
          showDescription={true}
        />
      </Grid>

      {/* Price and Controls (Right-aligned) */}
      <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <PriceAndControls />
      </Grid>
    </Grid>
  );

  // ===== RENDER =====
  return (
    <Accordion
      elevation={1}
      expanded={expanded}
      onChange={handleAccordionChange}
      disableGutters
      sx={{
        '&:before': { display: 'none' },
        borderRadius: '12px !important',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        '&.Mui-expanded': {
          margin: '8px 0',
          boxShadow: 2,
        },
        // Remove any overlay effects for clean appearance
        '& .MuiTouchRipple-root': {
          display: 'none',
        },
        '&:hover': {
          backgroundColor: 'transparent',
        },
        '&.Mui-focusVisible': {
          backgroundColor: 'transparent',
        },
      }}
    >
      {/* Accordion Header - Always Visible */}
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={(e) => {
          // Prevent accordion expansion when interacting with quantity controls
          if (e.target.closest('.quantity-controls')) {
            e.stopPropagation();
          }
        }}
        sx={{
          backgroundColor: 'background.paper',
          minHeight: dimensions.accordionHeight,
          '& .MuiAccordionSummary-content': {
            margin: { xs: '8px 0', md: '12px 0' },
            alignItems: 'center',
          },
          // Remove grey overlay/ripple effect for clean appearance
          '&:hover': {
            backgroundColor: 'background.paper',
          },
          '&.Mui-focusVisible': {
            backgroundColor: 'background.paper',
          },
          '& .MuiTouchRipple-root': {
            display: 'none',
          },
        }}
      >
        <Box sx={{ width: '100%' }}>
          {/* Responsive Layout Selection */}
          {isMobile ? <MobileLayout /> : <DesktopLayout />}
        </Box>
      </AccordionSummary>

      {/* Accordion Content - Lazy Loaded */}
      <AccordionDetails sx={{ px: { xs: 1, md: 2 }, py: { xs: 1, md: 2 } }}>
        {loadingAccordion ? (
          /* Loading State */
          <AccordionContentSkeleton />
        ) : accordionData?.error ? (
          /* Error State with Retry */
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              שגיאה בטעינת פרטי המוצר
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              {accordionData.message}
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => {
                setAccordionData(null);
                handleAccordionChange(null, true);
              }}
              sx={{ mt: 1 }}
            >
              נסה שוב
            </Button>
          </Box>
        ) : (
          /* Detailed Product Content */
          <ProductAccordionContent
            product={product}
            accordionData={accordionData}
            isLoadingDetails={loadingAccordion}
            shouldRenderContent={shouldRenderContent}
            parseJsonField={parseJsonField}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(ProductListItem);