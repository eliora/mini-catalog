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
import { getProducts, saveProduct, deleteProduct as apiDeleteProduct } from '../api/products';
import { getOrders as apiGetOrders } from '../api/orders';

const useAdminData = () => {
  // ===== DATA STATE =====
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ===== NOTIFICATION STATE =====
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ===== UTILITY FUNCTIONS =====
  const showSnackbar = useCallback((message, severity) => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const formatDate = useCallback((dateString) => {
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
      const data = await apiGetOrders();
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
  const saveProductData = useCallback(async (formData) => {
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
      showSnackbar(error.message || 'שגיאה בשמירת מוצר', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadProducts, showSnackbar]);

  const deleteProductData = useCallback(async (ref) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) return false;
    
    setLoading(true);
    try {
      await apiDeleteProduct(ref);
      showSnackbar('מוצר נמחק בהצלחה', 'success');
      await loadProducts();
      return true;
    } catch (error) {
      console.error('Delete product error:', error);
      showSnackbar(error.message || 'שגיאה במחיקת מוצר', 'error');
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
