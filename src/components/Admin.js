import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getProducts, saveProduct, deleteProduct as apiDeleteProduct } from '../api/products';
import { getOrders as apiGetOrders, updateOrder as apiUpdateOrder } from '../api/orders';
import CsvImport from './CsvImport';
import SupabaseConnectionTest from './SupabaseConnectionTest';
import DatabaseTest from './DatabaseTest';
import CompanySettings from './CompanySettings';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import ProductRow from './ProductRow';
import OrderRow from './OrderRow';

const Admin = ({ onLogout, adminToken }) => {
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orderDialog, setOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editableOrder, setEditableOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // CSV functionality removed - using direct Supabase operations instead

  // Product form state
  const [productForm, setProductForm] = useState({
    ref: '',
    productName: '', // hebrew_name
    productName2: '', // product_name (English)
    size: '',
    unitPrice: '',
    productType: '',
    mainPic: '', // pic
    pics: [], // all_pics
    description: '', // description_he
    activeIngredients: '', // wirkunginhaltsstoffe_he
    usageInstructions: '', // anwendung_he
    short_description_he: '',
    skin_type_he: '',
    notice: ''
  });

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

  // CSV functionality will be implemented later with Supabase file storage

  const emptyProductForm = useMemo(() => ({
    ref: '',
    productName: '', // hebrew_name
    productName2: '', // product_name (English)
    size: '',
    unitPrice: '',
    productType: '',
    mainPic: '', // pic
    pics: [], // all_pics
    description: '', // description_he
    activeIngredients: '', // wirkunginhaltsstoffe_he
    usageInstructions: '', // anwendung_he
    short_description_he: '',
    skin_type_he: '',
    notice: ''
  }), []);

  const handleAddProduct = useCallback(() => {
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setProductDialog(true);
  }, [emptyProductForm]);

  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setProductForm({
      ...product,
      pics: Array.isArray(product.pics) ? product.pics : (product.all_pics ? product.all_pics.split(' | ').filter(Boolean) : [])
    });
    setProductDialog(true);
  }, []);

  const updateProductForm = useCallback((field, value) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveProduct = useCallback(async () => {
    if (!productForm.ref || !productForm.productName) {
      showSnackbar('נדרש מספר מוצר ושם מוצר', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await saveProduct(productForm);
      showSnackbar('מוצר נשמר בהצלחה', 'success');
      setProductDialog(false);
      loadProducts();
    } catch (error) {
      console.error('Save product error:', error);
      showSnackbar(error.message || 'שגיאה בשמירת מוצר', 'error');
    } finally {
      setLoading(false);
    }
  }, [productForm, loadProducts, showSnackbar]);

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
    try {
      const items = JSON.parse(order.items || '[]');
      setEditableOrder({ id: order.id, customerName: order.customerName || '', items, total: order.total });
    } catch {
      setEditableOrder({ id: order.id, customerName: order.customerName || '', items: [], total: order.total });
    }
    setOrderDialog(true);
  };

  const recalcOrderTotal = useCallback((items) => {
    return items.reduce((sum, item) => sum + (Number(item.unitPrice || 0) * Number(item.quantity || 0)), 0);
  }, []);

  const handleOrderItemQty = useCallback((ref, delta) => {
    setEditableOrder(prev => {
      if (!prev) return prev;
      const nextItems = prev.items
        .map(item => item.ref === ref ? { ...item, quantity: Math.max(0, Number(item.quantity || 0) + delta) } : item)
        .filter(item => item.quantity > 0);
      const nextTotal = recalcOrderTotal(nextItems);
      return { ...prev, items: nextItems, total: nextTotal };
    });
  }, [recalcOrderTotal]);

  const handleOrderNameChange = useCallback((name) => {
    setEditableOrder(prev => prev ? { ...prev, customerName: name } : prev);
  }, []);

  const handleSaveOrder = useCallback(async () => {
    if (!editableOrder) return;
    
    setLoading(true);
    try {
      await apiUpdateOrder(editableOrder.id, {
        customerName: editableOrder.customerName,
        total: Number(editableOrder.total || 0),
        items: editableOrder.items
      });
      showSnackbar('הזמנה עודכנה בהצלחה', 'success');
      setOrderDialog(false);
      loadOrders();
    } catch (error) {
      console.error('Update order error:', error);
      showSnackbar(error.message || 'שגיאה בעדכון הזמנה', 'error');
    } finally {
      setLoading(false);
    }
  }, [editableOrder, loadOrders, showSnackbar]);

  const handlePrintOrder = () => {
    window.print();
  };

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleString('he-IL');
  }, []);

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          לוח ניהול
        </Typography>
        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={onLogout}
        >
          התנתק
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="מוצרים" />
        <Tab label="הזמנות" />
        <Tab label="ייבוא CSV" />
        <Tab label="מערכת" />
      </Tabs>

      {/* Products Tab */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">ניהול מוצרים</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddProduct}
            >
              הוסף מוצר
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table sx={{ direction: 'rtl' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ textAlign: 'right' }}>קוד אצווה (ref no)</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>שם מוצר</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>קטגוריה</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>מחיר</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>פעולות</TableCell>
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
                      אין מוצרים
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
      )}

      {/* Orders Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            הזמנות ({Array.isArray(orders) ? orders.length : 0})
          </Typography>

          <TableContainer component={Paper}>
            <Table sx={{ direction: 'rtl' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ textAlign: 'right' }}>מספר</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>שם לקוח</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>סה"כ</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>תאריך</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                      אין הזמנות
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onView={handleViewOrder}
                      formatDate={formatDate}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* CSV Import Tab */}
      {tabValue === 2 && (
        <Box>
          <CsvImport
            onImportComplete={() => {
              loadProducts();
            }}
          />
        </Box>
      )}

      {/* System Tab */}
      {tabValue === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            מערכת ומחשוב
          </Typography>

          {/* Company Settings */}
          <Box sx={{ mb: 3 }}>
            <CompanySettings />
          </Box>

          <SupabaseConnectionTest />

          <Box sx={{ mt: 3 }}>
            <DatabaseTest />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                מידע מערכת
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
          </Box>
        </Box>
      )}

      {/* Product Dialog */}
      <Dialog open={productDialog} onClose={() => setProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'ערוך מוצר' : 'הוסף מוצר'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="קוד אצווה (ref no)"
                value={productForm.ref}
                onChange={(e) => updateProductForm('ref', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="שם מוצר"
                value={productForm.productName}
                onChange={(e) => updateProductForm('productName', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="שם מוצר באנגלית"
                value={productForm.productName2}
                onChange={(e) => setProductForm({ ...productForm, productName2: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="סוג עור"
                value={productForm.skin_type_he}
                onChange={(e) => setProductForm({ ...productForm, skin_type_he: e.target.value })}
                placeholder="עור יבש, עור רגיש, עור בוגר"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="גודל"
                value={productForm.size}
                onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="מחיר"
                type="number"
                value={productForm.unitPrice}
                onChange={(e) => setProductForm({ ...productForm, unitPrice: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="תיאור קצר"
                multiline
                rows={2}
                value={productForm.short_description_he}
                onChange={(e) => setProductForm({ ...productForm, short_description_he: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="תיאור מלא"
                multiline
                rows={4}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                helperText="תומך בתגיות HTML כמו <p>, <ul>, <li>, <strong>"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="הערה"
                multiline
                rows={2}
                value={productForm.notice}
                onChange={(e) => setProductForm({ ...productForm, notice: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="רכיבים פעילים"
                multiline
                rows={2}
                value={productForm.activeIngredients}
                onChange={(e) => setProductForm({ ...productForm, activeIngredients: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="הוראות שימוש"
                multiline
                rows={2}
                value={productForm.usageInstructions}
                onChange={(e) => setProductForm({ ...productForm, usageInstructions: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="תמונת מוצר ראשית (mainPic URL)"
                value={productForm.mainPic}
                onChange={(e) => setProductForm({ ...productForm, mainPic: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="תמונות נוספות (pics, מופרד בפסיקים או |)"
                value={Array.isArray(productForm.pics) ? productForm.pics.join(' | ') : (productForm.pics || '')}
                onChange={(e) => setProductForm({ ...productForm, pics: e.target.value })}
                placeholder="url1 | url2 | url3"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialog(false)} disabled={loading}>
            ביטול
          </Button>
          <Button 
            onClick={handleSaveProduct} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'שומר...' : 'שמור'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={orderDialog} onClose={() => setOrderDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          פרטי הזמנה
          <IconButton
            onClick={() => setOrderDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {editableOrder && (
            <Box>
              <Typography variant="h6" gutterBottom>
                הזמנה מספר #{editableOrder.id}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body1" sx={{ minWidth: 80 }}>
                  <strong>לקוח:</strong>
                </Typography>
                <TextField size="small" value={editableOrder.customerName} onChange={(e) => handleOrderNameChange(e.target.value)} fullWidth />
              </Box>
              <Typography variant="body1">
                <strong>סה"כ:</strong> ${Number(editableOrder.total).toFixed(2)}
              </Typography>
              {selectedOrder && (
                <Typography variant="body1">
                  <strong>תאריך:</strong> {formatDate(selectedOrder.created_at)}
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                פריטים
              </Typography>
              {editableOrder.items.map((item, index) => (
                <Box key={index} sx={{ mb: 1, p: 1, border: '1px solid #eee', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Box>
                    <Typography variant="body2">
                      <strong>{item.productName}</strong> (קוד: {item.ref})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${item.unitPrice}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" onClick={() => handleOrderItemQty(item.ref, -1)}>
                      <DeleteIcon style={{ display: item.quantity <= 1 ? 'inline-block' : 'none' }} />
                      <RemoveIcon style={{ display: item.quantity > 1 ? 'inline-block' : 'none' }} />
                    </IconButton>
                    <Typography sx={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</Typography>
                    <IconButton size="small" onClick={() => handleOrderItemQty(item.ref, 1)}>
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Button onClick={handlePrintOrder} variant="outlined">הדפס / PDF</Button>
                <Button onClick={handleSaveOrder} variant="contained">שמור שינויים</Button>
              </Box>
            </Box>
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
    </Box>
  );
};

export default Admin;
