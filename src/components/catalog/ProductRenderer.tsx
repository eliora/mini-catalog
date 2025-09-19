'use client';

/**
 * ProductRenderer - Ultra-efficient product rendering
 * 
 * 🔧 COMPONENT PURPOSE: Unified product display wrapper
 * 📱 DEVICE TARGET: All devices (responsive wrapper)
 * 🎯 TRIGGER: Used by catalog to render each product
 * 
 * WHAT IT DOES:
 * Wrapper component that renders products using ProductListItem.
 * ProductCard component has been removed, so all views use list format.
 * 
 * USAGE CONTEXT:
 * - Used by CatalogClean to render each product in the catalog
 * - All view modes now use ProductListItem component
 * - Provides consistent prop interface for product components
 * - Optimized with React.memo to prevent unnecessary re-renders
 * 
 * RESPONSIVE BEHAVIOR:
 * - All views: Uses ProductListItem with full-width list items
 * - Passes through all necessary props to child components
 * 
 * FEATURES:
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
import { Product } from '@/types/product';
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
  shouldRenderContent: (content: unknown) => boolean;
  canViewPrices: boolean;
  productPrices: Record<string, { unitPrice: number; currency: string; discountPrice?: number; priceTier: string; updatedAt: string }>;
}

const ProductRenderer: React.FC<ProductRendererProps> = React.memo(({
  product,
  viewMode: _viewMode, // eslint-disable-line @typescript-eslint/no-unused-vars
  getCurrentQuantity,
  onDecrement,
  onIncrement,
  onQuantityChange,
  onProductInfoClick,
  onImageClick,
  shouldRenderContent,
  canViewPrices: _canViewPrices, // eslint-disable-line @typescript-eslint/no-unused-vars
  productPrices: _productPrices // eslint-disable-line @typescript-eslint/no-unused-vars
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
    shouldRenderContent
  };

  // All views now use ProductListItem (ProductCard removed)
  return (
    <ProductListItem {...commonProps} />
  );
});

ProductRenderer.displayName = 'ProductRenderer';

export default ProductRenderer;