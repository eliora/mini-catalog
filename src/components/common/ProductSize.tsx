import React from 'react';
import { Typography } from '@mui/material';
import { Product } from '@/types/product';

interface ProductSizeProps {
  product: Product;
  size?: 'small' | 'medium';
  align?: 'center' | 'left' | 'right';
}

const ProductSize: React.FC<ProductSizeProps> = ({ 
  product, 
  size = 'small',
  align = 'center' 
}) => {
  if (!product.size) return null;

  const fontSize = size === 'small' ? '0.65rem' : '0.7rem';

  return (
    <Typography 
      variant="caption" 
      sx={{ 
        fontSize,
        color: 'text.secondary',
        textAlign: align
      }}
    >
      {product.size}
    </Typography>
  );
};

export default React.memo(ProductSize);

