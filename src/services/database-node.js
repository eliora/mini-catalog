// Node.js version of the database service for Supabase operations
const { createClient } = require('@supabase/supabase-js');

class DatabaseService {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!this.supabaseUrl || !this.serviceRoleKey) {
      throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    }
    
    // Create admin client with service role key for server operations
    this.supabase = createClient(this.supabaseUrl, this.serviceRoleKey);
  }

  // Products operations
  async getProducts(search = '', line = '') {
    let query = this.supabase.from('products').select('*');
    
    if (search) {
      query = query.or(`ref.ilike.%${search}%,productName.ilike.%${search}%,productName2.ilike.%${search}%`);
    }
    
    if (line) {
      query = query.eq('line', line);
    }
    
    query = query.order('ref');
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getProductLines() {
    const { data, error } = await this.supabase
      .from('products')
      .select('line')
      .not('line', 'is', null)
      .order('line');
    
    if (error) throw error;
    
    // Extract unique lines
    const uniqueLines = [...new Set(data.map(item => item.line))];
    return uniqueLines;
  }

  async createProduct(product) {
    // Ensure pics and highlights are properly formatted as JSON
    const productData = {
      ...product,
      pics: Array.isArray(product.pics) ? product.pics : JSON.parse(product.pics || '[]'),
      highlights: Array.isArray(product.highlights) ? product.highlights : JSON.parse(product.highlights || '[]')
    };

    const { data, error } = await this.supabase
      .from('products')
      .insert([productData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async updateProduct(ref, product) {
    // Ensure pics and highlights are properly formatted as JSON
    const productData = {
      ...product,
      pics: Array.isArray(product.pics) ? product.pics : JSON.parse(product.pics || '[]'),
      highlights: Array.isArray(product.highlights) ? product.highlights : JSON.parse(product.highlights || '[]')
    };

    const { data, error } = await this.supabase
      .from('products')
      .update(productData)
      .eq('ref', ref)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async upsertProduct(product) {
    // For INSERT OR REPLACE equivalent
    const productData = {
      ...product,
      pics: Array.isArray(product.pics) ? product.pics : JSON.parse(product.pics || '[]'),
      highlights: Array.isArray(product.highlights) ? product.highlights : JSON.parse(product.highlights || '[]')
    };

    const { data, error } = await this.supabase
      .from('products')
      .upsert([productData], { onConflict: 'ref' })
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async deleteProduct(ref) {
    const { data, error } = await this.supabase
      .from('products')
      .delete()
      .eq('ref', ref)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async clearAllProducts() {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    if (error) throw error;
  }

  async bulkInsertProducts(products) {
    // Process products to ensure JSON fields are properly formatted
    const processedProducts = products.map(product => ({
      ...product,
      pics: Array.isArray(product.pics) ? product.pics : JSON.parse(product.pics || '[]'),
      highlights: Array.isArray(product.highlights) ? product.highlights : JSON.parse(product.highlights || '[]')
    }));

    const { data, error } = await this.supabase
      .from('products')
      .insert(processedProducts)
      .select();
    
    if (error) throw error;
    return data;
  }

  async updateProductImage(ref, mainPic) {
    const { data, error } = await this.supabase
      .from('products')
      .update({ mainPic })
      .eq('ref', ref)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async getProductsForImageFix() {
    const { data, error } = await this.supabase
      .from('products')
      .select('ref, mainPic, pics');
    
    if (error) throw error;
    return data;
  }

  // Orders operations
  async createOrder(customerName, total, items) {
    const { data, error } = await this.supabase
      .from('orders')
      .insert([{
        customerName,
        total,
        items: Array.isArray(items) ? items : JSON.parse(items)
      }])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async getOrders() {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async updateOrder(id, customerName, total, items) {
    const { data, error } = await this.supabase
      .from('orders')
      .update({
        customerName,
        total,
        items: Array.isArray(items) ? items : JSON.parse(items)
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // Export data for migration
  async getAllProductsForExport() {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .order('ref');
    
    if (error) throw error;
    return data;
  }
}

module.exports = DatabaseService;
