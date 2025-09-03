import { supabase } from '../config/supabase';

export const getProducts = async (search = '', line = '') => {
  try {
    let query = supabase.from('products').select('*');
    
    if (search) {
      query = query.or(`"ref no".ilike.%${search}%,hebrew_name.ilike.%${search}%,"Product Name".ilike.%${search}%`);
    }
    
    if (line) {
      query = query.ilike('skin_type_he', `%${line}%`);
    }
    
    query = query.order('"ref no"'); // Use quotes for column with space
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Transform CSV structure to component expected structure
    return data.map(product => ({
      ...product,
      // Map exact CSV fields to component expected fields
      ref: product['ref no'],
      productName: product.hebrew_name,
      productName2: product['Product Name'], // English name
      description: product.description_he,
      activeIngredients: product['WirkungInhaltsstoffe_he'],
      usageInstructions: product['Anwendung_he'],
      mainPic: product.pic,
      pics: product.all_pics ? product.all_pics.split(' | ').filter(Boolean) : [],
      unitPrice: product.unit_price || 0,
      size: product['Size'],
      line: product.skin_type_he, // Use skin type as line/category
      // Keep original CSV fields too
      short_description_he: product.short_description_he,
      skin_type_he: product.skin_type_he
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
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
    // Map component fields back to exact CSV structure
    const dataToSave = {
      'ref no': productData.ref,
      hebrew_name: productData.productName,
      'Product Name': productData.productName2,
      'Product Name2': productData.productName2,
      description_he: productData.description,
      'WirkungInhaltsstoffe_he': productData.activeIngredients,
      'Anwendung_he': productData.usageInstructions,
      pic: productData.mainPic,
      all_pics: Array.isArray(productData.pics) 
        ? productData.pics.join(' | ') 
        : (typeof productData.pics === 'string' ? productData.pics : ''),
      unit_price: parseFloat(productData.unitPrice) || 0,
      'Size': productData.size,
      notice: productData.notice,
      product_type: productData.productType || 'Product',
      short_description_he: productData.short_description_he,
      skin_type_he: productData.skin_type_he || productData.line
    };
    
    const { data, error } = await supabase
      .from('products')
      .upsert([dataToSave], { onConflict: 'ref no' })
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
      .eq('ref no', ref)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};