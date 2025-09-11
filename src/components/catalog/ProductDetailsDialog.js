import React, { useState } from 'react';
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
  Divider,
  Card,
  CardMedia,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ZoomIn as ZoomInIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { getPrimaryImage, getAllImages, getProductTypeDisplay } from '../../utils/imageHelpers';
import { formatPrice } from '../../utils/dataHelpers';
import { containsHtml, extractTextFromHtml } from '../../utils/dataHelpers';

const ProductDetailsDialog = ({
  product,
  open,
  onClose,
  currentQuantity = 0,
  onDecrement,
  onIncrement,
  onQuantityChange,
  onImageClick,
  shouldRenderContent,
  parseJsonField
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantityInput, setQuantityInput] = useState(currentQuantity.toString());

  if (!product) return null;

  const images = getAllImages(product);
  const primaryImage = images.length > 0 ? images[selectedImageIndex] : getPrimaryImage(product);

  const handleQuantityInputChange = (value) => {
    setQuantityInput(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      onQuantityChange(numValue);
    }
  };

  const handleIncrement = () => {
    const newQuantity = currentQuantity + 1;
    setQuantityInput(newQuantity.toString());
    onIncrement();
  };

  const handleDecrement = () => {
    if (currentQuantity > 0) {
      const newQuantity = currentQuantity - 1;
      setQuantityInput(newQuantity.toString());
      onDecrement();
    }
  };

  const renderDescription = (description) => {
    if (!shouldRenderContent(description)) return null;
    
    if (containsHtml(description)) {
      return (
        <Typography 
          variant="body2" 
          sx={{ lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      );
    }
    
    return (
      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
        {description}
      </Typography>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
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
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>

          <Grid container spacing={0} sx={{ minHeight: 400 }}>
            {/* Images Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, height: '100%' }}>
                {/* Main Image */}
                <Card sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={primaryImage}
                      alt={product.productName || product.hebrew_name}
                      sx={{
                        width: '100%',
                        height: 400,
                        objectFit: 'contain',
                        cursor: 'pointer'
                      }}
                      onClick={() => onImageClick && onImageClick(primaryImage)}
                    />
                    {onImageClick && (
                      <IconButton
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          }
                        }}
                        onClick={() => onImageClick(primaryImage)}
                      >
                        <ZoomInIcon />
                      </IconButton>
                    )}
                  </Box>
                </Card>

                {/* Thumbnail Images */}
                {images.length > 1 && (
                  <Box sx={{ display: 'flex', gap: 1, overflow: 'auto' }}>
                    {images.map((image, index) => (
                      <Card
                        key={index}
                        sx={{
                          minWidth: 80,
                          height: 80,
                          cursor: 'pointer',
                          border: selectedImageIndex === index ? 2 : 1,
                          borderColor: selectedImageIndex === index ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          overflow: 'hidden'
                        }}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <CardMedia
                          component="img"
                          image={image}
                          alt={`${product.productName || product.hebrew_name} ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Product Details Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
                {/* Product Title and Reference */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                    {product.productName || product.hebrew_name}
                  </Typography>
                  
                  {(product.productName2 || product.product_name) && (
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {product.productName2 || product.product_name}
                    </Typography>
                  )}

                  <Chip
                    label={`קוד: ${product.ref}`}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                </Box>

                {/* Price */}
                {product.unitPrice && (
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 700, mb: 2 }}>
                    {formatPrice(product.unitPrice)}
                  </Typography>
                )}

                {/* Size */}
                {shouldRenderContent(product.size) && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>גודל:</strong> {product.size}
                  </Typography>
                )}

                {/* Product Type */}
                {shouldRenderContent(product.productType) && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>סוג מוצר:</strong> {product.productType}
                  </Typography>
                )}

                {/* Skin Type */}
                {shouldRenderContent(product.skin_type_he) && (
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>מתאים לסוג עור:</strong> {product.skin_type_he}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Short Description */}
                {shouldRenderContent(product.short_description_he) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      תיאור קצר
                    </Typography>
                    {renderDescription(product.short_description_he)}
                  </Box>
                )}

                {/* Full Description */}
                {shouldRenderContent(product.description || product.description_he) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      תיאור מלא
                    </Typography>
                    {renderDescription(product.description || product.description_he)}
                  </Box>
                )}

                {/* Active Ingredients */}
                {shouldRenderContent(product.activeIngredients || product.wirkunginhaltsstoffe_he) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      רכיבים פעילים
                    </Typography>
                    {renderDescription(product.activeIngredients || product.wirkunginhaltsstoffe_he)}
                  </Box>
                )}

                {/* Usage Instructions */}
                {shouldRenderContent(product.usageInstructions || product.anwendung_he) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      הוראות שימוש
                    </Typography>
                    {renderDescription(product.usageInstructions || product.anwendung_he)}
                  </Box>
                )}

                {/* Notice */}
                {shouldRenderContent(product.notice) && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      הערות
                    </Typography>
                    {renderDescription(product.notice)}
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
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={handleDecrement}
              disabled={currentQuantity <= 0}
              size="small"
              sx={{
                backgroundColor: 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.selected',
                }
              }}
            >
              <RemoveIcon />
            </IconButton>

            <TextField
              value={quantityInput}
              onChange={(e) => handleQuantityInputChange(e.target.value)}
              size="small"
              sx={{
                width: 80,
                '& input': {
                  textAlign: 'center'
                }
              }}
              inputProps={{
                min: 0,
                max: 99
              }}
            />

            <IconButton
              onClick={handleIncrement}
              size="small"
              sx={{
                backgroundColor: 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.selected',
                }
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={onClose}
          size="large"
        >
          סגור
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDetailsDialog;
