/**
 * Client-side API functions for products
 * These functions call the Next.js API routes
 */

import { Product } from '@/types/product';

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    hasMore: boolean;
    total: number;
  };
}

interface FilterOptions {
  lines: string[];
  productTypes: string[];
  skinTypes: string[];
  types: string[];
}

/**
 * Get products with filtering and pagination
 */
export const getProducts = async (
  searchTerm: string = '',
  line: string = '',
  page: number = 1,
  pageSize: number = 50,
  filters: Record<string, string> = {}
): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  
  if (searchTerm) params.append('search', searchTerm);
  if (line) params.append('line', line);
  if (page > 1) params.append('page', page.toString());
  if (pageSize !== 50) params.append('pageSize', pageSize.toString());
  
  // Add filter parameters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  
  const response = await fetch(`/api/products?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch products');
  }
  
  return data.data;
};

/**
 * Get filter options for the catalog
 */
export const getFilterOptions = async (): Promise<FilterOptions> => {
  const response = await fetch('/api/products?filters=true');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch filter options: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch filter options');
  }
  
  return data.data;
};

/**
 * Get product details by reference
 */
export const getProductDetails = async (productRef: string): Promise<Product> => {
  const response = await fetch(`/api/products?getDetails=true&ref=${encodeURIComponent(productRef)}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch product details: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch product details');
  }
  
  return data.data;
};
