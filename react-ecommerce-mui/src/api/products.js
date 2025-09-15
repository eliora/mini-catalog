import { supabase } from '../config/supabase';
import { processImageUrl, processImageUrls } from '../utils/imageHelpers';
import { getPrices } from './prices';
// Mock data removed - using Supabase only

// Request deduplication cache to prevent duplicate API calls
const requestCache = new Map();
const REQUEST_CACHE_TTL = 30000; // 30 seconds

// Debug function to clear cache
window.clearProductCache = () => {
  requestCache.clear();
  console.log('🧹 Product cache cleared');
};

// Helper function to add timeout to any promise
const withTimeout = (promise, timeoutMs = 10000, operation = 'Operation') => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`${operation} timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

// Request deduplication helper
const getCacheKey = (operation, params) => {
  return `${operation}:${JSON.stringify(params)}`;
};

const getCachedRequest = (cacheKey) => {
  const cached = requestCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < REQUEST_CACHE_TTL) {
    return cached.promise;
  }
  return null;
};

const setCachedRequest = (cacheKey, promise) => {
  requestCache.set(cacheKey, {
    promise,
    timestamp: Date.now()
  });
  
  // Clean up cache periodically
  if (requestCache.size > 100) {
    const now = Date.now();
    for (const [key, value] of requestCache.entries()) {
      if (now - value.timestamp > REQUEST_CACHE_TTL) {
        requestCache.delete(key);
      }
    }
  }
  
  return promise;
};

// Helper function to retry operations
const retryOperation = async (operation, maxRetries = 2, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      }
    }
  }
  
  throw lastError;
};

export const getProducts = async (search = '', line = '', page = 1, pageSize = 50, filters = {}) => {
  // Check for cached request first
  const cacheKey = getCacheKey('getProducts', { search, line, page, pageSize, filters });
  const cachedRequest = getCachedRequest(cacheKey);
  if (cachedRequest) {
    return cachedRequest;
  }

  const requestPromise = getProductsInternal(search, line, page, pageSize, filters);
  return setCachedRequest(cacheKey, requestPromise);
};

const getProductsInternal = async (search = '', line = '', page = 1, pageSize = 50, filters = {}) => {
  try {
    // Load with timeout protection

    // Select ONLY essential fields for initial catalog display (super fast loading)
    // NOTE: unit_price temporarily kept for fallback until prices table is populated
    // Database columns: ref, hebrew_name, header, short_description_he, description_he, 
    // skin_type_he, usage_instructions_he, active_ingredients_he, ingredients, french_name, 
    // english_name, size, product_line, main_pic, pics, type, product_type, qty, unit_price
    let query = supabase.from('products').select(`
      ref,
      hebrew_name,
      english_name,
      short_description_he,
      main_pic,
      size,
      product_line,
      type,
      product_type,
      skin_type_he,
      qty,
      unit_price
    `);
    
    // Apply server-side filtering for maximum performance
    if (search) {
      query = query.or(`ref.ilike.%${search}%,hebrew_name.ilike.%${search}%,english_name.ilike.%${search}%`);
    }
    
    if (line) {
      query = query.or(`product_line.ilike.%${line}%,skin_type_he.ilike.%${line}%`);
    }
    
    // Apply additional filters at database level
    const { productType, skinType, type } = filters;
    
    if (productType) {
      query = query.or(`product_type.ilike.%${productType}%`);
    }
    
    if (skinType) {
      query = query.ilike('skin_type_he', `%${skinType}%`);
    }
    
    if (type) {
      query = query.ilike('type', `%${type}%`);
    }
    
    // Add pagination for lazy loading
    const offset = (page - 1) * pageSize;
    query = query.order('ref').range(offset, offset + pageSize - 1);
    
    // Execute query with timeout and retry protection (faster timeout for better UX)
    const { data, error } = await retryOperation(
      () => withTimeout(query, 15000, 'Products query'), // Increased timeout for debugging
      2, // Reduced from 3 to 2 attempts max
      800 // Reduced initial delay
    );
    
    if (error) throw error;
    
    console.log(`Raw products from DB: ${data?.length || 0} (page ${page}, pageSize ${pageSize})`);
    
    // More permissive filtering - only exclude products explicitly marked as unavailable
    const filteredData = data
      .filter(product => {
        const qty = product.qty;
        if (data.indexOf(product) < 5) {
          console.log('Product qty debug:', product.ref, 'qty:', qty, 'type:', typeof qty);
        }
        // Allow products with qty 0 or positive numbers, exclude only null/undefined/empty string
        if (qty === null || qty === undefined) return false;
        if (typeof qty === 'string' && qty.trim() === '') return false;
        return true;
      })
; // No need to slice - already limited by pagination
    
    console.log(`Products after filtering: ${filteredData.length} out of ${data?.length || 0}`);
    
    // Get product refs for price lookup
    const productRefs = filteredData.map(product => product.ref);
    
    // Fetch prices separately (only if user has permission) with timeout protection
    let prices = {};
    try {
      prices = await retryOperation(
        () => withTimeout(getPrices(productRefs), 15000, 'Prices query'),
        2, // 2 attempts max for prices (less critical)
        800 // 800ms initial delay
      );
      console.log(`✅ Prices loaded for ${Object.keys(prices).length} products`);
    } catch (priceError) {
      console.warn('⚠️ Failed to load prices, continuing without them:', priceError.message);
      // Continue without prices - better to show products without prices than fail completely
    }
    
    // Transform database structure to component expected structure (basic fields only)
    const products = filteredData.map(product => ({
      ...product,
      // Map database fields to component expected fields
      ref: product.ref,
      productName: product.hebrew_name,
      productName2: product.english_name,
      mainPic: processImageUrl(product.main_pic),
      unitPrice: prices[product.ref]?.unitPrice || product.unit_price || 0,
      size: product.size,
      line: product.product_line || product.skin_type_he,
      productLine: product.product_line,
      productType: product.product_type || product.type,
      // Keep original database fields too
      hebrew_name: product.hebrew_name,
      english_name: product.english_name,
      short_description_he: product.short_description_he,
      main_pic: product.main_pic,
      unit_price: prices[product.ref]?.unitPrice || 0,
      price_data: prices[product.ref] || null, // Full price object for components that need it
      skin_type_he: product.skin_type_he,
      type: product.type,
      product_line: product.product_line,
      qty: product.qty, // Include qty for filtering
      // Accordion data will be loaded separately when needed
      accordionDataLoaded: false
    }));

    // Return pagination info along with products
    return {
      products,
      pagination: {
        page,
        pageSize,
        hasMore: (data?.length || 0) === pageSize, // If we got full page from DB, there might be more
        total: filteredData.length
      }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get detailed accordion data for a specific product (loaded on demand)
export const getProductDetails = async (productRef) => {
  // TEMPORARILY DISABLE CACHING FOR DEBUGGING
  return await getProductDetailsInternal(productRef);
  
  /* CACHING DISABLED FOR DEBUGGING
  // Check for cached request first
  const cacheKey = getCacheKey('getProductDetails', { productRef });
  const cachedRequest = getCachedRequest(cacheKey);
  if (cachedRequest) {
    console.log('🎯 API: Returning cached result');
    return cachedRequest;
  }

  // Create promise with error handling - only cache successful results
  const requestPromise = getProductDetailsInternal(productRef)
    .then(result => {
      // Only cache successful results
      setCachedRequest(cacheKey, Promise.resolve(result));
      return result;
    })
    .catch(error => {
      // Don't cache failed requests - remove from cache if it exists
      requestCache.delete(cacheKey);
      throw error;
    });

  return requestPromise;
  */
};

const getProductDetailsInternal = async (productRef) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        ref,
        description_he,
        active_ingredients_he,
        usage_instructions_he,
        ingredients,
        header,
        french_name,
        pics
      `)
      .eq('ref', productRef)
      .single();

    if (error) throw error;
    return {
      ref: data.ref,
      description: data.description_he,
      description_he: data.description_he,
      activeIngredients: data.active_ingredients_he,
      active_ingredients_he: data.active_ingredients_he,
      usageInstructions: data.usage_instructions_he,
      usage_instructions_he: data.usage_instructions_he,
      ingredients: data.ingredients,
      header: data.header,
      frenchName: data.french_name,
      french_name: data.french_name,
      pics: data.pics ? (Array.isArray(data.pics) ? data.pics : processImageUrls(data.pics)) : [],
      accordionDataLoaded: true
    };
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

