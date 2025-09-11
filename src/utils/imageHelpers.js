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
export const processImageUrl = (url, options = {}) => {
  if (!url) return '';
  
  // If it's already a valid URL, apply transformations if needed
  if (isValidImageUrl(url)) {
    return applyImageTransformations(url, options);
  }
  
  // If it's a relative path, you might want to prepend a base URL
  // For now, just return the URL as is
  return url;
};

/**
 * Apply ImageKit transformations to image URLs
 * Based on ImageKit.io URL-based transformation API
 * @param {string} url - The image URL
 * @param {object} options - Transformation options
 * @returns {string} - Transformed image URL
 */
export const applyImageTransformations = (url, options = {}) => {
  if (!url || !isValidImageUrl(url)) return url;
  
  const { width, height, quality = 'auto', format = 'auto' } = options;
  
  // Check if URL is from ImageKit (contains ik.imagekit.io)
  if (url.includes('ik.imagekit.io')) {
    // For ImageKit URLs, insert transformations after domain
    const transformations = [];
    
    if (width) transformations.push(`w-${width}`);
    if (height) transformations.push(`h-${height}`);
    if (quality !== 'auto') transformations.push(`q-${quality}`);
    if (format !== 'auto') transformations.push(`f-${format}`);
    
    if (transformations.length > 0) {
      const transformString = `/tr:${transformations.join(',')}`;
      
      // Insert transformation after the domain but before the path
      const urlParts = url.split('/');
      if (urlParts.length >= 4) {
        // https://ik.imagekit.io/endpoint/path -> https://ik.imagekit.io/endpoint/tr:w-150/path
        urlParts.splice(4, 0, transformString.substring(1)); // Remove leading /
        return urlParts.join('/');
      }
    }
  }
  
  // For other image services, return original URL
  return url;
};

/**
 * Get optimized thumbnail URL for accordion headers (80px width)
 */
export const getThumbnailUrl = (url) => {
  return processImageUrl(url, { width: 80, quality: 80, format: 'webp' });
};

/**
 * Get optimized main image URL for product display (360px width)
 */
export const getMainImageUrl = (url) => {
  return processImageUrl(url, { width: 360, quality: 85, format: 'webp' });
};

/**
 * Test function for image transformations (for debugging)
 */
export const testImageTransformations = () => {
  const testUrl = 'https://ik.imagekit.io/demo/docs_images/examples/example_food_3.jpg';
  const thumbnail = getThumbnailUrl(testUrl);
  const mainImage = getMainImageUrl(testUrl);
  
  console.log('🧪 Image Transformation Test:');
  console.log('Original:', testUrl);
  console.log('Thumbnail (80px):', thumbnail);
  console.log('Main Image (360px):', mainImage);
  console.log('Expected thumbnail pattern: .../tr:w-80,q-80,f-webp/...');
  console.log('Expected main pattern: .../tr:w-360,q-85,f-webp/...');
  
  return thumbnail.includes('tr:w-80,q-80,f-webp') && mainImage.includes('tr:w-360,q-85,f-webp');
};

/**
 * Process multiple image URLs from a string
 */
export const processImageUrls = (urlString) => {
  if (!urlString) return [];
  
  return parseImageUrls(urlString).map(processImageUrl);
};