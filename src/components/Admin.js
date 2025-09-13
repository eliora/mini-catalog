import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getProducts, saveProduct, deleteProduct as apiDeleteProduct } from '../api/products';
import { getOrders as apiGetOrders } from '../api/orders';
import CsvImport from './admin/forms/CsvImport';
// Development testing components moved to temp/unused
import CompanySettings from './admin/forms/CompanySettings';
import VendorDashboardLayout from './layouts/VendorDashboardLayout';
import DashboardOverview from './admin/DashboardOverview';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogContent,
  Grid,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon
} from '@mui/icons-material';
import ProductRow from './ProductRow';
import OrderRow from './OrderRow';
import OrderDetails from './OrderDetails';

// Styled components
import StyledButton from './ui/StyledButton';
import ProductForm from './admin/forms/ProductForm';

const Admin = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orderDialog, setOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // CSV functionality removed - using direct Supabase operations instead

  // Product form state (now handled by ProductForm component)

  const showSnackbar = useCallback((message, severity) => {
    setSnackbar({ open: true, message, severity });
  }, []);

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

  // Product dialog handlers
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



  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleString('he-IL');
  }, []);

  // Calculate stats for dashboard
  const dashboardStats = useMemo(() => ({
    products: products.length,
    orders: Array.isArray(orders) ? orders.length : 0,
    revenue: Array.isArray(orders) ? orders.reduce((sum, order) => sum + (order.total || 0), 0) : 0,
    customers: Array.isArray(orders) ? new Set(orders.map(order => order.customerName || order.customer_name)).size : 0,
    pendingOrders: Array.isArray(orders) ? orders.filter(order => order.status !== 'completed').length : 0,
    completedOrders: Array.isArray(orders) ? orders.filter(order => order.status === 'completed').length : 0
  }), [products, orders]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

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

  const renderProductsTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          ניהול מוצרים
        </Typography>
              <StyledButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
        >
          הוסף מוצר
              </StyledButton>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>קוד מוצר</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>שם מוצר</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>קטגוריה</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>מחיר</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    אין מוצרים במערכת
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <ProductRow
                  key={product.ref}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderOrdersTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        ניהול הזמנות
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'success.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>תאריך ושעה</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>מספר הזמנה</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>פרטי לקוח</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>סכום</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>סטטוס</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    טוען הזמנות...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    אין הזמנות במערכת
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    הזמנות שיוגשו יופיעו כאן
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onView={handleViewOrder}
                  onEdit={handleEditOrder}
                  onRevive={handleReviveOrder}
                  formatDate={formatDate}
                  isAdmin={true}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
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
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              מידע מערכת
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              כאן תוכל לעקוב אחר מצב המערכת ולבצע פעולות תחזוקה.
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                <strong>סביבת עבודה:</strong> {process.env.NODE_ENV || 'development'}
              </Typography>
              <Typography variant="body1">
                <strong>זמן בנייה:</strong> {new Date().toLocaleString('he-IL')}
              </Typography>
              <Typography variant="body1">
                <strong>מצב Supabase:</strong> {process.env.REACT_APP_SUPABASE_URL ? 'מוגדר' : 'לא מוגדר'}
              </Typography>
            </Box>
          </Paper>
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
