import React, { useState, useCallback } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Grid, Stack, Box, Typography, Button
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { getProductDetails } from '../api/products';
import ProductAccordionContent from './product/ProductAccordionContent';
import { AccordionContentSkeleton } from './common/SkeletonLoading';
import QuantityInput from './common/QuantityInput';
import PriceDisplay from './common/PriceDisplay';
import { usePricing } from '../hooks/usePricing';
import ProductImage from './common/ProductImage';
import ProductInfo from './common/ProductInfo';
import ProductRef from './common/ProductRef';
import ProductSize from './common/ProductSize';
import useResponsiveConfig from './common/ResponsiveConfig';

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
  const { isMobile, dimensions, spacing, size, variants } = useResponsiveConfig();
  const { canViewPrices, loadPrices, prices } = usePricing();
  
  // Accordion state
  const [expanded, setExpanded] = useState(false);
  const [accordionData, setAccordionData] = useState(null);
  const [loadingAccordion, setLoadingAccordion] = useState(false);
  
  // Get price for this product from the prices hook
  const productPrice = prices[product.ref] || null;

  // Handle accordion expansion with lazy loading
  const handleAccordionChange = useCallback(async (event, isExpanded) => {
    setExpanded(isExpanded);
    
    if (isExpanded && !accordionData && !loadingAccordion) {
      setLoadingAccordion(true);
      
      const timeoutId = setTimeout(() => {
        console.warn(`⏰ Accordion loading timeout for product ${product.ref}`);
        setAccordionData({ error: true, message: 'טעינה ארכה מדי - אנא נסה שוב' });
        setLoadingAccordion(false);
      }, 5000);
      
        try {
          // Load both product details and prices concurrently
          const [details] = await Promise.all([
            getProductDetails(product.ref),
            // Load price for this specific product when accordion opens
            canViewPrices && !prices[product.ref] ? loadPrices([product.ref]) : Promise.resolve()
          ]);
          
        clearTimeout(timeoutId);
          setAccordionData(details);
        } catch (error) {
        clearTimeout(timeoutId);
        console.error(`❌ Failed to load accordion details for ${product.ref}:`, error);
        
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

  // Smart responsive price, size and quantity controls
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
        <Stack spacing={spacing.fine} alignItems="center">
          <PriceDisplay 
            price={productPrice} 
            canViewPrices={canViewPrices} 
            screenType={screenType} 
            align="center" 
          />
          <ProductSize product={product} size={size} />
        </Stack>
        
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

  // Mobile layout
  const MobileLayout = () => (
    <Grid container spacing={1} alignItems="center">
      <Grid item xs="auto">
        <Stack spacing={0.5} alignItems="center">
          <ProductImage product={product} onImageClick={onImageClick} size={80} padding={0.3} />
          <ProductRef product={product} size="small" />
        </Stack>
      </Grid>

      <Grid item xs>
        <ProductInfo 
          product={product} 
          layout="vertical" 
          size="small" 
          showDescription={true}
        />
      </Grid>

      <Grid item xs="auto">
        <PriceAndControls mobileLayout={true} />
      </Grid>
    </Grid>
  );

  // Desktop layout
  const DesktopLayout = () => (
    <Grid container spacing={2} alignItems="center" sx={{ mb: 0.5 }}>
      <Grid item xs="auto">
        <ProductRef product={product} showType={true} />
      </Grid>

      <Grid item xs="auto">
        <ProductImage product={product} onImageClick={onImageClick} size={80} />
      </Grid>

      <Grid item xs="auto">
        <ProductInfo 
          product={product} 
          layout="vertical" 
          size="medium" 
          showProductLine={true}
          showDescription={true}
        />
      </Grid>

      <Grid item xs sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <PriceAndControls />
      </Grid>
    </Grid>
  );

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
        // Remove any overlay effects
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
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={(e) => {
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
          // Remove grey overlay/ripple effect
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
          {isMobile ? <MobileLayout /> : <DesktopLayout />}
            </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: { xs: 1, md: 2 }, py: { xs: 1, md: 2 } }}>
        {loadingAccordion ? (
          <AccordionContentSkeleton />
        ) : accordionData?.error ? (
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