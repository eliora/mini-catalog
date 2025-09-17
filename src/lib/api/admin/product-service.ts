/**
 * @file Admin Product Service Layer
 * @description Database operations for product management using the products schema.
 */

import { PRODUCTS_TABLE, PRODUCTS_HELPERS } from '@/constants/products-schema.js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Transforms a raw product record from the database into the API response format.
 * @param product The raw product record from the database.
 * @returns The transformed product object for API responses.
 */
function transformProduct(product: any) {
  if (!product) return null;

  return {
    ...product,
    // Add computed fields
    display_name: PRODUCTS_HELPERS.getName(product, 'hebrew'),
    formatted_price: PRODUCTS_HELPERS.formatPrice(product.unit_price),
    stock_status: PRODUCTS_HELPERS.getStockStatus(product.qty),
    stock_status_color: PRODUCTS_HELPERS.getStockStatusColor(product.qty),
    parsed_images: PRODUCTS_HELPERS.parseImages(product.pics),
  };
}

/**
 * Checks if a product with the given reference already exists.
 * @param supabase A Supabase client instance.
 * @param ref The product reference to check.
 * @param excludeId Optional ID to exclude from the check (for updates).
 * @returns True if the reference exists, false otherwise.
 */
export async function checkRefExists(supabase: SupabaseClient, ref: string, excludeId?: string): Promise<boolean> {
  let query = supabase
    .from('products')
    .select('id')
    .eq('ref', ref);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.single();
  
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  
  return !!data;
}

/**
 * Creates a new product record in the database.
 * @param supabase A Supabase service role client instance.
 * @param productData The validated and sanitized data for the new product.
 * @returns The newly created product object, transformed for the API response.
 */
export async function createProduct(supabase: SupabaseClient, productData: any) {
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      ...productData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select(`
      id, ref, hebrew_name, english_name, french_name,
      product_line, product_type, type, size, qty, unit_price,
      description, description_he, short_description_he, header,
      ingredients, active_ingredients_he, skin_type_he,
      usage_instructions_he, notice, main_pic, pics,
      created_at, updated_at
    `)
    .single();

  if (error) {
    throw error;
  }

  return transformProduct(product);
}

/**
 * Updates an existing product record in the database.
 * @param supabase A Supabase client instance.
 * @param id The product ID to update.
 * @param updateData The validated data to update.
 * @returns The updated product object.
 */
export async function updateProduct(supabase: SupabaseClient, id: string, updateData: any) {
  // First check if the product exists
  const { data: existingProduct, error: checkError } = await supabase
    .from('products')
    .select('id')
    .eq('id', id)
    .single();

  if (checkError) {
    if (checkError.code === 'PGRST116') {
      const notFoundError = new Error(`Product with ID ${id} not found.`);
      (notFoundError as any).code = 'PGRST116';
      throw notFoundError;
    }
    throw checkError;
  }

  const { data: product, error } = await supabase
    .from('products')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      id, ref, hebrew_name, english_name, french_name,
      product_line, product_type, type, size, qty, unit_price,
      description, description_he, short_description_he, header,
      ingredients, active_ingredients_he, skin_type_he,
      usage_instructions_he, notice, main_pic, pics,
      created_at, updated_at
    `)
    .single();

  if (error) {
    throw error;
  }

  return transformProduct(product);
}

/**
 * Deletes a product from the database.
 * @param supabase A Supabase client instance.
 * @param id The product ID to delete.
 * @returns True if deletion was successful.
 */
export async function deleteProduct(supabase: SupabaseClient, id: string): Promise<boolean> {
  // First check if the product exists
  const { data: existingProduct, error: checkError } = await supabase
    .from('products')
    .select('id')
    .eq('id', id)
    .single();

  if (checkError) {
    if (checkError.code === 'PGRST116') {
      const notFoundError = new Error(`Product with ID ${id} not found.`);
      (notFoundError as any).code = 'PGRST116';
      throw notFoundError;
    }
    throw checkError;
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * Retrieves products with filtering, pagination, and search.
 * @param supabase A Supabase client instance.
 * @param params Query parameters for filtering and pagination.
 * @returns Object containing products array and pagination info.
 */
export async function getProducts(supabase: SupabaseClient, params: any = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    product_line = '',
    product_type = '',
    stock_status = ''
  } = params;

  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from('products')
    .select(`
      id, ref, hebrew_name, english_name, french_name,
      product_line, product_type, type, size, qty, unit_price,
      description, description_he, short_description_he, header,
      ingredients, active_ingredients_he, skin_type_he,
      usage_instructions_he, notice, main_pic, pics,
      created_at, updated_at
    `, { count: 'exact' });

  // Apply filters
  if (search) {
    query = query.or(`hebrew_name.ilike.%${search}%,english_name.ilike.%${search}%,french_name.ilike.%${search}%,ref.ilike.%${search}%,product_line.ilike.%${search}%`);
  }

  if (product_line) {
    query = query.eq('product_line', product_line);
  }

  if (product_type) {
    query = query.eq('product_type', product_type);
  }

  // Stock status filtering
  if (stock_status) {
    switch (stock_status) {
      case 'in_stock':
        query = query.gt('qty', 10);
        break;
      case 'low_stock':
        query = query.gt('qty', 0).lte('qty', 10);
        break;
      case 'out_of_stock':
        query = query.eq('qty', 0);
        break;
    }
  }

  // Apply pagination and ordering
  const { data: products, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  // Transform products
  const transformedProducts = products?.map(transformProduct) || [];

  return {
    products: transformedProducts,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };
}

/**
 * Gets product statistics for the dashboard.
 * @param supabase A Supabase client instance.
 * @returns Object containing various product statistics.
 */
export async function getProductStats(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('products')
    .select('qty, unit_price, product_line');

  if (error) {
    throw error;
  }

  const totalProducts = data.length;
  const inStockCount = data.filter(p => p.qty > 0).length;
  const outOfStockCount = data.filter(p => p.qty === 0).length;
  const lowStockCount = data.filter(p => p.qty > 0 && p.qty <= 10).length;
  const productLinesCount = new Set(data.map(p => p.product_line).filter(Boolean)).size;
  const avgPrice = data.reduce((sum, p) => sum + (p.unit_price || 0), 0) / totalProducts;

  return {
    totalProducts,
    inStockCount,
    outOfStockCount,
    lowStockCount,
    productLinesCount,
    avgPrice: Math.round(avgPrice * 100) / 100
  };
}

/**
 * Gets available product lines for filtering.
 * @param supabase A Supabase client instance.
 * @returns Array of unique product lines.
 */
export async function getProductLines(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase
    .from('products')
    .select('product_line')
    .not('product_line', 'is', null);

  if (error) {
    throw error;
  }

  const uniqueLines = [...new Set(data.map(item => item.product_line))].sort();
  return uniqueLines;
}

/**
 * Gets available product types for filtering.
 * @param supabase A Supabase client instance.
 * @returns Array of unique product types.
 */
export async function getProductTypes(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase
    .from('products')
    .select('product_type')
    .not('product_type', 'is', null);

  if (error) {
    throw error;
  }

  const uniqueTypes = [...new Set(data.map(item => item.product_type))].sort();
  return uniqueTypes;
}
