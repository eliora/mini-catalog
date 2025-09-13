/**
 * ProductCard Component
 * 
 * Card-based product display for grid view in the catalog.
 * Shows product image, information, pricing, and quantity controls.
 * 
 * Features:
 * - Optimized image display with lazy loading
 * - Product information (name, description, size)
 * - Price display (when user has access)
 * - Quantity input with increment/decrement controls
 * - Info button for detailed product view
 * - Responsive design with hover effects
 * 
 * @param {Object} product - Product data
 * @param {number} quantity - Current quantity in cart
 * @param {Function} onIncrement - Increment quantity callback
 * @param {Function} onDecrement - Decrement quantity callback
 * @param {Function} onQuantityChange - Direct quantity change callback
 * @param {Function} onInfoClick - Product info dialog callback
 * @param {Function} onImageClick - Image zoom callback
 * @param {boolean} canViewPrices - Whether user can see prices
 * @param {number} productPrice - Product price if available
 */

import React from 'react';
import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Chip, IconButton, Stack, Box
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import OptimizedImage from './ui/OptimizedImage';
import QuantityInput from './common/QuantityInput';
import useResponsiveConfig from './common/ResponsiveConfig';

const ProductCard = ({
  product,
  quantity,
  onIncrement,
  onDecrement,
  onQuantityChange,
  onInfoClick,
  onImageClick,
  canViewPrices = false,
  productPrice = null
}) => {
  const { dimensions, spacing, typography } = useResponsiveConfig();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
      }}
    >
      <CardMedia
        component="div"
        sx={{
          height: dimensions.cardHeight,
          position: 'relative',
          backgroundColor: 'grey.50',
        }}
      >
        <OptimizedImage
          src={product.mainPic || product.main_pic}
          alt={product.productName || product.hebrew_name}
          width={dimensions.cardHeight}
          height={dimensions.cardHeight}
          onClick={() => onImageClick && onImageClick(product.mainPic || product.main_pic)}
          objectFit="contain"
          style={{ padding: '8px' }}
          borderRadius={0}
        />

        <Chip
          label={`#${product.ref}`}
          size="small"
          variant="outlined"
          sx={{ position: 'absolute', top: 8, insetInlineEnd: 8, backgroundColor: 'rgba(255,255,255,0.9)' }}
        />
      </CardMedia>
      <CardContent sx={{ flexGrow: 1, p: spacing.content }}>
        <Stack spacing={1}>
          <Typography
            variant={typography.title}
            component="h3"
            sx={{
              fontWeight: 600,
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.productName || product.hebrew_name}
          </Typography>
          {(product.productName2 || product.english_name) && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {product.productName2 || product.english_name}
            </Typography>
          )}
          {product.short_description_he && (
            <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
              {product.short_description_he}
            </Typography>
          )}
          {product.notice && (
            <Typography
              variant="body2"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                color: 'text.secondary',
              }}
            >
              {product.notice}
            </Typography>
          )}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {product.size}
            </Typography>
            {canViewPrices && productPrice && (
              <Typography variant={typography.price} color="primary" sx={{ fontWeight: 600 }}>
                ‚×{Number(productPrice).toFixed(2)}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
      <CardActions sx={{ p: spacing.actions, pt: 0 }}>
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <QuantityInput
            value={quantity}
            onChange={(value) => onQuantityChange(product.ref, value.toString())}
            onIncrement={() => onIncrement(product)}
            onDecrement={() => onDecrement(product)}
            disabled={!canViewPrices}
            size="small"
            variant="outlined"
            min={0}
            max={99}
          />
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            size="small"
            onClick={() => onInfoClick(product)}
            sx={{
              color: 'primary.main',
              '&:hover': { backgroundColor: 'primary.main', color: 'primary.contrastText' },
            }}
          >
            <InfoIcon />
          </IconButton>
        </Stack>
      </CardActions>
    </Card>
  );
};

export default React.memo(ProductCard);