// Get filter options efficiently without loading all products
export const getFilterOptions = async () => {
  try {
    console.log('🔍 Loading filter options...');
    
    // Get unique values using SQL aggregation - much faster than client-side processing
    const { data, error } = await supabase.rpc('get_filter_options');
    
    if (error) {
      console.warn('RPC not available, falling back to manual query...');
      // Fallback to manual query if RPC doesn't exist
      const { data: products, error: fallbackError } = await supabase
        .from('products')
        .select('product_line, product_type, skin_type_he, type')
        .not('product_line', 'is', null)
        .not('product_type', 'is', null);
        
      if (fallbackError) throw fallbackError;
      
      // Process manually (still faster than loading all product data)
      const lines = [...new Set(
        products.flatMap(p => (p.product_line || '').split(',').map(item => item.trim())).filter(Boolean)
      )];
      
      const productTypes = [...new Set(
        products.flatMap(p => (p.product_type || '').split(',').map(item => item.trim())).filter(Boolean)
      )];
      
      const skinTypes = [...new Set(
        products.flatMap(p => (p.skin_type_he || '').split(',').map(item => item.trim())).filter(Boolean)
      )];
      
      const types = [...new Set(
        products.flatMap(p => (p.type || '').split(',').map(item => item.trim())).filter(Boolean)
      )];
      
      return {
        lines: lines.sort(),
        productTypes: productTypes.sort(),
        skinTypes: skinTypes.sort(),
        types: types.sort()
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error loading filter options:', error);
    throw error;
  }
};

export const getProductLines = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('skin_type_he')
      .not('skin_type_he', 'is', null)
      .not('skin_type_he', 'eq', '')
      .order('skin_type_he');
    
    if (error) throw error;
    
    // Get unique skin types and split by comma
    const allSkinTypes = data
      .map(item => item.skin_type_he)
      .filter(Boolean)
      .flatMap(skinType => skinType.split(',').map(s => s.trim()))
      .filter(Boolean);
    
    const uniqueLines = [...new Set(allSkinTypes)];
    return uniqueLines;
  } catch (error) {
    console.error('Error fetching product lines:', error);
    throw error;
  }
};

