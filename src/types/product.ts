import { Database } from './supabase';

// Supabase generated types
export type ProductRow = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

// Price types from the prices table
export type PriceRow = Database['public']['Tables']['prices']['Row'];
export type PriceInsert = Database['public']['Tables']['prices']['Insert'];
export type PriceUpdate = Database['public']['Tables']['prices']['Update'];

// Application-specific Product interfaces
export interface Product extends ProductRow {
  // Add any computed or additional fields here
  formattedPrice?: string;
  isInStock?: boolean;
  categoryName?: string;
  // Legacy compatibility fields for backward compatibility
  name?: string; // Maps to product_name
  category?: string; // Maps to product_type
  unit?: string; // Maps to size
  productName?: string; // Maps to hebrew_name
  productName2?: string; // Maps to english_name
  productLine?: string; // Maps to product_line
  mainPic?: string; // Maps to main_pic
  unitPrice?: number; // For pricing compatibility
}

export interface ProductWithPricing extends Product {
  prices: PriceInfo[];
  currentPrice?: number;
  bulkPrices?: BulkPrice[];
}

export interface PriceInfo {
  id: string;
  product_id: string;
  quantity_min: number;
  quantity_max: number | null;
  price: number;
  unit_type: string;
  created_at: string;
  updated_at: string;
}

export interface BulkPrice {
  quantity: number;
  price: number;
  savings?: number;
}

export interface ProductFilter {
  category?: string;
  search?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  sortBy?: 'name' | 'price' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}
