import React from 'react';
import { Typography } from '@mui/material';

const ProductSize = ({ 
  product, 
  size = 'small', // 'small' | 'medium'
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
