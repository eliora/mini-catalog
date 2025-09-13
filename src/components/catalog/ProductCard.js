/**
 * ProductCard Component - Grid View Product Display
 * 
 * Card-based product display component optimized for grid view in the catalog.
 * Provides comprehensive product information with interactive controls for shopping.
 * 
 * Features:
 * - Optimized image display with lazy loading and click-to-zoom
 * - Multi-language product information (Hebrew/English names)
 * - Price display with access control for authorized users
 * - Quantity input with increment/decrement controls (0-99 range)
 * - Info button for detailed product view dialog
 * - Responsive design with smooth hover effects and transitions
 * - Product reference chip display
 * - Size and description information
 * - Accessibility-compliant interactions
 * 
 * Design Patterns:
 * - Uses ResponsiveConfig for consistent sizing across devices
 * - Implements Material-UI Card with structured layout
 * - Provides visual hierarchy with typography variants
 * - Includes loading and error states
 * 
 * @param {Object} product - Product data object
 * @param {string} product.ref - Product reference/ID
 * @param {string} product.productName - Primary product name (Hebrew)
 * @param {string} product.productName2 - Secondary product name (English)
 * @param {string} product.mainPic - Main product image URL
 * @param {string} product.size - Product size information
 * @param {string} product.notice - Product notice/description
 * @param {string} product.short_description_he - Short Hebrew description
 * @param {number} quantity - Current quantity in cart (0-99)
 * @param {Function} onIncrement - Increment quantity callback
 * @param {Function} onDecrement - Decrement quantity callback  
 * @param {Function} onQuantityChange - Direct quantity change callback
 * @param {Function} onInfoClick - Product info dialog callback
 * @param {Function} onImageClick - Image zoom callback
 * @param {boolean} canViewPrices - Whether user can see prices
 * @param {number|null} productPrice - Product price if available and authorized
 */

import React from 'react';
import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Chip, IconButton, Stack, Box
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import OptimizedImage from '../ui/OptimizedImage';
import QuantityInput from '../common/QuantityInput';
import useResponsiveConfig from '../common/ResponsiveConfig';

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
  // ===== RESPONSIVE CONFIGURATION =====
  const { dimensions, spacing, typography } = useResponsiveConfig();

  // ===== RENDER =====
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
      {/* Product Image Section */}
      <CardMedia
        component="div"
        sx={{
          height: dimensions.cardHeight,
          position: 'relative',
          backgroundColor: 'grey.50',
        }}
      >
        {/* Optimized Product Image */}
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

        {/* Product Reference Chip */}
        <Chip
          label={`#${product.ref}`}
          size="small"
          variant="outlined"
          sx={{ position: 'absolute', top: 8, insetInlineEnd: 8, backgroundColor: 'rgba(255,255,255,0.9)' }}
        />
      </CardMedia>
      {/* Product Information Section */}
      <CardContent sx={{ flexGrow: 1, p: spacing.content }}>
        <Stack spacing={1}>
          {/* Primary Product Name */}
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
          
          {/* Secondary Product Name (English) */}
          {(product.productName2 || product.english_name) && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {product.productName2 || product.english_name}
            </Typography>
          )}
          
          {/* Short Description */}
          {product.short_description_he && (
            <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
              {product.short_description_he}
            </Typography>
          )}
          
          {/* Product Notice/Description */}
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
          
          {/* Size and Price Row */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {/* Product Size */}
            <Typography variant="body2" color="text.secondary">
              {product.size}
            </Typography>
            
            {/* Price Display (if authorized) */}
            {canViewPrices && productPrice && (
              <Typography variant={typography.price} color="primary" sx={{ fontWeight: 600 }}>
                ‚×{Number(productPrice).toFixed(2)}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
      {/* Action Controls Section */}
      <CardActions sx={{ p: spacing.actions, pt: 0 }}>
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          {/* Quantity Input Controls */}
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
          
          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Product Info Button */}
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

