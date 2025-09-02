import React, { useState, useEffect } from 'react';
import { getProducts, getProductLines, saveProduct, deleteProduct as apiDeleteProduct } from '../api/products';
import { getOrders as apiGetOrders, updateOrder as apiUpdateOrder } from '../api/orders';
import { importCsv as apiImportCsv, getCsvHeaders as apiGetCsvHeaders, exportCsv as apiExportCsv, replacePicsFromCsv } from '../api/csv';
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
  Card,
  CardContent,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Logout as LogoutIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';

const API_BASE = '/api';

const Admin = ({ onLogout, adminToken }) => {
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orderDialog, setOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editableOrder, setEditableOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    ref: 'ref no',
    productName: 'hebrew_name',
    productName2: 'Product Name2',
    line: 'line',
    notice: 'short_description_he',
    size: 'Size',
    unitPrice: 'unitPrice',
    productType: 'productType',
    description: 'description_he',
    activeIngredients: 'WirkungInhaltsstoffe_he',
    usageInstructions: 'Anwendung_he'
  });

  // Product form state
  const [productForm, setProductForm] = useState({
    ref: '',
    productName: '',
    productName2: '',
    line: '',
    notice: '',
    size: '',
    unitPrice: '',
    productType: '',
    mainPic: '',
    pics: [],
    description: '',
    activeIngredients: '',
    usageInstructions: '',
    highlights: []
  });

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    try {
      console.log('[FE] Load products');
      const data = await getProducts();
      console.log('[FE] Products loaded', Array.isArray(data) ? data.length : data);
      setProducts(data);
    } catch (error) {
      console.error('[FE] Load products error', error);
      showSnackbar('שגיאה בטעינת מוצרים', 'error');
    }
  };

  const loadOrders = async () => {
    try {
      console.log('[FE] Load orders');
      const data = await apiGetOrders(adminToken);
      console.log('[FE] Orders loaded', Array.isArray(data) ? data.length : data);
      setOrders(data);
    } catch (error) {
      console.error('[FE] Load orders error', error);
      showSnackbar('שגיאה בטעינת הזמנות', 'error');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    
    if (file) {
      console.log('[FE] CSV file selected', file.name, file.size);
      // Get CSV headers for column mapping
      apiGetCsvHeaders(file)
      .then(data => {
        console.log('[FE] CSV headers', data);
        setCsvHeaders(data.headers);
      })
      .catch(error => {
        console.error('[FE] Error getting CSV headers', error);
      });
    }
  };

  const handleImportCSV = async () => {
    if (!selectedFile) {
      showSnackbar('אנא בחר קובץ', 'error');
      return;
    }

    try {
      console.log('[FE] Import CSV', selectedFile.name, columnMapping);
      const data = await apiImportCsv(selectedFile, columnMapping);
      
      if (data && data.message) {
        console.log('[FE] Import CSV success', data);
        showSnackbar(data.message, 'success');
        loadProducts();
        setSelectedFile(null);
      } else {
        console.warn('[FE] Import CSV failed', data);
        showSnackbar(data.error || 'שגיאה בייבוא CSV', 'error');
      }
    } catch (error) {
      console.error('[FE] Import CSV network error', error);
      showSnackbar('שגיאה בייבוא CSV', 'error');
    }
  };

  const handleFixImagesFromCsv = async () => {
    if (!selectedFile) {
      showSnackbar('אנא בחר קובץ', 'error');
      return;
    }
    try {
      const token = adminToken;
      const result = await replacePicsFromCsv(selectedFile, token);
      showSnackbar(`תמונות עודכנו: ${result.updated || 0}`, 'success');
      loadProducts();
    } catch (error) {
      showSnackbar(error.message || 'שגיאה בעדכון תמונות', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      console.log('[FE] Export CSV');
      const response = await apiExportCsv();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products_export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      console.log('[FE] Export CSV success');
      showSnackbar('CSV יוצא בהצלחה', 'success');
    } catch (error) {
      console.error('[FE] Export CSV network error', error);
      showSnackbar('שגיאה בייצוא CSV', 'error');
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      ref: '',
      productName: '',
      productName2: '',
      line: '',
      notice: '',
      size: '',
      unitPrice: '',
      productType: '',
      mainPic: '',
      pics: [],
      description: '',
      activeIngredients: '',
      usageInstructions: '',
      highlights: []
    });
    setProductDialog(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      ...product,
      pics: product.pics ? JSON.parse(product.pics) : [],
      highlights: product.highlights ? JSON.parse(product.highlights) : []
    });
    setProductDialog(true);
  };

  const handleSaveProduct = async () => {
    try {
      console.log('[FE] Save product', productForm);
      await saveProduct(productForm, adminToken);
      
      {
        console.log('[FE] Save product success');
        showSnackbar('מוצר נשמר בהצלחה', 'success');
        setProductDialog(false);
        loadProducts();
      }
    } catch (error) {
      console.error('[FE] Save product network error', error);
      showSnackbar(error.message || 'שגיאה בשמירת מוצר', 'error');
    }
  };

  const handleDeleteProduct = async (ref) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) {
      try {
        console.log('[FE] Delete product', ref);
        await apiDeleteProduct(ref, adminToken);
        {
          console.log('[FE] Delete product success');
          showSnackbar('מוצר נמחק בהצלחה', 'success');
          loadProducts();
        }
      } catch (error) {
        console.error('[FE] Delete product network error', error);
        showSnackbar(error.message || 'שגיאה במחיקת מוצר', 'error');
      }
    }
  };

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

  const recalcOrderTotal = (items) => {
    return items.reduce((sum, it) => sum + (Number(it.unitPrice || 0) * Number(it.quantity || 0)), 0);
  };

  const handleOrderItemQty = (ref, delta) => {
    setEditableOrder(prev => {
      if (!prev) return prev;
      const nextItems = prev.items.map(it => it.ref === ref ? { ...it, quantity: Math.max(0, Number(it.quantity || 0) + delta) } : it)
                                 .filter(it => it.quantity > 0);
      const nextTotal = recalcOrderTotal(nextItems);
      return { ...prev, items: nextItems, total: nextTotal };
    });
  };

  const handleOrderNameChange = (name) => {
    setEditableOrder(prev => prev ? { ...prev, customerName: name } : prev);
  };

  const handleSaveOrder = async () => {
    if (!editableOrder) return;
    try {
      await apiUpdateOrder(editableOrder.id, {
        customerName: editableOrder.customerName,
        total: Number(editableOrder.total || 0),
        items: editableOrder.items
      }, adminToken);
      showSnackbar('הזמנה עודכנה בהצלחה', 'success');
      setOrderDialog(false);
      loadOrders();
    } catch (err) {
      showSnackbar(err.message || 'שגיאה בעדכון הזמנה', 'error');
    }
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

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
        <Tab label="ייבוא/ייצוא" />
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
                {products.map((product) => (
                  <TableRow key={product.ref}>
                    <TableCell sx={{ textAlign: 'right' }}>{product.ref}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>{product.productName}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>{product.line}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>${product.unitPrice}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <IconButton onClick={() => handleEditProduct(product)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteProduct(product.ref)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
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
                {Array.isArray(orders) && orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell sx={{ textAlign: 'right' }}>{order.id}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{order.customerName}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>${order.total}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{formatDate(order.created_at)}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <IconButton onClick={() => handleViewOrder(order)}>
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
                      {Array.isArray(orders) ? 'אין הזמנות' : 'טוען הזמנות...'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Import/Export Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ייבוא מוצרים מ-CSV
                </Typography>
                
                <input
                  accept=".csv"
                  style={{ display: 'none' }}
                  id="csv-file"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="csv-file">
                  <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
                    בחר קובץ CSV
                  </Button>
                </label>
                
                {selectedFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    קובץ נבחר: {selectedFile.name}
                  </Typography>
                )}

                {csvHeaders.length > 0 && (
                  <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>מיפוי עמודות</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {Object.keys(columnMapping).map((field) => (
                          <Grid item xs={12} sm={6} key={field}>
                            <FormControl fullWidth size="small">
                              <InputLabel>{field}</InputLabel>
                              <Select
                                value={columnMapping[field]}
                                onChange={(e) => setColumnMapping(prev => ({
                                  ...prev,
                                  [field]: e.target.value
                                }))}
                                label={field}
                              >
                                {csvHeaders.map((header) => (
                                  <MenuItem key={header} value={header}>
                                    {header}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                )}

                <Button
                  variant="contained"
                  onClick={handleImportCSV}
                  disabled={!selectedFile}
                  sx={{ mt: 2, ml: 1 }}
                >
                  ייבוא
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleFixImagesFromCsv}
                  disabled={!selectedFile}
                  sx={{ mt: 2, ml: 1 }}
                >
                  תקן תמונות
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ייצוא מוצרים ל-CSV
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  הורד את כל המוצרים כקובץ CSV
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportCSV}
                >
                  ייצוא CSV
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
                onChange={(e) => setProductForm({ ...productForm, ref: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="שם מוצר"
                value={productForm.productName}
                onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="שם מוצר 2"
                value={productForm.productName2}
                onChange={(e) => setProductForm({ ...productForm, productName2: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="קטגוריה"
                value={productForm.line}
                onChange={(e) => setProductForm({ ...productForm, line: e.target.value })}
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
                label="תיאור"
                multiline
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
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
          <Button onClick={() => setProductDialog(false)}>ביטול</Button>
          <Button onClick={handleSaveProduct} variant="contained">
            שמור
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
