/**
 * ProductRenderer - Ultra-efficient product rendering
 * 
 * Optimized wrapper that handles both card and list views.
 * Memoized to prevent unnecessary re-renders.
 * 
 * @param {Object} product - Product data
 * @param {string} viewMode - 'catalog' or 'list'/'compact'
 * @param {Function} getCurrentQuantity - Get current quantity
 * @param {Function} onDecrement - Decrement handler
 * @param {Function} onIncrement - Increment handler
 * @param {Function} onQuantityChange - Quantity change handler
 * @param {Function} onProductInfoClick - Info click handler
 * @param {Function} onImageClick - Image click handler
 * @param {Function} shouldRenderContent - Content validation
 * @param {Function} parseJsonField - JSON parsing utility
 * @param {boolean} canViewPrices - Price visibility
 * @param {Object} productPrices - Price data
 */

import React from 'react';
import { Grid } from '@mui/material';
import ProductCard from '../ProductCard';
import ProductListItem from '../ProductListItem';

const ProductRenderer = React.memo(({ 
  product, 
  viewMode, 
  getCurrentQuantity,
  onDecrement,
  onIncrement,
  onQuantityChange,
  onProductInfoClick,
  onImageClick,
  shouldRenderContent,
  parseJsonField,
  canViewPrices,
  productPrices
}) => {
  const quantity = getCurrentQuantity(product.ref);
  const commonProps = {
    product,
    quantity,
    onDecrement: () => onDecrement(product),
    onIncrement: () => onIncrement(product),
    onQuantityChange: (value) => onQuantityChange(product.ref, value),
    onProductInfoClick: () => onProductInfoClick(product),
    onImageClick,
    shouldRenderContent,
    parseJsonField
  };

  if (viewMode === 'catalog') {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <ProductCard
          {...commonProps}
          canViewPrices={canViewPrices}
          productPrice={productPrices[product.ref]}
        />
      </Grid>
    );
  }

  return (
    <ProductListItem {...commonProps} />
  );
});

export default ProductRenderer;
