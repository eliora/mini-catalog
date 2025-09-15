import React from 'react';
import { Chip, Typography, Stack } from '@mui/material';

const ProductRef = ({ 
  product, 
  size = 'small', 
  showType = false,
  layout = 'vertical' // 'vertical' | 'horizontal'
}) => {
  if (layout === 'horizontal') {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip 
          label={product.ref}
          variant="outlined"
          size={size}
          color="primary"
          sx={{ 
            fontWeight: 600,
            fontSize: size === 'small' ? '0.65rem' : '0.75rem'
          }}
        />
        {showType && product.type && (
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.7rem',
              color: 'text.secondary'
            }}
          >
            {product.type}
          </Typography>
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={0.3} alignItems="center">
      <Chip 
        label={product.ref}
        variant="outlined"
        size={size}
        color="primary"
        sx={{ 
          fontWeight: 600,
          fontSize: size === 'small' ? '0.65rem' : '0.75rem',
          height: size === 'small' ? 20 : undefined,
          '& .MuiChip-label': size === 'small' ? { px: 0.5 } : undefined
        }}
      />
      {showType && product.type && (
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: '0.7rem',
            color: 'text.secondary',
            textAlign: 'center'
          }}
        >
          {product.type}
        </Typography>
      )}
    </Stack>
  );
};

export default React.memo(ProductRef);
