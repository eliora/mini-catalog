import { supabase } from '../config/supabase';
import { processImageUrl, processImageUrls } from '../utils/imageHelpers';
// Mock data removed - using Supabase only

export const getProducts = async (search = '', line = '') => {
  try {
    console.log('🔍 Checking Supabase config:', {
      url: process.env.REACT_APP_SUPABASE_URL ? 'SET' : 'MISSING',
      key: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
    });

    // Database should be working now, let's try to use it
    console.log('🔄 Attempting to use database instead of mock data');

    // Check if Supabase is properly configured
    if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
      throw new Error('⚠️ Supabase not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env.local file. See SUPABASE_SETUP_GUIDE.md for instructions.');
    }

    // Select ONLY essential fields for initial catalog display (super fast loading)
    // Database columns: ref, hebrew_name, header, short_description_he, description_he, 
    // skin_type_he, usage_instructions_he, active_ingredients_he, ingredients, french_name, 
    // english_name, size, product_line, main_pic, pics, type, product_type, qty, unit_price
    let query = supabase.from('products').select(`
      ref,
      hebrew_name,
      english_name,
      short_description_he,
      main_pic,
      unit_price,
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
    
    query = query.order('ref').limit(500); // Get more to filter client-side
    
    const { data, error } = await query;
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
      .slice(0, 300); // Increased limit for more products
    
    console.log(`Products after filtering: ${filteredData.length} out of ${data.length}`);
    
    // Transform database structure to component expected structure (basic fields only)
    return filteredData.map(product => ({
      ...product,
      // Map database fields to component expected fields
      ref: product.ref,
      productName: product.hebrew_name,
      productName2: product.english_name,
      mainPic: processImageUrl(product.main_pic),
      unitPrice: product.unit_price || 0,
      size: product.size,
      line: product.product_line || product.skin_type_he,
      productLine: product.product_line,
      productType: product.product_type || product.type,
      // Keep original database fields too
      hebrew_name: product.hebrew_name,
      english_name: product.english_name,
      short_description_he: product.short_description_he,
      main_pic: product.main_pic,
      unit_price: product.unit_price,
      skin_type_he: product.skin_type_he,
      type: product.type,
      product_line: product.product_line,
      qty: product.qty, // Include qty for filtering
      // Accordion data will be loaded separately when needed
      accordionDataLoaded: false
    }));
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
      unit_price: parseFloat(productData.unitPrice) || 0,
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