export const saveProduct = async (productData) => {
  try {
    // Map component fields back to database structure
    const dataToSave = {
      ref: productData.ref,
      hebrew_name: productData.productName,
      english_name: productData.productName2,
      description_he: productData.description,
      active_ingredients_he: productData.activeIngredients,
      usage_instructions_he: productData.usageInstructions,
      main_pic: productData.mainPic,
      pics: Array.isArray(productData.pics) 
        ? productData.pics 
        : (typeof productData.pics === 'string' ? productData.pics.split(' | ').filter(Boolean) : []),
      // unit_price removed from products table - prices now handled separately
      size: productData.size,
      notice: productData.notice,
      product_type: productData.productType || 'Product',
      short_description_he: productData.short_description_he,
      skin_type_he: productData.skin_type_he || productData.line,
      header: productData.header,
      ingredients: productData.ingredients,
      french_name: productData.frenchName,
      product_line: productData.productLine || productData.line,
      type: productData.type || productData.productType,
      qty: (() => {
        const s = productData.stockQuantity;
        const q = productData.qty;
        if (s === null || s === undefined || (typeof s === 'string' && s.trim() === '')) {
          if (q === null || q === undefined || (typeof q === 'string' && String(q).trim() === '')) {
            return null; // preserve null
          }
          const parsedQ = parseInt(q, 10);
          return Number.isNaN(parsedQ) ? null : parsedQ;
        }
        const parsedS = parseInt(s, 10);
        return Number.isNaN(parsedS) ? null : parsedS;
      })()
    };
    
    const { data, error } = await supabase
      .from('products')
      .upsert([dataToSave], { onConflict: 'ref' })
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
};

export const deleteProduct = async (ref) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('ref', ref)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};