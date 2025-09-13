import React from 'react';
import { Box, Typography } from '@mui/material';

const PriceDisplay = ({ 
  price, 
  canViewPrices = false, 
  screenType = 'desktop', 
  align = 'left',
  loading = false 
}) => {
  const fontSize = screenType === 'mobile' ? '0.9rem' : '1rem';
  const variant = screenType === 'mobile' ? 'subtitle1' : 'h6';
  
  // Don't show anything if user can't view prices
  if (!canViewPrices) return null;
  
  // Extract price value from price object or direct value
  const priceValue = price?.unitPrice || price?.discountPrice || price;
  
  // Don't show anything if no valid price and not loading
  if (!loading && (!priceValue || isNaN(Number(priceValue)))) return null;
  
  return (
    <Box sx={{ textAlign: align }}>
      {loading ? (
        <Typography variant={variant} color="text.secondary" sx={{ fontSize }}>
          טוען מחיר...
        </Typography>
      ) : (
        <Typography variant={variant} color="primary" sx={{ fontWeight: 600, fontSize }}>
          ₪{Number(priceValue).toFixed(2)}
        </Typography>
      )}
    </Box>
  );
};

export default React.memo(PriceDisplay);
