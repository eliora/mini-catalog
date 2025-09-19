import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import { Product } from '@/types/product';

interface ProductInfoProps {
  product: Product;
  layout?: 'vertical' | 'horizontal';
  size?: 'small' | 'medium' | 'large';
  showProductLine?: boolean;
  showDescription?: boolean;
  variant?: 'compact' | 'detailed' | 'default';
  hideShortDesc?: boolean;
  nameSize?: 'normal' | 'smaller' | 'ultraSmall';
}

interface SizeConfig {
  hebrewVariant: 'subtitle1' | 'h6' | 'h5';
  hebrewSize: string;
  englishSize: string;
  descSize: string;
  lineSize: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ 
  product, 
  layout = 'vertical',
  size = 'medium',
  showProductLine = false,
  showDescription = true,
  variant: _variant = 'default', // eslint-disable-line @typescript-eslint/no-unused-vars
  hideShortDesc = false,
  nameSize = 'normal'
}) => {
  const getSizes = (): SizeConfig => {
    switch (size) {
      case 'small':
        return {
          hebrewVariant: 'subtitle1',
          hebrewSize: nameSize === 'ultraSmall' ? '0.665rem' : nameSize === 'smaller' ? '0.85rem' : '0.95rem', // 0.95 * 0.7 = 0.665
          englishSize: nameSize === 'ultraSmall' ? '0.595rem' : nameSize === 'smaller' ? '0.75rem' : '0.85rem', // 0.85 * 0.7 = 0.595
          descSize: '0.7rem',
          lineSize: '0.7rem'
        };
      case 'large':
        return {
          hebrewVariant: 'h5',
          hebrewSize: '1.2rem',
          englishSize: '1rem',
          descSize: '0.85rem',
          lineSize: '0.75rem'
        };
      default: // medium
        return {
          hebrewVariant: 'h6',
          hebrewSize: nameSize === 'ultraSmall' ? '0.7rem' : nameSize === 'smaller' ? '0.9rem' : '1rem', // 1.0 * 0.7 = 0.7
          englishSize: nameSize === 'ultraSmall' ? '0.63rem' : nameSize === 'smaller' ? '0.8rem' : '0.9rem', // 0.9 * 0.7 = 0.63
          descSize: '0.8rem',
          lineSize: '0.7rem'
        };
    }
  };

  const sizes = getSizes();
  const isHorizontal = layout === 'horizontal';

  return (
    <Stack spacing={isHorizontal ? 0.1 : 0.2}>
      {/* Product Line */}
      {showProductLine && (product.productLine || product.product_line) && (
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: sizes.lineSize,
            color: 'text.secondary',
            fontWeight: 500
          }}
        >
          {product.productLine || product.product_line}
        </Typography>
      )}
      
      {/* Names */}
      {isHorizontal ? (
        <Box>
          <Typography 
            variant={sizes.hebrewVariant}
            component="span"
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              fontSize: sizes.hebrewSize,
              mr: 1
            }}
          >
            {product.productName || product.hebrew_name}
          </Typography>
          <Typography 
            variant="body2" 
            component="span"
            sx={{ 
              fontStyle: 'italic',
              color: 'text.secondary',
              fontSize: sizes.englishSize
            }}
          >
            {product.productName2 || product.english_name}
          </Typography>
        </Box>
      ) : (
        <>
          <Typography 
            variant={sizes.hebrewVariant}
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              fontSize: sizes.hebrewSize,
              lineHeight: 1.2
            }}
          >
            {product.productName || product.hebrew_name}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              fontStyle: 'italic',
              color: 'text.secondary',
              fontSize: sizes.englishSize
            }}
          >
            {product.productName2 || product.english_name}
          </Typography>
        </>
      )}
      
      {/* Description - Hide if hideShortDesc is true */}
      {showDescription && !hideShortDesc && product.short_description_he && (
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            fontStyle: 'italic',
            fontSize: sizes.descSize,
            lineHeight: 1.3
          }}
        >
          {product.short_description_he}
        </Typography>
      )}
    </Stack>
  );
};

export default React.memo(ProductInfo);

