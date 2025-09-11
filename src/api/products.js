import { supabase } from '../config/supabase';
import { processImageUrl, processImageUrls } from '../utils/imageHelpers';
import { getPrices } from './prices';
// Mock data removed - using Supabase only

// Helper function to add timeout to any promise
const withTimeout = (promise, timeoutMs = 10000, operation = 'Operation') => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`${operation} timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
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

export const getProducts = async (search = '', line = '', page = 1, pageSize = 50) => {
  try {
    console.log('🔍 Loading products with timeout protection...');
    console.log('🔍 Checking Supabase config:', {
      url: process.env.REACT_APP_SUPABASE_URL ? 'SET' : 'MISSING',
      key: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
    });

    // Check if Supabase is properly configured
    if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
      throw new Error('⚠️ Supabase not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env.local file. See SUPABASE_SETUP_GUIDE.md for instructions.');
    }

    // Select ONLY essential fields for initial catalog display (super fast loading)
    // NOTE: unit_price removed from products table - now in separate prices table
    // Database columns: ref, hebrew_name, header, short_description_he, description_he, 
    // skin_type_he, usage_instructions_he, active_ingredients_he, ingredients, french_name, 
    // english_name, size, product_line, main_pic, pics, type, product_type, qty
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
      qty
    `);
    
    if (search) {
      query = query.or(`ref.ilike.%${search}%,hebrew_name.ilike.%${search}%,english_name.ilike.%${search}%`);
    }
    
    if (line) {
      query = query.or(`product_line.ilike.%${line}%,skin_type_he.ilike.%${line}%`);
    }
    
    // Add pagination for lazy loading
    const offset = (page - 1) * pageSize;
    query = query.order('ref').range(offset, offset + pageSize - 1);
    
    // Execute query with timeout and retry protection
    const { data, error } = await retryOperation(
      () => withTimeout(query, 8000, 'Products query'),
      3, // 3 attempts max
      1000 // 1 second initial delay
    );
    
    if (error) throw error;
    
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
    
    console.log(`Products after filtering: ${filteredData.length} out of ${data.length}`);
    
    // Get product refs for price lookup
    const productRefs = filteredData.map(product => product.ref);
    
    // Fetch prices separately (only if user has permission) with timeout protection
    let prices = {};
    try {
      prices = await retryOperation(
        () => withTimeout(getPrices(productRefs), 5000, 'Prices query'),
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
      unitPrice: prices[product.ref]?.unitPrice || 0,
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
        hasMore: filteredData.length === pageSize, // If we got full page, there might be more
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
  try {
    console.log('🔍 Loading product details for ref:', productRef);
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

    console.log('✅ Product details loaded successfully:', data);
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