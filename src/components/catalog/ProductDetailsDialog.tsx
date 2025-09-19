'use client';

/**
 * ProductDetailsDialog Component - DESKTOP OPTIMIZED (Modal Dialog)
 * 
 * 🔧 COMPONENT PURPOSE: Full-featured product modal for detailed viewing
 * 🖥️ DEVICE TARGET: Desktop/tablet optimized (large screens)
 * 🎯 TRIGGER: User clicks "info" button on any product card/item
 * 
 * WHAT IT DOES:
 * Full-screen modal dialog that displays comprehensive product information.
 * This is the detailed product view that opens when users click "info" button on product cards.
 * 
 * USAGE CONTEXT:
 * - Triggered from ProductListItem "info" button clicks
 * - Used in ALL view modes (catalog cards, list, compact)
 * - Opens as overlay modal dialog on top of catalog
 * - Primary detailed product view for desktop users
 * 
 * RESPONSIVE BEHAVIOR:
 * - Optimized for desktop/tablet (large screens)
 * - Uses MUI Dialog with maxWidth="lg" for spacious layout
 * - Two-column layout: Images left, Details right
 * - Mobile: Still works but less optimal than accordion view
 * 
 * FEATURES:
 * - Full image gallery with zoom functionality
 * - Complete product specifications and descriptions
 * - Quantity controls with increment/decrement
 * - Price display and product codes
 * - HTML content rendering for rich descriptions
 * - Close button and ESC key support
 * - Memoized for performance (renders frequently)
 */

import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import { Close as CloseIcon, ZoomIn as ZoomInIcon } from '@mui/icons-material';
import { Product } from '@/types/product';
import { getAllImages } from '@/utils/imageHelpers';
import { formatPrice } from '@/utils/dataHelpers';
import ImageGallery from './ImageGallery';
import ContentRenderer from './ContentRenderer';
import SimpleQuantityInput from './SimpleQuantityInput';

interface ProductDetailsDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  currentQuantity?: number;
  quantity?: number;
  onDecrement?: () => void;
  onIncrement?: () => void;
  onQuantityChange?: (quantity: number | string) => void;
  onImageClick?: (src: string) => void;
  shouldRenderContent?: (content: unknown) => boolean;
  canViewPrices?: boolean;
  productPrice?: { unitPrice?: number; unit_price?: number; currency?: string } | null;
}

const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = React.memo(({
  product,
  open,
  onClose,
  currentQuantity = 0,
  quantity = 0,
  onDecrement,
  onIncrement,
  onQuantityChange,
  onImageClick,
  shouldRenderContent = (content: unknown): boolean => content != null && content !== '',
  canViewPrices = false,
  productPrice
}) => {
  // Memoize expensive operations
  const images = useMemo(() => getAllImages(product as unknown as Record<string, unknown> || {}), [product]);
  const productName = String(product?.product_name || product?.productName || '');
  const finalQuantity = currentQuantity || quantity;

  if (!product) return null;

  const handleQuantityChange = (value: number | string) => {
    if (onQuantityChange) {
      const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
      onQuantityChange(numValue);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ position: 'relative' }}>
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1,
              bgcolor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 400 }}>
            {/* Images Section */}
            <Box sx={{ flex: { xs: '1', md: '0 0 50%' } }}>
              <Box sx={{ p: 3, position: 'relative' }}>
                <ImageGallery
                  images={images}
                  productName={productName}
                />
                {onImageClick && images.length > 0 && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                      bgcolor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white'
                    }}
                    onClick={() => onImageClick(images[0])}
                  >
                    <ZoomInIcon />
                  </IconButton>
                )}
              </Box>
            </Box>

            {/* Product Details */}
            <Box sx={{ flex: { xs: '1', md: '0 0 50%' } }}>
              <Box sx={{ p: 3, overflow: 'auto' }}>
                {/* Header */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                    {productName}
                  </Typography>
                  
                  {(product.product_name_2 || product.productName2) && (
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {String(product.product_name_2 || product.productName2)}
                    </Typography>
                  )}

                  <Chip label={`קוד: ${product.ref}`} variant="outlined" size="small" sx={{ mb: 2 }} />
                </Box>

                {/* Price */}
                {canViewPrices && (productPrice || product.unit_price || product.unitPrice) && (
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 700, mb: 2 }}>
                    {formatPrice(productPrice?.unit_price || product.unit_price || product.unitPrice)}
                  </Typography>
                )}

                {/* Specs */}
                {shouldRenderContent(product.size) && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>גודל:</strong> {product.size}
                  </Typography>
                )}
                {shouldRenderContent(product.product_type) && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>סוג מוצר:</strong> {product.product_type}
                  </Typography>
                )}
                {shouldRenderContent(product.skin_type_he) && (
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>מתאים לסוג עור:</strong> {product.skin_type_he}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Descriptions */}
                {shouldRenderContent(product.short_description_he) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      תיאור קצר
                    </Typography>
                    <ContentRenderer content={product.short_description_he} shouldRenderContent={shouldRenderContent} />
                  </Box>
                )}

                {shouldRenderContent(product.description || product.description_he) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      תיאור מלא
                    </Typography>
                    <ContentRenderer content={product.description || product.description_he} shouldRenderContent={shouldRenderContent} />
                  </Box>
                )}

                {shouldRenderContent(product.active_ingredients) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      רכיבים פעילים
                    </Typography>
                    <ContentRenderer 
                      content={product.active_ingredients} 
                      shouldRenderContent={shouldRenderContent} 
                    />
                  </Box>
                )}

                {shouldRenderContent(product.usage_instructions) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      הוראות שימוש
                    </Typography>
                    <ContentRenderer 
                      content={product.usage_instructions} 
                      shouldRenderContent={shouldRenderContent} 
                    />
                  </Box>
                )}

                {shouldRenderContent(product.notice) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      הערות
                    </Typography>
                    <ContentRenderer content={product.notice} shouldRenderContent={shouldRenderContent} />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {/* Quantity Controls */}
      <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            כמות:
          </Typography>
          <SimpleQuantityInput
            value={finalQuantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onChange={handleQuantityChange}
          />
        </Box>

        <Button variant="contained" onClick={onClose} size="large">
          סגור
        </Button>
      </DialogActions>
    </Dialog>
  );
});

ProductDetailsDialog.displayName = 'ProductDetailsDialog';

export default ProductDetailsDialog;