'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography,
  Chip,
  useMediaQuery,
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
import useResponsiveConfig from '@/components/common/ResponsiveConfig';

interface ProductListItemProps {
  product: Product;
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onQuantityChange: (value: string) => void;
  onProductInfoClick: () => void;
  onImageClick: (src: string) => void;
  shouldRenderContent: (content: unknown) => boolean;
}

const ProductListItem: React.FC<ProductListItemProps> = React.memo(({
  product,
  quantity,
  onDecrement,
  onIncrement,
  onQuantityChange,
  onProductInfoClick: _onProductInfoClick, // eslint-disable-line @typescript-eslint/no-unused-vars
  onImageClick,
  shouldRenderContent
}) => {
  const [expanded, setExpanded] = useState(false);
  const { productDetails, isLoading, fetchDetails } = useProductDetails();
  // Responsive config (matches original React implementation)
  const { isMobile, dimensions } = useResponsiveConfig();
  const isUltraSmall = useMediaQuery('(max-width:450px)');

  // Fetch product details when accordion expands
  useEffect(() => {
    if (expanded && !productDetails && product.ref) {
      fetchDetails(product.ref);
    }
  }, [expanded, productDetails, product.ref, fetchDetails]);

  return (
    <Box sx={{ 
      mb: 1, 
      borderRadius: '12px', 
      overflow: 'hidden',
      boxShadow: 1,
      '&:before': { display: 'none' },
      border: '1px solid',
      borderColor: 'divider',
    }}>
      {/* Product Summary Row - Made clickable but avoids nested buttons */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isUltraSmall ? 1 : { xs: 1.5, md: 2 }, // Slightly larger gap between thumbnail and names
          px: { xs: 1.5, md: 2 },
          py: { xs: 1, md: 1.5 },
          backgroundColor: 'background.paper',
          // Match original header height via responsive config
          minHeight: dimensions.accordionHeight,
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
          '&:hover': { backgroundColor: 'action.hover' }
        }}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onClick={(e) => {
          // Don't expand if clicking on quantity controls
          if ((e.target as Element).closest?.('.quantity-controls')) {
            return;
          }
          setExpanded(!expanded);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
      >
        {/* Mobile: Ref chip overlays thumbnail at bottom, Desktop: Ref chip separate */}
        {isMobile || isUltraSmall ? (
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <ProductImage
              product={product}
              onImageClick={onImageClick}
              size={isUltraSmall ? 51 : 60} // 15% smaller: 60 * 0.85 = 51
            />
            <Box sx={{ 
              position: 'absolute', 
              bottom: -8, // At the very bottom of the thumbnail
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              zIndex: 1
            }}>
              <ProductRef 
                product={product} 
                showType={false} // Remove type on mobile and ultra-small screens
                layout="vertical"
                size="small" 
              />
            </Box>
          </Box>
        ) : (
          <>
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
          </>
        )}
        
        <Box sx={{ 
          flex: 1, 
          minWidth: 0,
          // Ultra-small: reduce/eliminate right margin to names column
          ...(isUltraSmall && { mr: 0, pr: 0 })
        }}>
          <ProductInfo 
            product={product} 
            variant="compact"
            hideShortDesc={isUltraSmall} // Hide short description on ultra-small screens
            nameSize={isUltraSmall ? 'ultraSmall' : 'normal'} // Much smaller names on ultra-small
          />
        </Box>
        
        {/* Mobile: Size/Price on top of qty buttons, Desktop: Side by side */}
        {isMobile || isUltraSmall ? (
          <Box sx={{ 
            flexShrink: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: isUltraSmall ? 'flex-end' : 'center', // Ultra-small: align to right edge
            gap: 0.5,
            // Ultra-small: remove left padding/margin to push qty to edge
            ...(isUltraSmall && { ml: 0, pl: 0 })
          }}>
            {/* Size and Price on top */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isUltraSmall ? 'row' : 'column', // Inline for ultra-small
              alignItems: isUltraSmall ? 'center' : 'center', 
              justifyContent: isUltraSmall ? 'flex-end' : 'center',
              gap: isUltraSmall ? 0.5 : 0.25 // Slightly more gap when inline
            }}>
              <ProductSize product={product} size="small" align={isUltraSmall ? 'right' : 'center'} />
              <PriceDisplay 
                productRef={product.ref}
                price={product.unitPrice} 
                screenType="mobile" 
                align={isUltraSmall ? 'right' : 'center'}
                size="small" // Match ProductSize
              />
            </Box>
            
            {/* Quantity Controls below - Only show if product is in stock, make 15% smaller */}
            {(product.qty ?? 0) > 0 && (
              <Box 
                className="quantity-controls" 
                sx={{ 
                  transform: 'scale(0.85)', // 15% smaller
                  transformOrigin: isUltraSmall ? 'right center' : 'center',
                  // Ultra-small: no margin/padding on left to push to edge
                  ...(isUltraSmall && { ml: 0, pl: 0 })
                }}
                onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
              >
                <QuantityInput
                  value={quantity}
                  onChange={onQuantityChange}
                  onDecrement={onDecrement}
                  onIncrement={onIncrement}
                  size="small"
                />
              </Box>
            )}
          </Box>
        ) : (
          <>
            {/* Desktop: Size and Price Section */}
            <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <ProductSize product={product} size="small" align="right" />
              <PriceDisplay 
                productRef={product.ref}
                price={product.unitPrice} 
                screenType="mobile" 
                align="right"
                size="small" // Match ProductSize
              />
            </Box>
            
            {/* Desktop: Quantity Controls - Only show if product is in stock */}
            {(product.qty ?? 0) > 0 && (
              <Box 
                className="quantity-controls" 
                sx={{ flexShrink: 0 }}
                onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
              >
                <QuantityInput
                  value={quantity}
                  onChange={onQuantityChange}
                  onDecrement={onDecrement}
                  onIncrement={onIncrement}
                  size="small"
                />
              </Box>
            )}
          </>
        )}
        
        {/* Out of Stock Chip - Show instead of quantity controls when out of stock */}
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
        
        {/* Expand Icon */}
        <Box sx={{ flexShrink: 0, ml: 1 }}>
          <ExpandMoreIcon 
            sx={{ 
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
              color: 'text.secondary'
            }} 
          />
        </Box>
      </Box>
      
      {/* Expandable Content */}
      {expanded && (
        <Box sx={{ 
          borderTop: 1, 
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}>
          <Box sx={{ px: { xs: 1, md: 2 }, py: { xs: 1, md: 2 } }}>
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
                onImageClick={onImageClick}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
});

ProductListItem.displayName = 'ProductListItem';

export default ProductListItem;