/**
 * Admin Component - Main Admin Dashboard
 * 
 * Central admin interface for managing products, orders, customers, and system settings.
 * Provides tabbed navigation with different management sections.
 * 
 * Features:
 * - Dashboard overview with statistics
 * - Product management (CRUD operations)
 * - Order management and processing
 * - Customer management (placeholder)
 * - Reports and analytics (placeholder)
 * - Data import functionality
 * - System settings and configuration
 * 
 * Architecture:
 * - Uses VendorDashboardLayout for consistent UI
 * - Extracted table components for better maintainability
 * - Centralized state management for products and orders
 * - Error handling with user-friendly messages
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getProducts, saveProduct, deleteProduct as apiDeleteProduct } from '../../api/products';
import { getOrders as apiGetOrders } from '../../api/orders';

// Admin sub-components
import CsvImport from './forms/CsvImport';
import CompanySettings from './forms/CompanySettings';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import DashboardOverview from './DashboardOverview';
import AdminProductsTable from './data/AdminProductsTable';
import AdminOrdersTable from './data/AdminOrdersTable';
import AdminSystemInfo from './AdminSystemInfo';
import ProductForm from './forms/ProductForm';
import OrderDetails from '../orderform/OrderDetails';

// UI components
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';

const Admin = ({ onLogout }) => {
  // ===== NAVIGATION STATE =====
  const [activeTab, setActiveTab] = useState(0);
  
  // ===== DATA STATE =====
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ===== DIALOG STATE =====
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orderDialog, setOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // ===== NOTIFICATION STATE =====
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ===== UTILITY FUNCTIONS =====
  const showSnackbar = useCallback((message, severity) => {
    setSnackbar({ open: true, message, severity });
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

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, [loadProducts, loadOrders]);

  // ===== PRODUCT MANAGEMENT HANDLERS =====
  const handleAddProduct = useCallback(() => {
    setEditingProduct(null);
    setProductDialog(true);
  }, []);

  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setProductDialog(true);
  }, []);

  const handleSaveProduct = useCallback(async (formData) => {
    if (!formData.ref || !formData.productName) {
      showSnackbar('נדרש מספר מוצר ושם מוצר', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await saveProduct(formData);
      showSnackbar('מוצר נשמר בהצלחה', 'success');
      setProductDialog(false);
      loadProducts();
    } catch (error) {
      console.error('Save product error:', error);
      showSnackbar(error.message || 'שגיאה בשמירת מוצר', 'error');
    } finally {
      setLoading(false);
    }
  }, [loadProducts, showSnackbar]);

  const handleDeleteProduct = useCallback(async (ref) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) return;
    
    setLoading(true);
    try {
      await apiDeleteProduct(ref);
      showSnackbar('מוצר נמחק בהצלחה', 'success');
      loadProducts();
    } catch (error) {
      console.error('Delete product error:', error);
      showSnackbar(error.message || 'שגיאה במחיקת מוצר', 'error');
    } finally {
      setLoading(false);
    }
  }, [loadProducts, showSnackbar]);

  // ===== ORDER MANAGEMENT HANDLERS =====
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOrderDialog(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setOrderDialog(true);
  };

  const handleReviveOrder = (order) => {
    // Navigate to order form with the order data
    const event = new CustomEvent('navigateToTab', { 
      detail: { 
        tab: 1, // Order form tab
        orderData: {
          customerName: order.customerName || order.customer_name || '',
          items: typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []),
          orderId: order.id
        }
      } 
    });
    window.dispatchEvent(event);
  };



  // ===== UTILITY FUNCTIONS =====
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleString('he-IL');
  }, []);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  // ===== COMPUTED VALUES =====
  // Calculate stats for dashboard overview
  const dashboardStats = useMemo(() => ({
    products: products.length,
    orders: Array.isArray(orders) ? orders.length : 0,
    revenue: Array.isArray(orders) ? orders.reduce((sum, order) => sum + (order.total || 0), 0) : 0,
    customers: Array.isArray(orders) ? new Set(orders.map(order => order.customerName || order.customer_name)).size : 0,
    pendingOrders: Array.isArray(orders) ? orders.filter(order => order.status !== 'completed').length : 0,
    completedOrders: Array.isArray(orders) ? orders.filter(order => order.status === 'completed').length : 0
  }), [products, orders]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Dashboard Overview
        return (
          <DashboardOverview 
            stats={dashboardStats}
            recentOrders={Array.isArray(orders) ? orders.slice(0, 10) : []}
          />
        );
      case 1: // Products
        return renderProductsTab();
      case 2: // Orders
        return renderOrdersTab();
      case 3: // Customers
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              ניהול לקוחות
            </Typography>
            <Typography variant="body1" color="text.secondary">
              תכונה זו תהיה זמינה בקרוב...
            </Typography>
          </Box>
        );
      case 4: // Reports
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              דוחות ואנליטיקה
            </Typography>
            <Typography variant="body1" color="text.secondary">
              תכונה זו תהיה זמינה בקרוב...
            </Typography>
          </Box>
        );
      case 5: // Import
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              ייבוא נתונים
            </Typography>
            <CsvImport onImportComplete={loadProducts} />
          </Box>
        );
      case 6: // Settings
        return renderSettingsTab();
      default:
        return null;
    }
  };

  // ===== TAB RENDER FUNCTIONS =====
  const renderProductsTab = () => (
    <AdminProductsTable
      products={products}
      loading={loading}
      onAddProduct={handleAddProduct}
      onEditProduct={handleEditProduct}
      onDeleteProduct={handleDeleteProduct}
    />
  );

  const renderOrdersTab = () => (
    <AdminOrdersTable
      orders={orders}
      loading={loading}
      onViewOrder={handleViewOrder}
      onEditOrder={handleEditOrder}
      onReviveOrder={handleReviveOrder}
      formatDate={formatDate}
    />
  );

  const renderSettingsTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        הגדרות מערכת
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CompanySettings />
        </Grid>
        
        {/* Development testing components removed for production */}
        
        <Grid item xs={12}>
          <AdminSystemInfo />
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <>
      <VendorDashboardLayout
        onLogout={onLogout}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        stats={dashboardStats}
        userInfo={{
          name: 'מנהל מערכת',
          email: 'admin@example.com'
        }}
      >
        {renderTabContent()}
      </VendorDashboardLayout>

      {/* Product Form Dialog */}
      <ProductForm
        product={editingProduct}
        open={productDialog}
        onClose={() => setProductDialog(false)}
        onSave={handleSaveProduct}
        loading={loading}
      />

      {/* Enhanced Order Details Dialog */}
      <Dialog 
        open={orderDialog} 
        onClose={() => setOrderDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedOrder && (
            <OrderDetails
              order={selectedOrder}
              onClose={() => setOrderDialog(false)}
              onUpdate={(updatedOrder) => {
                // Refresh orders list
                loadOrders();
                showSnackbar('הזמנה עודכנה בהצלחה', 'success');
                setOrderDialog(false);
              }}
              isAdmin={true}
              onReviveOrder={handleReviveOrder}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Admin;
