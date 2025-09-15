/**
 * Image Helper Utilities
 * Functions to help with image handling and optimization
 */

/**
 * Get display name for product type
 */
export const getProductTypeDisplay = (productType?: string): string => {
  if (!productType) return '';
  
  const typeMap: Record<string, string> = {
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
export const isValidImageUrl = (url?: string): boolean => {
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
export const getOptimizedImageUrl = (url?: string, options: { width?: number; height?: number; quality?: number } = {}): string => {
  if (!url) return '';
  
  const { width, height, quality = 80 } = options;
  
  // For now, just return the original URL
  // In the future, this could integrate with a CDN or image optimization service
  return url;
};

/**
 * Create a placeholder image URL
 */
export const getPlaceholderImage = (width: number = 300, height: number = 300): string => {
  return `https://via.placeholder.com/${width}x${height}/f5f5f5/cccccc?text=No+Image`;
};

/**
 * Parse image URLs from a string (handles comma or pipe separated values)
 */
export const parseImageUrls = (imageString?: string): string[] => {
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
export const getPrimaryImage = (product?: { mainPic?: string; pic?: string; pics?: string; all_pics?: string }): string => {
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
export const getAllImages = (product?: { mainPic?: string; pic?: string; pics?: string; all_pics?: string }): string[] => {
  if (!product) return [];
  
  const images: string[] = [];
  
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
export const preloadImages = (urls: string[]): Promise<(string | null)[]> => {
  if (!Array.isArray(urls)) return Promise.resolve([]);
  
  const promises = urls.map(url => {
    return new Promise<string | null>((resolve) => {
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
export const isImageLoadingSupported = (): boolean => {
  return typeof window !== 'undefined' && 'loading' in HTMLImageElement.prototype;
};

/**
 * Get image aspect ratio
 */
export const getImageAspectRatio = (url: string): Promise<number> => {
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
export const processImageUrl = (url?: string, options: { width?: number; height?: number; quality?: number; format?: string } = {}): string => {
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
 * ImageKit configuration
 */
const IMAGEKIT_CONFIG = {
  // ImageKit endpoint for minicatalog
  endpoint: 'https://ik.imagekit.io/minicatalog',
  // Don't use ImageKit for external images to avoid 400 errors
  useForExternal: false,
};

/**
 * Apply ImageKit transformations to image URLs
 * Based on ImageKit.io URL-based transformation API
 */
export const applyImageTransformations = (url: string, options: { width?: number; height?: number; quality?: number | string; format?: string } = {}): string => {
  if (!url || !isValidImageUrl(url)) return url;
  
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // Check if URL is already from ImageKit (contains ik.imagekit.io)
  if (url.includes('ik.imagekit.io/minicatalog')) {
    // For existing ImageKit URLs, check if transformations already exist
    if (url.includes('/tr:')) {
      // Already has transformations, return as-is to avoid double transformation
      return url;
    }
    
    // For ImageKit URLs without transformations, insert transformations
    const transformations: string[] = [];
    
    if (width) transformations.push(`w-${width}`);
    if (height) transformations.push(`h-${height}`);
    if (quality !== 'auto') transformations.push(`q-${quality}`);
    if (format !== 'auto') transformations.push(`f-${format}`);
    
    if (transformations.length > 0) {
      const transformString = `tr:${transformations.join(',')}`;
      
      // Insert transformation after the endpoint: https://ik.imagekit.io/minicatalog/image.jpg -> https://ik.imagekit.io/minicatalog/tr:w-80/image.jpg
      const parts = url.split('/');
      if (parts.length >= 5) {
        parts.splice(4, 0, transformString);
        return parts.join('/');
      }
    }
    
    return url;
  }
  
  // For external images, DON'T try to use ImageKit proxy
  // This was causing the 400 errors because the images don't exist in ImageKit
  // Instead, just return the original URL and let Next.js Image component handle optimization
  if (process.env.NODE_ENV === 'development') {
    console.log('🖼️ Using external image directly:', url.substring(0, 80) + '...');
  }
  
  return url;
};

/**
 * Clean ImageKit URL by removing problematic transformations
 */
export const cleanImageKitUrl = (url: string): string => {
  if (!url) return '';
  
  // If it's an ImageKit URL with transformations, remove them
  if (url.includes('ik.imagekit.io') && url.includes('/tr:')) {
    return url.replace(/\/tr:[^/]+\//, '/');
  }
  
  return url;
};

/**
 * Get optimized thumbnail URL for accordion headers (80px width)
 */
export const getThumbnailUrl = (url?: string): string => {
  if (!url) return '';
  // Clean the URL first, then let Next.js Image component handle optimization
  return cleanImageKitUrl(url);
};

/**
 * Get optimized main image URL for product display (360px width)
 */
export const getMainImageUrl = (url?: string): string => {
  if (!url) return '';
  // Clean the URL first, then let Next.js Image component handle optimization
  return cleanImageKitUrl(url);
};

/**
 * Test function for image transformations (for debugging)
 */
export const testImageTransformations = (): boolean => {
  const testExternalUrl = 'https://www.jda.de/media/catalog/product/cache/818bc609d9795564472e4f094029978c/m/u/multibalance_gel_demaquillant_confort_200ml_verp_02_1_1.png';
  const testImageKitUrl = 'https://ik.imagekit.io/demo/docs_images/examples/example_food_3.jpg';
  
  const externalThumbnail = getThumbnailUrl(testExternalUrl);
  const externalMainImage = getMainImageUrl(testExternalUrl);
  const imagekitThumbnail = getThumbnailUrl(testImageKitUrl);
  const imagekitMainImage = getMainImageUrl(testImageKitUrl);
  
  console.log('🧪 Image Transformation Test:');
  console.log('');
  console.log('EXTERNAL URL TEST:');
  console.log('Original:', testExternalUrl);
  console.log('Thumbnail (80px):', externalThumbnail);
  console.log('Main Image (360px):', externalMainImage);
  console.log('');
  console.log('IMAGEKIT URL TEST:');
  console.log('Original:', testImageKitUrl);
  console.log('Thumbnail (80px):', imagekitThumbnail);
  console.log('Main Image (360px):', imagekitMainImage);
  console.log('');
  console.log('Expected external pattern: https://ik.imagekit.io/minicatalog/tr:w-80,q-80,f-webp/filename.png');
  console.log('Expected imagekit pattern: .../tr:w-80,q-80,f-webp/...');
  
  return externalThumbnail.includes('ik.imagekit.io/minicatalog') && 
         imagekitThumbnail.includes('tr:w-80,q-80,f-webp');
};

/**
 * Process multiple image URLs from a string
 */
export const processImageUrls = (urlString?: string): string[] => {
  if (!urlString) return [];
  
  return parseImageUrls(urlString).map((url) => processImageUrl(url));
};
