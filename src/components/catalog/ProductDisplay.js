import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Alert
} from '@mui/material';
import ProductCard from '../ProductCard';
import ProductListItem from '../ProductListItem';

const ProductDisplay = ({
  products,
  viewMode = 'catalog',
  getCurrentQuantity,
  onDecrement,
  onIncrement,
  onQuantityChange,
  onProductInfoClick,
  onImageClick,
  shouldRenderContent,
  parseJsonField
}) => {
  if (!products || products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          לא נמצאו מוצרים
        </Typography>
        <Typography variant="body2" color="text.secondary">
          נסה לשנות את מונחי החיפוש או המסננים
        </Typography>
      </Box>
    );
  }

  if (viewMode === 'list' || viewMode === 'compact') {
    return (
      <Box>
        {products.map((product) => (
          <ProductListItem
            key={product.ref}
            product={product}
            quantity={getCurrentQuantity(product.ref)}
            onDecrement={() => onDecrement(product)}
            onIncrement={() => onIncrement(product)}
            onQuantityChange={(value) => onQuantityChange(product.ref, value)}
            onProductInfoClick={() => onProductInfoClick(product)}
            onImageClick={onImageClick}
            shouldRenderContent={shouldRenderContent}
            parseJsonField={parseJsonField}
          />
        ))}
      </Box>
    );
  }

  // Default catalog/grid view
  return (
    <Grid container spacing={2} className="catalog-container">
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product.ref}>
          <ProductCard
            product={product}
            quantity={getCurrentQuantity(product.ref)}
            onDecrement={() => onDecrement(product)}
            onIncrement={() => onIncrement(product)}
            onQuantityChange={(value) => onQuantityChange(product.ref, value)}
            onProductInfoClick={() => onProductInfoClick(product)}
            onImageClick={onImageClick}
            shouldRenderContent={shouldRenderContent}
            parseJsonField={parseJsonField}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductDisplay;
