/**
 * Image Helper Utilities
 * Functions to help with image handling and optimization
 */

/**
 * Get display name for product type
 */
export const getProductTypeDisplay = (productType) => {
  if (!productType) return '';
  
  const typeMap = {
    'face': 'פנים',
    'body': 'גוף',
    'hair': 'שיער',
    'makeup': 'איפור',
    'skincare': 'טיפוח עור',
    'cleanser': 'ניקוי',
    'moisturizer': 'לחות',
    'serum': 'סרום',
    'cream': 'קרם',
    'lotion': 'תחליב',
    'oil': 'שמן',
    'mask': 'מסכה',
    'scrub': 'פילינג',
    'toner': 'טונר',
    'essence': 'אסנס',
    'sunscreen': 'הגנה מהשמש',
    'anti-aging': 'אנטי אייג\'ינג',
    'acne': 'נגד אקנה',
    'sensitive': 'עור רגיש',
    'dry': 'עור יבש',
    'oily': 'עור שמן',
    'combination': 'עור מעורב',
    'normal': 'עור רגיל'
  };
  
  return typeMap[productType.toLowerCase()] || productType;
};

/**
 * Validate image URL
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  } catch {
    return false;
  }
};

/**
 * Get optimized image URL (placeholder for CDN integration)
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return '';
  
  const { width, height, quality = 80 } = options;
  
  // For now, just return the original URL
  // In the future, this could integrate with a CDN or image optimization service
  return url;
};

/**
 * Create a placeholder image URL
 */
export const getPlaceholderImage = (width = 300, height = 300) => {
  return `https://via.placeholder.com/${width}x${height}/f5f5f5/cccccc?text=No+Image`;
};

/**
 * Parse image URLs from a string (handles comma or pipe separated values)
 */
export const parseImageUrls = (imageString) => {
  if (!imageString) return [];
  
  if (Array.isArray(imageString)) return imageString;
  
  // Handle comma or pipe separated URLs
  return imageString
    .split(/[,|]/)
    .map(url => url.trim())
    .filter(url => url && isValidImageUrl(url));
};

/**
 * Get the primary image from a product
 */
export const getPrimaryImage = (product) => {
  if (!product) return '';
  
  // Check for main image
  if (product.mainPic && isValidImageUrl(product.mainPic)) {
    return product.mainPic;
  }
  
  if (product.pic && isValidImageUrl(product.pic)) {
    return product.pic;
  }
  
  // Check additional images
  const additionalImages = parseImageUrls(product.pics || product.all_pics);
  if (additionalImages.length > 0) {
    return additionalImages[0];
  }
  
  return getPlaceholderImage();
};

/**
 * Get all images from a product
 */
export const getAllImages = (product) => {
  if (!product) return [];
  
  const images = [];
  
  // Add main image first
  const primaryImage = getPrimaryImage(product);
  if (primaryImage && !primaryImage.includes('placeholder')) {
    images.push(primaryImage);
  }
  
  // Add additional images
  const additionalImages = parseImageUrls(product.pics || product.all_pics);
  additionalImages.forEach(url => {
    if (!images.includes(url)) {
      images.push(url);
    }
  });
  
  return images;
};

/**
 * Preload images for better performance
 */
export const preloadImages = (urls) => {
  if (!Array.isArray(urls)) return Promise.resolve([]);
  
  const promises = urls.map(url => {
    return new Promise((resolve, reject) => {
      if (!isValidImageUrl(url)) {
        resolve(null);
        return;
      }
      
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null); // Don't reject, just resolve with null
      img.src = url;
    });
  });
  
  return Promise.all(promises);
};

/**
 * Check if image loading is supported
 */
export const isImageLoadingSupported = () => {
  return 'loading' in HTMLImageElement.prototype;
};

/**
 * Get image aspect ratio
 */
export const getImageAspectRatio = (url) => {
  return new Promise((resolve) => {
    if (!isValidImageUrl(url)) {
      resolve(1); // Default aspect ratio
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      resolve(img.width / img.height);
    };
    img.onerror = () => {
      resolve(1); // Default aspect ratio on error
    };
    img.src = url;
  });
};

/**
 * Process a single image URL for optimization
 */
export const processImageUrl = (url) => {
  if (!url) return '';
  
  // If it's already a valid URL, return as is
  if (isValidImageUrl(url)) {
    return url;
  }
  
  // If it's a relative path, you might want to prepend a base URL
  // For now, just return the URL as is
  return url;
};

/**
 * Process multiple image URLs from a string
 */
export const processImageUrls = (urlString) => {
  if (!urlString) return [];
  
  return parseImageUrls(urlString).map(processImageUrl);
};