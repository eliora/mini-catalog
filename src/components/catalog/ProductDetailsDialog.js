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
 * - Triggered from ProductCard or ProductListItem "info" button clicks
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
 * 
 * @param {Object} product - Product data
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Close handler
 * @param {number} currentQuantity - Current quantity in cart
 * @param {Function} onDecrement - Quantity decrement handler
 * @param {Function} onIncrement - Quantity increment handler
 * @param {Function} onQuantityChange - Direct quantity change handler
 * @param {Function} onImageClick - Image zoom click handler
 * @param {Function} shouldRenderContent - Content validation function
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
  Grid,
  Chip,
  Divider
} from '@mui/material';
import { Close as CloseIcon, ZoomIn as ZoomInIcon } from '@mui/icons-material';
import { getAllImages } from '../../utils/imageHelpers';
import { formatPrice } from '../../utils/dataHelpers';
import ImageGallery from './ImageGallery';
import ContentRenderer from './ContentRenderer';
import SimpleQuantityInput from './SimpleQuantityInput';

const ProductDetailsDialog = React.memo(({
  product,
  open,
  onClose,
  currentQuantity = 0,
  onDecrement,
  onIncrement,
  onQuantityChange,
  onImageClick,
  shouldRenderContent
}) => {
  // Memoize expensive operations
  const images = useMemo(() => getAllImages(product), [product]);
  const productName = product?.productName || product?.hebrew_name || '';

  if (!product) return null;

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

          <Grid container spacing={0} sx={{ minHeight: 400 }}>
            {/* Images Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3 }}>
                <ImageGallery
                  images={images}
                  productName={productName}
                  onImageClick={onImageClick}
                  mainHeight={400}
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
            </Grid>

            {/* Product Details */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, overflow: 'auto' }}>
                {/* Header */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                    {productName}
                  </Typography>
                  
                  {(product.productName2 || product.product_name) && (
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {product.productName2 || product.product_name}
                    </Typography>
                  )}

                  <Chip label={`קוד: ${product.ref}`} variant="outlined" size="small" sx={{ mb: 2 }} />
                </Box>

                {/* Price */}
                {product.unitPrice && (
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 700, mb: 2 }}>
                    {formatPrice(product.unitPrice)}
                  </Typography>
                )}

                {/* Specs */}
                {shouldRenderContent(product.size) && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>גודל:</strong> {product.size}
                  </Typography>
                )}
                {shouldRenderContent(product.productType) && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>סוג מוצר:</strong> {product.productType}
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

                {shouldRenderContent(product.activeIngredients || product.wirkunginhaltsstoffe_he) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      רכיבים פעילים
                    </Typography>
                    <ContentRenderer content={product.activeIngredients || product.wirkunginhaltsstoffe_he} shouldRenderContent={shouldRenderContent} />
                  </Box>
                )}

                {shouldRenderContent(product.usageInstructions || product.anwendung_he) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      הוראות שימוש
                    </Typography>
                    <ContentRenderer content={product.usageInstructions || product.anwendung_he} shouldRenderContent={shouldRenderContent} />
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
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {/* Quantity Controls */}
      <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            כמות:
          </Typography>
          <SimpleQuantityInput
            value={currentQuantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onChange={onQuantityChange}
          />
        </Box>

        <Button variant="contained" onClick={onClose} size="large">
          סגור
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ProductDetailsDialog;
