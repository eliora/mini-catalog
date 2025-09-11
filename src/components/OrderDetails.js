import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import { updateOrder } from '../api/orders';
import { getProducts } from '../api/products';
import { useCompany } from '../context/CompanyContext';

const OrderDetails = ({ 
  order, 
  onClose, 
  onUpdate, 
  isAdmin = false,
  onReviveOrder
}) => {
  const { settings: companySettings } = useCompany();
  const [editMode, setEditMode] = useState(false);
  const [editableOrder, setEditableOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [addItemDialog, setAddItemDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customQuantity, setCustomQuantity] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
      setEditableOrder({
        ...order,
        customerName: order.customerName || order.customer_name || '',
        items: items
      });
    }
  }, [order]);

  useEffect(() => {
    if (isAdmin && editMode) {
      loadProducts();
    }
  }, [isAdmin, editMode]);

  const loadProducts = async () => {
    try {
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const calculateTotal = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.unitPrice || 0) * Number(item.quantity || 0)), 0);
    const taxRate = (companySettings?.taxRate || 17) / 100;
    const tax = subtotal * taxRate;
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleSave = async () => {
    if (!editableOrder) return;

    try {
      setSaving(true);
      const { total } = calculateTotal(editableOrder.items);
      
      const updatedOrder = await updateOrder(editableOrder.id, {
        customerName: editableOrder.customerName,
        items: editableOrder.items,
        total: total
      });

      setEditMode(false);
      onUpdate(updatedOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('שגיאה בשמירת ההזמנה');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
    setEditableOrder({
      ...order,
      customerName: order.customerName || order.customer_name || '',
      items: items
    });
    setEditMode(false);
  };

  const handleQuantityChange = (index, delta) => {
    setEditableOrder(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        quantity: Math.max(1, Number(newItems[index].quantity || 0) + delta)
      };
      return { ...prev, items: newItems };
    });
  };

  const handlePriceChange = (index, newPrice) => {
    setEditableOrder(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        unitPrice: Number(newPrice) || 0
      };
      return { ...prev, items: newItems };
    });
  };

  const handleRemoveItem = (index) => {
    setEditableOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;

    const product = products.find(p => p.ref === selectedProduct);
    if (!product) return;

    const newItem = {
      ref: product.ref,
      productName: product.productName,
      productName2: product.productName2,
      size: product.size,
      unitPrice: Number(customPrice) || Number(product.unitPrice) || 0,
      quantity: Number(customQuantity) || 1
    };

    setEditableOrder(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Reset form
    setSelectedProduct('');
    setCustomPrice('');
    setCustomQuantity(1);
    setAddItemDialog(false);
  };

  const handleRevive = () => {
    if (onReviveOrder) {
      onReviveOrder(editableOrder);
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!editableOrder) return null;

  const { subtotal, tax, total } = calculateTotal(editableOrder.items);

  return (
    <Box>
      {/* Header */}
      <Paper elevation={3} sx={{ mb: 3, p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            הזמנה #{editableOrder.id}
          </Typography>
          
          <Stack direction="row" spacing={2}>
            {!editMode && isAdmin && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    console.log('Edit button clicked, setting edit mode to true');
                    setEditMode(true);
                  }}
                >
                  עריכה
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<RestoreIcon />}
                  onClick={handleRevive}
                >
                  החייאה
                </Button>
              </>
            )}
            
            {editMode && (
              <>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'שומר...' : 'שמור'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  ביטול
                </Button>
              </>
            )}
            
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              הדפס
            </Button>
          </Stack>
        </Stack>

        {/* Order Info Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                פרטי לקוח
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    שם לקוח:
                  </Typography>
                  {editMode ? (
                    <TextField
                      size="small"
                      value={editableOrder.customerName}
                      onChange={(e) => setEditableOrder(prev => ({ ...prev, customerName: e.target.value }))}
                      sx={{ width: 200 }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {editableOrder.customerName || 'אורח'}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    סוג לקוח:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    רגיל
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                פרטי הזמנה
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    מספר הזמנה:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    #{new Date().getFullYear()}-{String(editableOrder.id).padStart(4, '0')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    תאריך:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {new Date(order.created_at).toLocaleDateString('he-IL')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    סטטוס:
                  </Typography>
                  <Chip label="הוגשה" size="small" color="success" />
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Table */}
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              פירוט מוצרים
            </Typography>
            {editMode && isAdmin && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setAddItemDialog(true)}
              >
                הוסף פריט
              </Button>
            )}
          </Stack>
        </Box>

        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>מק"ט</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>שם מוצר</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>גודל</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>כמות</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>מחיר יחידה</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>סה"כ</TableCell>
              {editMode && <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>פעולות</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {editableOrder.items.map((item, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(even)': { bgcolor: 'grey.50' } }}>
                <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                  {item.ref}
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.productName || item.productName2}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {item.size || '-'}
                </TableCell>
                <TableCell align="right">
                  {editMode ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleQuantityChange(index, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 700 }}>
                        {item.quantity}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleQuantityChange(index, 1)}
                      >
                        <AddIcon />
                      </IconButton>
                    </Stack>
                  ) : (
                    <Typography sx={{ fontWeight: 700, color: 'error.main', textAlign: 'center' }}>
                      {item.quantity}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  {editMode && isAdmin ? (
                    <TextField
                      size="small"
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => {
                        console.log('Price change:', index, e.target.value, 'editMode:', editMode, 'isAdmin:', isAdmin);
                        handlePriceChange(index, e.target.value);
                      }}
                      sx={{ width: 100 }}
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                  ) : (
                    <Typography sx={{ fontWeight: 600 }}>
                      {formatCurrency(item.unitPrice)}
                      {/* Debug info */}
                      <Typography variant="caption" sx={{ display: 'block', color: 'red', fontSize: '10px' }}>
                        Debug: editMode={editMode ? 'true' : 'false'}, isAdmin={isAdmin ? 'true' : 'false'}
                      </Typography>
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontWeight: 700 }}>
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </Typography>
                </TableCell>
                {editMode && (
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Summary */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container justifyContent="flex-end">
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              border: '1px solid', 
              borderColor: 'primary.main', 
              borderRadius: 1, 
              overflow: 'hidden' 
            }}>
              <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  סיכום הזמנה
                </Typography>
              </Box>
              
              <Stack spacing={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>סכום ביניים:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatCurrency(subtotal)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'warning.light' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>מע"מ ({companySettings?.taxRate || 17}%):</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatCurrency(tax)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'primary.main', color: 'white' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>סה"כ לתשלום:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatCurrency(total)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Add Item Dialog */}
      <Dialog open={addItemDialog} onClose={() => setAddItemDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>הוסף פריט חדש</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>בחר מוצר</InputLabel>
              <Select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                label="בחר מוצר"
              >
                {products.map((product) => (
                  <MenuItem key={product.ref} value={product.ref}>
                    {product.productName} (#{product.ref})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="מחיר מותאם אישית (אופציונלי)"
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              helperText="השאר ריק לשימוש במחיר המקורי"
            />
            
            <TextField
              label="כמות"
              type="number"
              value={customQuantity}
              onChange={(e) => setCustomQuantity(Number(e.target.value) || 1)}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddItemDialog(false)}>ביטול</Button>
          <Button variant="contained" onClick={handleAddItem} disabled={!selectedProduct}>
            הוסף
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetails;
