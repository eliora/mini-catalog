'use client';

/**
 * ProductCard Component - Product Card Display
 * 
 * Displays product information in a card format for catalog view.
 * Includes image, details, pricing, and quantity controls.
 */

import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Product } from '@/types/product';
import ProductImage from '@/components/common/ProductImage';
import ProductInfo from '@/components/common/ProductInfo';
import QuantityInput from '@/components/common/QuantityInput';
import PriceDisplay from '@/components/common/PriceDisplay';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onQuantityChange: (value: string) => void;
  onProductInfoClick: () => void;
  onImageClick: (src: string) => void;
  shouldRenderContent: (content: any) => boolean;
  parseJsonField: (field: any) => any;
  canViewPrices: boolean;
  productPrice?: any;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onDecrement,
  onIncrement,
  onQuantityChange,
  onProductInfoClick,
  onImageClick,
  shouldRenderContent,
  parseJsonField,
  canViewPrices,
  productPrice
}) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 4
        }
      }}
      onClick={onProductInfoClick}
    >
      <Box sx={{ p: 2, textAlign: 'center', position: 'relative' }}>
        <ProductImage
          product={product}
          onImageClick={onImageClick}
          size={120}
        />
        
        {/* Product Reference Chip */}
        <Chip
          label={`#${product.ref}`}
          size="small"
          variant="outlined"
          sx={{ 
            position: 'absolute', 
            top: 8, 
            insetInlineEnd: 8, 
            backgroundColor: 'rgba(255,255,255,0.9)' 
          }}
        />
      </Box>
      
      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        <ProductInfo product={product} />
        
        {canViewPrices && productPrice && (
          <Box sx={{ mt: 2 }}>
            <PriceDisplay
              price={productPrice}
              variant="body2"
              color="primary"
            />
          </Box>
        )}
        
        <Box sx={{ mt: 2 }}>
          <QuantityInput
            value={quantity}
            onChange={onQuantityChange}
            onDecrement={onDecrement}
            onIncrement={onIncrement}
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(ProductCard);
