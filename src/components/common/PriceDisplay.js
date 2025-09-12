import React from 'react';
import { Box, Typography } from '@mui/material';
import usePricing from '../../hooks/usePricing';

const PriceDisplay = ({ productRef, screenType = 'desktop', align = 'left' }) => {
  const { canViewPrices, formatPrice } = usePricing();
  
  if (!canViewPrices) return null;
  
  const price = formatPrice(productRef);
  if (!price || typeof price === 'string') return null;
  
  const fontSize = screenType === 'mobile' ? '0.9rem' : '1rem';
  const variant = screenType === 'mobile' ? 'subtitle1' : 'h6';
  
  return (
    <Box sx={{ textAlign: align }}>
      <Typography variant={variant} color="primary" sx={{ fontWeight: 600, fontSize }}>
        {price.display}
      </Typography>
      {price.isDiscounted && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ textDecoration: 'line-through', fontSize: '0.7rem' }}
        >
          {price.original}
        </Typography>
      )}
    </Box>
  );
};

export default React.memo(PriceDisplay);
