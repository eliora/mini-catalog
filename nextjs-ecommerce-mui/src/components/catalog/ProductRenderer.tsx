'use client';

/**
 * ProductRenderer - Ultra-efficient product rendering
 * 
 * 🔧 COMPONENT PURPOSE: Unified product display wrapper
 * 📱 DEVICE TARGET: All devices (responsive wrapper)
 * 🎯 TRIGGER: Used by catalog to render each product
 * 
 * WHAT IT DOES:
 * Smart wrapper component that decides how to render products based on view mode.
 * Handles the switch between card view and list view rendering.
 * 
 * USAGE CONTEXT:
 * - Used by CatalogClean to render each product in the catalog
 * - Handles both 'catalog' (card) and 'list'/'compact' view modes
 * - Provides consistent prop interface for both card and list components
 * - Optimized with React.memo to prevent unnecessary re-renders
 * 
 * RESPONSIVE BEHAVIOR:
 * - Card view: Uses Grid layout for responsive card grid
 * - List view: Uses full-width list items
 * - Passes through all necessary props to child components
 * 
 * FEATURES:
 * - View mode switching (card vs list)
 * - Memoized for performance optimization
 * - Unified prop interface for all product components
 * - Quantity management integration
 * - Price display authorization
 * - Image click handling for zoom/gallery
 * 
 * @param {Object} product - Product data
 * @param {string} viewMode - 'catalog' for cards, 'list'/'compact' for list
 * @param {Function} getCurrentQuantity - Get current quantity from cart
 * @param {Function} onDecrement - Decrement quantity handler
 * @param {Function} onIncrement - Increment quantity handler
 * @param {Function} onQuantityChange - Direct quantity change handler
 * @param {Function} onProductInfoClick - Info button click handler
 * @param {Function} onImageClick - Image click handler for zoom
 * @param {Function} shouldRenderContent - Content validation function
 * @param {Function} parseJsonField - JSON parsing utility
 * @param {boolean} canViewPrices - Price visibility authorization
 * @param {Object} productPrices - Price data mapping
 */

import React from 'react';
import { Box } from '@mui/material';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import ProductListItem from './ProductListItem';

interface ProductRendererProps {
  product: Product;
  viewMode: 'catalog' | 'list' | 'compact' | string;
  getCurrentQuantity: (ref: string) => number;
  onDecrement: (product: Product) => void;
  onIncrement: (product: Product) => void;
  onQuantityChange: (ref: string, value: string | number) => void;
  onProductInfoClick: (product: Product) => void;
  onImageClick?: (src: string) => void;
  shouldRenderContent: (content: any) => boolean;
  parseJsonField: (field: any) => any;
  canViewPrices: boolean;
  productPrices: Record<string, any>;
}

const ProductRenderer: React.FC<ProductRendererProps> = React.memo(({ 
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
  
  // Common props for both card and list components
  const commonProps = {
    product,
    quantity,
    onDecrement: () => onDecrement(product),
    onIncrement: () => onIncrement(product),
    onQuantityChange: (value: string) => onQuantityChange(product.ref, value),
    onProductInfoClick: () => onProductInfoClick(product),
    onImageClick: onImageClick || (() => {}), // Provide default empty function
    shouldRenderContent,
    parseJsonField
  };

  // Card view (catalog mode) - wrapped in responsive flex container
  if (viewMode === 'catalog') {
    return (
      <Box sx={{ 
        flex: '1 1 300px', 
        minWidth: 280, 
        maxWidth: 400,
        // Ensure consistent spacing in flex grid
        mb: 2
      }}>
        <ProductCard
          {...commonProps}
          canViewPrices={canViewPrices}
          productPrice={productPrices[product.ref]}
        />
      </Box>
    );
  }

  // List view (list/compact modes) - full width
  return (
    <ProductListItem {...commonProps} />
  );
});

ProductRenderer.displayName = 'ProductRenderer';

export default ProductRenderer;