/**
 * Image Helper Utilities
 * Functions to help with image handling and optimization
 * Updated for Next.js with Image component integration
 */

import { StaticImageData } from 'next/image';

// Type definitions for image helpers
export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'jpg' | 'png' | 'avif';
}

export interface ImageKitConfig {
  endpoint: string;
  useForExternal: boolean;
}

export interface ProductTypeMap {
  [key: string]: string;
}

export type ImageSource = string | StaticImageData;

/**
 * Get display name for product type
 */
export const getProductTypeDisplay = (productType: string | null | undefined): string => {
  if (!productType) return '';
  
  const typeMap: ProductTypeMap = {
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
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(url);
  } catch {
    return false;
  }
};

/**
 * Check if URL is a Next.js static import
 */
export const isStaticImport = (src: ImageSource): src is StaticImageData => {
  return typeof src === 'object' && src !== null && 'src' in src;
};

/**
 * Get optimized image URL (placeholder for CDN integration)
 * For Next.js, we primarily rely on the Image component for optimization
 */
export const getOptimizedImageUrl = (url: string, options: ImageTransformOptions = {}): string => {
  if (!url) return '';
  
  const { width, height, quality = 80 } = options;
  
  // For Next.js Image component, we return the original URL
  // The Image component handles optimization automatically
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
export const parseImageUrls = (imageString: string | string[] | null | undefined): string[] => {
  if (!imageString) return [];
  
  if (Array.isArray(imageString)) return imageString.filter(isValidImageUrl);
  
  // Handle comma or pipe separated URLs
  return imageString
    .split(/[,|]/)
    .map(url => url.trim())
    .filter(url => url && isValidImageUrl(url));
};

/**
 * Get the primary image from a product
 */
export const getPrimaryImage = (product: any): string => {
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
export const getAllImages = (product: any): string[] => {
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
 * Updated for Next.js environment
 */
export const preloadImages = (urls: string[]): Promise<(string | null)[]> => {
  if (!Array.isArray(urls)) return Promise.resolve([]);
  
  // Only preload in browser environment
  if (typeof window === 'undefined') {
    return Promise.resolve(urls.map(() => null));
  }
  
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
  if (typeof window === 'undefined') return false;
  return 'loading' in HTMLImageElement.prototype;
};

/**
 * Get image aspect ratio
 */
export const getImageAspectRatio = (url: string): Promise<number> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !isValidImageUrl(url)) {
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
 * For Next.js, this is primarily for validation and transformation preparation
 */
export const processImageUrl = (url: string, options: ImageTransformOptions = {}): string => {
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
const IMAGEKIT_CONFIG: ImageKitConfig = {
  // ImageKit endpoint for minicatalog
  endpoint: 'https://ik.imagekit.io/minicatalog',
  // Always use ImageKit for all images
  useForExternal: true,
};

/**
 * Apply ImageKit transformations to image URLs
 * Based on ImageKit.io URL-based transformation API
 * Note: For Next.js, consider using the built-in Image component instead
 */
export const applyImageTransformations = (url: string, options: ImageTransformOptions = {}): string => {
  if (!url || !isValidImageUrl(url)) return url;
  
  const { width, height, quality = 'auto', format = 'auto' } = options;
  
  // Check if URL is from ImageKit (contains ik.imagekit.io)
  if (url.includes('ik.imagekit.io')) {
    // For ImageKit URLs, insert transformations after domain
    const transformations: string[] = [];
    
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
  
  // For external images, use ImageKit endpoint with raw filename
  if (IMAGEKIT_CONFIG.endpoint && IMAGEKIT_CONFIG.useForExternal) {
    const transformations: string[] = [];
    
    if (width) transformations.push(`w-${width}`);
    if (height) transformations.push(`h-${height}`);
    if (quality !== 'auto') transformations.push(`q-${quality}`);
    if (format !== 'auto') transformations.push(`f-${format}`);
    
    // Extract filename from URL
    const filename = url.split('/').pop()?.split('?')[0]; // Remove query params if any
    
    if (filename) {
      if (transformations.length > 0) {
        const transformString = `tr:${transformations.join(',')}`;
        return `${IMAGEKIT_CONFIG.endpoint}/${transformString}/${filename}`;
      } else {
        // No transformations, just use ImageKit endpoint with filename
        return `${IMAGEKIT_CONFIG.endpoint}/${filename}`;
      }
    }
  }
  
  // For development: Return original URL with console warning
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ ImageKit: External image not optimized (no endpoint configured):', url.substring(0, 50) + '...');
  }
  
  return url;
};

/**
 * Get optimized thumbnail URL for accordion headers (80px width)
 * For Next.js, use this with the Image component's width/height props
 */
export const getThumbnailUrl = (url: string): string => {
  return processImageUrl(url, { width: 80, quality: 80, format: 'webp' });
};

/**
 * Get optimized main image URL for product display (360px width)
 * For Next.js, use this with the Image component's width/height props
 */
export const getMainImageUrl = (url: string): string => {
  return processImageUrl(url, { width: 360, quality: 85, format: 'webp' });
};

/**
 * Get blur data URL for Next.js Image placeholder
 */
export const getBlurDataURL = (width: number = 8, height: number = 8): string => {
  const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) {
    // Server-side fallback
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSd1E2VvINi4Dt/ezvogbJcD9YCCX8L8O7xddxA6QHk2TRy6lC/g3EdpKBOJbmb0zz1I+mZsJbKz1FcqkJlgC76Nrqq+3gqmGXkF7wA=';
  }
  
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create a simple gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f0f0f0');
  gradient.addColorStop(1, '#e0e0e0');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

/**
 * Test function for image transformations (for debugging)
 */
export const testImageTransformations = (): boolean => {
  if (typeof window === 'undefined') {
    console.log('🧪 Image Transformation Test: Running in server environment');
    return true;
  }
  
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
export const processImageUrls = (urlString: string | string[] | null | undefined): string[] => {
  if (!urlString) return [];
  
  return parseImageUrls(urlString).map(url => processImageUrl(url));
};

/**
 * Generate srcSet for responsive images (Next.js Image component helper)
 */
export const generateSrcSet = (url: string, sizes: number[] = [640, 750, 828, 1080, 1200, 1920]): string => {
  if (!isValidImageUrl(url)) return '';
  
  return sizes
    .map(size => `${processImageUrl(url, { width: size })} ${size}w`)
    .join(', ');
};

/**
 * Get Next.js Image component props for a given image
 */
export const getNextImageProps = (url: string, alt: string = '', priority: boolean = false) => {
  return {
    src: url,
    alt,
    priority,
    quality: 85,
    placeholder: 'blur' as const,
    blurDataURL: getBlurDataURL(),
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  };
};