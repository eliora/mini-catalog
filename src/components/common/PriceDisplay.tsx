import React from 'react';
import { Box, Typography } from '@mui/material';
import { usePricing } from '@/hooks/usePricing';

interface PriceDisplayProps {
  productRef?: string; // For secure pricing lookup
  price?: number | { unitPrice?: number; discountPrice?: number } | null; // Legacy fallback
  canViewPrices?: boolean; // Will be overridden by usePricing
  screenType?: 'mobile' | 'desktop';
  align?: 'left' | 'center' | 'right';
  loading?: boolean;
  variant?: string;
  color?: string;
  size?: 'small' | 'medium'; // Match ProductSize sizing
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ 
  productRef,
  price, 
  canViewPrices: _legacyCanView, // eslint-disable-line @typescript-eslint/no-unused-vars
  screenType = 'desktop', 
  align = 'left',
  loading = false,
  variant: propVariant,
  color: propColor,
  size = 'medium'
}) => {
  const { canViewPrices, getProductPrice } = usePricing();
  
  // Calculate fontSize based on size prop (matching ProductSize)
  const calculateFontSize = () => {
    if (size === 'small') return '0.65rem'; // Match ProductSize small
    return screenType === 'mobile' ? '0.9rem' : '1rem';
  };
  
  const fontSize = calculateFontSize();
  const variant = propVariant || (screenType === 'mobile' ? 'subtitle1' : 'h6');
  
  // Use secure pricing if productRef is provided
  const securePrice = productRef ? getProductPrice(productRef) : null;
  
  // Determine final price value
  let priceValue: number | null = null;
  let isDiscounted = false;
  
  if (securePrice) {
    // Use secure pricing
    priceValue = securePrice.discountPrice || securePrice.unitPrice;
    isDiscounted = !!securePrice.discountPrice && securePrice.discountPrice < securePrice.unitPrice;
  } else if (price) {
    // Fallback to legacy pricing (only if user can view prices)
    if (!canViewPrices) {
      priceValue = null;
    } else {
      priceValue = typeof price === 'object' && price !== null 
        ? (price.discountPrice || price.unitPrice || null)
        : Number(price) || null;
    }
  }
  
  // Don't show anything if user can't view prices - silent catalog mode
  if (!canViewPrices) {
    return null;
  }
  
  // Don't show anything if no valid price and not loading
  if (!loading && (!priceValue || isNaN(Number(priceValue)))) return null;
  
  return (
    <Box sx={{ textAlign: align }}>
      {loading ? (
        <Typography variant={variant as "body1" | "body2" | "caption" | "h6"} color="text.secondary" sx={{ fontSize }}>
          טוען מחיר...
        </Typography>
      ) : (
        <Box>
          <Typography variant={variant as "body1" | "body2" | "caption" | "h6"} color={propColor || "primary"} sx={{ fontWeight: 600, fontSize }}>
            ₪{Number(priceValue).toFixed(2)}
          </Typography>
          {isDiscounted && securePrice && (
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: fontSize === '0.9rem' ? '0.7rem' : '0.8rem',
                textDecoration: 'line-through',
                color: 'text.secondary',
                display: 'block'
              }}
            >
              ₪{securePrice.unitPrice.toFixed(2)}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default React.memo(PriceDisplay);

