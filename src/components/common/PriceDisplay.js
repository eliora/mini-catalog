import React from 'react';
import { Box, Typography } from '@mui/material';

const PriceDisplay = ({ 
  price, 
  canViewPrices = false, 
  screenType = 'desktop', 
  align = 'left' 
}) => {
  if (!canViewPrices || !price) return null;
  
  const fontSize = screenType === 'mobile' ? '0.9rem' : '1rem';
  const variant = screenType === 'mobile' ? 'subtitle1' : 'h6';
  
  return (
    <Box sx={{ textAlign: align }}>
      <Typography variant={variant} color="primary" sx={{ fontWeight: 600, fontSize }}>
        ₪{Number(price).toFixed(2)}
      </Typography>
    </Box>
  );
};

export default React.memo(PriceDisplay);
