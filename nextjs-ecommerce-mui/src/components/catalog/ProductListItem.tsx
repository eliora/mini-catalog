'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Box, 
  Typography,
  Chip,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Product } from '@/types/product';
import ProductImage from '@/components/common/ProductImage';
import ProductInfo from '@/components/common/ProductInfo';
import ProductRef from '@/components/common/ProductRef';
import ProductSize from '@/components/common/ProductSize';
import QuantityInput from '@/components/common/QuantityInput';
import PriceDisplay from '@/components/common/PriceDisplay';
import ProductAccordionContent from './ProductAccordionContent';
import useProductDetails from '@/hooks/useProductDetails';

interface ProductListItemProps {
  product: Product;
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onQuantityChange: (value: string) => void;
  onProductInfoClick: () => void;
  onImageClick: (src: string) => void;
  shouldRenderContent: (content: any) => boolean;
  parseJsonField: (field: any) => any;
}

const ProductListItem: React.FC<ProductListItemProps> = React.memo(({
  product,
  quantity,
  onDecrement,
  onIncrement,
  onQuantityChange,
  onProductInfoClick,
  onImageClick,
  shouldRenderContent,
  parseJsonField
}) => {
  const [expanded, setExpanded] = useState(false);
  const { productDetails, isLoading, fetchDetails } = useProductDetails();

  // Fetch product details when accordion expands
  useEffect(() => {
    if (expanded && !productDetails && product.ref) {
      fetchDetails(product.ref);
    }
  }, [expanded, productDetails, product.ref, fetchDetails]);

  // Handle accordion expansion
  const handleAccordionChange = useCallback(async (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  }, []);

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
        mb: 1,
        '&.Mui-expanded': {
          margin: '0 0 8px 0',
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
          minHeight: 72,
          '& .MuiAccordionSummary-content': {
            margin: '12px 0',
            alignItems: 'center',
          },
          // Remove grey overlay/ripple effect for clean appearance
          '&:hover': {
            backgroundColor: 'background.paper',
          },
          '&.Mui-focusVisible': {
            backgroundColor: 'background.paper',
          },
        }}
      >
        <Box sx={{ 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2 
        }}>
          <ProductRef 
            product={product} 
            showType={true} 
            layout="vertical"
            size="small" 
          />
          
          <ProductImage
            product={product}
            onImageClick={onImageClick}
            size={60}
          />
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ProductInfo product={product} variant="compact" />
          </Box>
          
          {/* Size and Price Section */}
          <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
            <ProductSize product={product} size="small" align="right" />
            <PriceDisplay 
              productRef={product.ref}
              price={product.unitPrice} 
              screenType="mobile" 
              align="right" 
            />
          </Box>
          
          <Box className="quantity-controls" sx={{ flexShrink: 0 }}>
            <QuantityInput
              value={quantity}
              onChange={onQuantityChange}
              onDecrement={onDecrement}
              onIncrement={onIncrement}
              size="small"
            />
          </Box>
          
          {/* Out of Stock Chip */}
          {product.qty === 0 && (
            <Chip 
              label="חסר במלאי" 
              size="small" 
              color="error" 
              variant="outlined"
              sx={{ 
                fontSize: '0.7rem', 
                height: 24,
                flexShrink: 0
              }} 
            />
          )}
        </Box>
      </AccordionSummary>

      {/* Accordion Content - Lazy Loaded */}
      <AccordionDetails sx={{ px: { xs: 1, md: 2 }, py: { xs: 1, md: 2 } }}>
        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              טוען פרטי מוצר...
            </Typography>
          </Box>
        ) : (
          <ProductAccordionContent
            product={product}
            accordionData={productDetails}
            isLoadingDetails={isLoading}
            shouldRenderContent={shouldRenderContent}
            parseJsonField={parseJsonField}
            onImageClick={onImageClick}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
});

ProductListItem.displayName = 'ProductListItem';

export default ProductListItem;