/**
 * useAdminData Hook - Centralized admin data management
 * 
 * Custom hook for managing products and orders data in the admin dashboard.
 * Provides loading, CRUD operations, and error handling for admin components.
 * 
 * Features:
 * - Products loading and CRUD operations
 * - Orders loading and management
 * - Centralized error handling and notifications
 * - Optimized with useCallback for performance
 * 
 * Returns:
 * - Data: products, orders, loading states
 * - Actions: loadProducts, loadOrders, product CRUD operations
 * - Utilities: showSnackbar, formatDate
 */

import { useState, useCallback, useEffect } from 'react';
import { Product } from '@/types/product';
import { Order } from '@/types/order';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface UseAdminDataResult {
  // Data
  products: Product[];
  orders: Order[];
  loading: boolean;
  snackbar: SnackbarState;
  
  // Actions
  loadProducts: () => Promise<void>;
  loadOrders: () => Promise<void>;
  saveProductData: (formData: Record<string, unknown>) => Promise<boolean>;
  deleteProductData: (ref: string) => Promise<boolean>;
  
  // Utilities
  showSnackbar: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void;
  formatDate: (dateString: string) => string;
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>;
}

// Client-side API functions
const getProducts = async (): Promise<Product[]> => {
  const response = await fetch('/api/products');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch products');
  }
  
  return data.data.products || [];
};

const getOrders = async (): Promise<Order[]> => {
  const response = await fetch('/api/orders');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch orders');
  }
  
  return data.data || [];
};

const saveProduct = async (formData: Record<string, unknown>): Promise<void> => {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error(`Failed to save product: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to save product');
  }
};

const deleteProduct = async (ref: string): Promise<void> => {
  const response = await fetch(`/api/products?ref=${encodeURIComponent(ref)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete product: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to delete product');
  }
};

const useAdminData = (): UseAdminDataResult => {
  // ===== DATA STATE =====
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  
  // ===== NOTIFICATION STATE =====
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // ===== UTILITY FUNCTIONS =====
  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL');
  }, []);

  // ===== DATA LOADING FUNCTIONS =====
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load products error:', error);
      showSnackbar('שגיאה בטעינת מוצרים', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load orders error:', error);
      showSnackbar('שגיאה בטעינת הזמנות', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  // ===== PRODUCT MANAGEMENT FUNCTIONS =====
  const saveProductData = useCallback(async (formData: Record<string, unknown>): Promise<boolean> => {
    if (!formData.ref || !formData.productName) {
      showSnackbar('נדרש מספר מוצר ושם מוצר', 'error');
      return false;
    }
    
    setLoading(true);
    try {
      await saveProduct(formData);
      showSnackbar('מוצר נשמר בהצלחה', 'success');
      await loadProducts();
      return true;
    } catch (error) {
      console.error('Save product error:', error);
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בשמירת מוצר';
      showSnackbar(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadProducts, showSnackbar]);

  const deleteProductData = useCallback(async (ref: string): Promise<boolean> => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) return false;
    
    setLoading(true);
    try {
      await deleteProduct(ref);
      showSnackbar('מוצר נמחק בהצלחה', 'success');
      await loadProducts();
      return true;
    } catch (error) {
      console.error('Delete product error:', error);
      const errorMessage = error instanceof Error ? error.message : 'שגיאה במחיקת מוצר';
      showSnackbar(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadProducts, showSnackbar]);

  // ===== LOAD DATA ON MOUNT =====
  useEffect(() => {
    loadProducts();
    loadOrders();
  }, [loadProducts, loadOrders]);

  return {
    // Data
    products,
    orders,
    loading,
    snackbar,
    
    // Actions
    loadProducts,
    loadOrders,
    saveProductData,
    deleteProductData,
    
    // Utilities
    showSnackbar,
    formatDate,
    setSnackbar
  };
};

export default useAdminData;
