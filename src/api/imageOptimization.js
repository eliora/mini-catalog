import { supabase } from '../config/supabase';

/**
 * Convert image URL to base64 and resize it
 */
const convertUrlToOptimizedImage = async (imageUrl, maxWidth = 400, quality = 0.8) => {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress the image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert to base64 with compression
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(optimizedDataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.error('Error converting image:', error);
    throw error;
  }
};

/**
 * Get all products with external image URLs
 */
export const getProductsWithExternalImages = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or('mainPic.like.http%,pics.like.%http%');
    
    if (error) throw error;
    
    // Filter products that have external URLs
    return data.filter(product => {
      const hasExternalMain = product.mainPic && product.mainPic.startsWith('http');
      const hasExternalPics = product.pics && 
        (typeof product.pics === 'string' ? 
          product.pics.includes('http') : 
          Array.isArray(product.pics) && product.pics.some(pic => pic.startsWith('http'))
        );
      return hasExternalMain || hasExternalPics;
    });
  } catch (error) {
    console.error('Error fetching products with external images:', error);
    throw error;
  }
};

/**
 * Optimize a single product's images
 */
export const optimizeProductImages = async (product, maxWidth = 400, quality = 0.8, onProgress) => {
  try {
    const updates = { ...product };
    let processedCount = 0;
    let totalImages = 0;
    
    // Count total images to process
    if (product.mainPic && product.mainPic.startsWith('http')) totalImages++;
    if (product.pics) {
      const picsArray = typeof product.pics === 'string' ? 
        JSON.parse(product.pics || '[]') : 
        (Array.isArray(product.pics) ? product.pics : []);
      totalImages += picsArray.filter(pic => pic.startsWith('http')).length;
    }
    
    // Optimize main picture
    if (product.mainPic && product.mainPic.startsWith('http')) {
      onProgress?.({ 
        productRef: product.ref, 
        status: 'processing', 
        message: 'Optimizing main image...',
        progress: (processedCount / totalImages) * 100
      });
      
      const optimizedMain = await convertUrlToOptimizedImage(product.mainPic, maxWidth, quality);
      updates.mainPic = optimizedMain;
      processedCount++;
    }
    
    // Optimize additional pictures
    if (product.pics) {
      const picsArray = typeof product.pics === 'string' ? 
        JSON.parse(product.pics || '[]') : 
        (Array.isArray(product.pics) ? product.pics : []);
      
      const optimizedPics = [];
      
      for (let i = 0; i < picsArray.length; i++) {
        const pic = picsArray[i];
        if (pic.startsWith('http')) {
          onProgress?.({ 
            productRef: product.ref, 
            status: 'processing', 
            message: `Optimizing image ${i + 1}/${picsArray.length}...`,
            progress: (processedCount / totalImages) * 100
          });
          
          const optimizedPic = await convertUrlToOptimizedImage(pic, maxWidth, quality);
          optimizedPics.push(optimizedPic);
          processedCount++;
        } else {
          optimizedPics.push(pic);
        }
      }
      
      updates.pics = JSON.stringify(optimizedPics);
    }
    
    // Update the product in the database
    const { error } = await supabase
      .from('products')
      .update({
        mainPic: updates.mainPic,
        pics: updates.pics,
        updated_at: new Date().toISOString()
      })
      .eq('ref', product.ref);
    
    if (error) throw error;
    
    onProgress?.({ 
      productRef: product.ref, 
      status: 'completed', 
      message: 'Images optimized successfully!',
      progress: 100
    });
    
    return updates;
  } catch (error) {
    onProgress?.({ 
      productRef: product.ref, 
      status: 'error', 
      message: `Error: ${error.message}`,
      progress: 0
    });
    throw error;
  }
};

/**
 * Optimize images for multiple products
 */
export const optimizeMultipleProducts = async (products, options = {}, onProgress) => {
  const { maxWidth = 400, quality = 0.8, batchSize = 3 } = options;
  const results = [];
  
  // Process in batches to avoid overwhelming the browser
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    const batchPromises = batch.map(product => 
      optimizeProductImages(product, maxWidth, quality, (progress) => {
        onProgress?.({
          ...progress,
          totalProgress: ((i + batch.indexOf(products.find(p => p.ref === progress.productRef))) / products.length) * 100
        });
      })
    );
    
    try {
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Batch processing error:', error);
    }
  }
  
  return results;
};

/**
 * Get optimization statistics
 */
export const getOptimizationStats = async () => {
  try {
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('mainPic, pics');
    
    if (error) throw error;
    
    let totalProducts = allProducts.length;
    let productsWithExternalImages = 0;
    let totalExternalImages = 0;
    let totalOptimizedImages = 0;
    
    allProducts.forEach(product => {
      let hasExternal = false;
      
      // Check main pic
      if (product.mainPic) {
        if (product.mainPic.startsWith('http')) {
          hasExternal = true;
          totalExternalImages++;
        } else if (product.mainPic.startsWith('data:')) {
          totalOptimizedImages++;
        }
      }
      
      // Check additional pics
      if (product.pics) {
        const picsArray = typeof product.pics === 'string' ? 
          JSON.parse(product.pics || '[]') : 
          (Array.isArray(product.pics) ? product.pics : []);
        
        picsArray.forEach(pic => {
          if (pic.startsWith('http')) {
            hasExternal = true;
            totalExternalImages++;
          } else if (pic.startsWith('data:')) {
            totalOptimizedImages++;
          }
        });
      }
      
      if (hasExternal) productsWithExternalImages++;
    });
    
    return {
      totalProducts,
      productsWithExternalImages,
      totalExternalImages,
      totalOptimizedImages,
      optimizationPercentage: totalProducts > 0 ? 
        ((totalProducts - productsWithExternalImages) / totalProducts) * 100 : 100
    };
  } catch (error) {
    console.error('Error getting optimization stats:', error);
    throw error;
  }
};
