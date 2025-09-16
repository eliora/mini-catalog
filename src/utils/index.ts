/**
 * Utility Functions Index
 * Barrel export for all utility functions
 */

// CSV utilities
export * from './csvHelpers';

// Data manipulation utilities  
export * from './dataHelpers';

// Image processing utilities
export * from './imageHelpers';

// Re-export common utilities with shorter names
export { 
  formatCurrency as formatPrice,
  formatProductRef as formatRef,
  parseNumber as toNumber,
  parseString as toString,
  shouldRenderContent as hasContent,
  debounce,
  throttle
} from './dataHelpers';

export {
  getPrimaryImage as getMainImage,
  getAllImages as getImageList,
  isValidImageUrl as isValidImage,
  getPlaceholderImage as getPlaceholder,
  getThumbnailUrl as getThumbnail,
  getMainImageUrl as getOptimizedImage
} from './imageHelpers';
