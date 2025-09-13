/**
 * OrderForm Component
 * 
 * Main order management interface that allows users to:
 * - View cart items in a compact, table-like format
 * - Edit quantities and remove items
 * - Enter customer information 
 * - Submit orders with calculated totals (including tax)
 * - Admin users can edit prices and add custom items
 * 
 * Features:
 * - Real-time price loading from secure Supabase RLS table
 * - Role-based admin controls (price editing, custom items)
 * - Responsive design (mobile/desktop layouts)
 * - Print-friendly order confirmation
 * - Environment-protected connection to pricing API
 * 
 * Admin Features (when user.user_role = 'admin'):
 * - Price editing in cart items
 * - Add custom products with custom pricing
 * - Edit mode toggle for price modifications
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createOrder } from '../../api/orders';
import { getPrices } from '../../api/prices';
import { getProducts } from '../../api/products';
import { useCart } from '../../context/CartContext';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Snackbar,
  Divider,
  Grid,
  Stack,
  useTheme,
  TextField,
  Card,
  CardContent,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  CheckCircle as CheckIcon,
  Print as PrintIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import StyledButton from '../ui/StyledButton';
import OrderCartItem from './OrderCartItem';
import OrderSummary from './OrderSummary';
import OrderConfirmation from './OrderConfirmation';
import AdminAddItemDialog from './AdminAddItemDialog';
import '../../styles/print.css';

const OrderForm = () => {
  // === CART & CONTEXT HOOKS ===
  const { cart, removeFromCart, updateQuantity, clearCart, addToCart, updateItemPrice } = useCart();
  const { settings: companySettings } = useCompany();
  const { isAdmin } = useAuth(); // Determines admin UI visibility
  const theme = useTheme();
  const printRef = useRef(null); // For print functionality

  // === CORE ORDER STATE ===
  const [canViewPrices, setCanViewPrices] = useState(false); // RLS pricing access
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [customerName, setCustomerName] = useState(''); // Order customer info
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double submissions
  const [orderSummary, setOrderSummary] = useState(null); // Post-submission order data
  
  // === ADMIN FEATURES STATE ===
  // Only used when isAdmin = true
  const [editMode, setEditMode] = useState(false); // Toggle price editing mode
  const [products, setProducts] = useState([]); // Product catalog for custom items
  const [addItemDialog, setAddItemDialog] = useState(false); // Custom item dialog state
  // Load unit prices for items in cart from secure table (RLS-protected)
  useEffect(() => {
    const loadCartPrices = async () => {
      if (!cart || cart.length === 0) {
        setCanViewPrices(false);
        return;
      }
      const refs = Array.from(new Set(cart.map(i => String(i.ref)))).filter(Boolean);
      if (refs.length === 0) return;
      const pricesMap = await getPrices(refs);
      const hasAccess = pricesMap && Object.keys(pricesMap).length > 0;
      setCanViewPrices(hasAccess);
      if (hasAccess) {
        refs.forEach(ref => {
          const p = pricesMap[ref];
          if (p && typeof p.unitPrice === 'number') {
            updateItemPrice(ref, p.unitPrice);
          }
        });
      }
    };
    loadCartPrices();
  }, [cart, updateItemPrice]);

  // Load products for admin features
  useEffect(() => {
    if (isAdmin && editMode) {
      loadProducts();
    }
  }, [isAdmin, editMode]);

  /**
   * Load products for admin custom item selection
   * Fetches full product catalog when admin enters edit mode
   */
  const loadProducts = async () => {
    try {
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  /**
   * Admin function: Handle price change for cart items
   * Updates the unit price of a specific cart item when admin edits price
   * 
   * @param {string} itemRef - Product reference ID
   * @param {number} newPrice - New unit price to set
   */
  const handlePriceChange = (itemRef, newPrice) => {
    updateItemPrice(itemRef, Number(newPrice) || 0);
  };

  /**
   * Admin function: Add custom item to cart with custom pricing
   * Handles items from AdminAddItemDialog component
   * 
   * @param {Object} customItem - Pre-formatted item from dialog
   */
  const handleAddCustomItem = (customItem) => {
    addToCart(customItem, customItem.quantity);
    setAddItemDialog(false);
  };


  // Revive order functionality (currently unused but available for future use)
  // const reviveOrder = useCallback(async (orderId) => {
  //   try {
  //     const orderData = await getOrderById(orderId);
  //     
  //     if (!orderData) {
  //       throw new Error('Order not found');
  //     }
  //
  //     // Clear current cart first
  //     clearCart();
  //     
  //     // Add order items back to cart
  //     if (orderData.items && orderData.items.length > 0) {
  //       orderData.items.forEach(item => {
  //         addToCart({
  //           ref: item.ref,
  //           productName: item.productName,
  //           productName2: item.productName2,
  //           size: item.size,
  //           unitPrice: item.unitPrice
  //         }, item.quantity);
  //       });
  //       
  //       // Set revived order ID for reference
  //       setCustomerName(orderData.customerName || '');
  //       
  //       setSnackbar({
  //         open: true,
  //         message: `הזמנה #${orderData.orderId} הוחזרה לעריכה`,
  //         severity: 'success'
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error reviving order:', error);
  //     setSnackbar({
  //       open: true,
  //       message: 'שגיאה בטעינת ההזמנה',
  //       severity: 'error'
  //     });
  //   }
  // }, [clearCart, addToCart]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }, [cart]);

  const tax = useMemo(() => {
    const taxRate = (companySettings?.taxRate || 17) / 100;
    return subtotal * taxRate;
  }, [subtotal, companySettings?.taxRate]);

  const total = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  const handleSubmitOrder = useCallback(async () => {
    if (cart.length === 0) {
      setSnackbar({
        open: true,
        message: 'לא ניתן להגיש הזמנה ריקה',
        severity: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const finalCustomerName = customerName.trim() || 'לקוח אנונימי';
      
      // Prepare order items with validation
      const validatedItems = cart.map(item => ({
        ref: item.ref || '',
        productName: item.productName || '',
        productName2: item.productName2 || '',
        size: item.size || '',
        unitPrice: Number(item.unitPrice) || 0,
        quantity: Number(item.quantity) || 1,
        totalPrice: Number(item.unitPrice) * Number(item.quantity)
      }));

      const orderData = {
        customerName: finalCustomerName,
        items: validatedItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        taxRate: companySettings?.taxRate || 17,
        orderDate: new Date().toISOString(),
        status: 'pending'
      };

      console.log('🚀 Submitting order:', orderData);
      
      const result = await createOrder(orderData);
      
      if (result && result.id) {
        console.log('✅ Order created successfully:', result);
        
        setSnackbar({
          open: true,
          message: `ההזמנה מספר #${result.id} הוגשה בהצלחה!`,
          severity: 'success'
        });
        // Capture a snapshot for the summary page
        setOrderSummary({ 
          orderId: result.id,
          customerName: finalCustomerName,
          items: validatedItems,
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          total: parseFloat(total.toFixed(2))
        });
        setCustomerName('');
        clearCart();
      } else {
        throw new Error('Failed to create order - no ID returned');
      }
    } catch (error) {
      console.error('❌ Order submission error:', error);
      
      let errorMessage = 'שגיאה בהגשת ההזמנה';
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'החיבור איטי מדי - אנא נסה שוב';
      } else if (error.message?.includes('network')) {
        errorMessage = 'בעיית רשת - בדוק את החיבור לאינטרנט';
      } else if (error.message) {
        errorMessage = `שגיאה: ${error.message}`;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [cart, customerName, subtotal, tax, total, companySettings?.taxRate, clearCart]);

  // Format currency helper
  const formatCurrency = useCallback((amount) => {
    return `₪${Number(amount || 0).toFixed(2)}`;
  }, []);

  // Check for empty cart
  if (cart.length === 0 && !orderSummary) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 4
      }}>
        <Fade in timeout={600}>
          <Box>
            <CartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
              העגלה ריקה
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              לא נמצאו מוצרים בעגלת הקניות
            </Typography>
              <StyledButton
              onClick={() => window.history.back()}
              sx={{ px: 4, py: 1.5 }}
            >
              חזור לקטלוג
              </StyledButton>
          </Box>
        </Fade>
      </Box>
    );
  }

  // Show order summary if order was submitted
  if (orderSummary) {
    return (
      <Box sx={{ maxWidth: '800px', mx: 'auto', p: 3 }}>
        <Paper 
          ref={printRef}
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'success.dark' }}>
              הזמנה הוגשה בהצלחה!
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              מספר הזמנה: #{orderSummary.orderId}
            </Typography>
          </Box>

          {/* Order Details */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                פרטי ההזמנה
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ color: '#7D879C', mb: 0.5 }}>לקוח:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    {orderSummary.customerName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ color: '#7D879C', mb: 0.5 }}>תאריך:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    {new Date().toLocaleDateString('he-IL')}
                  </Typography>
                </Grid>
              </Grid>

              {/* Order Items Table */}
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3, mb: 2 }}>
                פריטים שהוזמנו
              </Typography>
              
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#2B3445' }}>מוצר</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#2B3445' }}>גודל</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#2B3445' }}>מחיר יחידה</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#2B3445' }}>כמות</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#2B3445' }}>סה"כ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderSummary.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#2B3445' }}>
                            {item.productName}
                          </Typography>
                          {item.productName2 && (
                            <Typography variant="body2" sx={{ color: '#7D879C' }}>
                              {item.productName2}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{item.size || '-'}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{formatCurrency(item.unitPrice)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{item.quantity}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(item.totalPrice)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Order Summary */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid #E3E9EF' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="body2" sx={{ color: '#7D879C' }}>
                      תודה על ההזמנה! נציגנו יצור איתך קשר בקרוב.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">סכום ביניים:</Typography>
                        <Typography variant="body2">{formatCurrency(orderSummary.subtotal)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">מע"מ:</Typography>
                        <Typography variant="body2">{formatCurrency(orderSummary.tax)}</Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>סה"כ:</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {formatCurrency(orderSummary.total)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <StyledButton
              onClick={() => setOrderSummary(null)}
              variant="outlined"
              sx={{ minWidth: 150 }}
            >
              הזמנה חדשה
              </StyledButton>
              <StyledButton
              onClick={() => window.print()}
              startIcon={<PrintIcon />}
              sx={{ minWidth: 150 }}
            >
              הדפס הזמנה
              </StyledButton>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', p: { xs: 2, md: 3 } }}>

      {/* Two Column Layout: Items Column + Order Summary Column */}
      {!orderSummary && (
      <Grid container spacing={3} sx={{ mx: 0, width: '100%' }}>
        {/* Items Column */}
        <Grid item xs={12} lg={8}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            פריטים בעגלה
          </Typography>
          
          {/* Table Header */}
          <Box
            sx={{
              p: 1,
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '4px 4px 0 0',
              mb: 0
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minHeight: 32 }}>
              <Box sx={{ minWidth: 80 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  מק"ט
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  מוצר
                </Typography>
              </Box>
              <Box sx={{ minWidth: 60, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  מחיר יחידה
                </Typography>
              </Box>
              <Box sx={{ minWidth: 100, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  כמות
                </Typography>
              </Box>
              <Box sx={{ minWidth: 70, textAlign: 'right' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  סה"כ
                </Typography>
              </Box>
              <Box sx={{ minWidth: 32 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  מחק
                </Typography>
              </Box>
              {isAdmin && (
                <Box sx={{ minWidth: 100 }}>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => setEditMode(!editMode)}
                      color={editMode ? "primary" : "default"}
                      title={editMode ? "סיום עריכה" : "עריכת מחירים"}
                    >
                      {editMode ? <SaveIcon /> : <EditIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setAddItemDialog(true)}
                      color="primary"
                      title="הוסף פריט מותאם"
                    >
                      <AddIcon />
                    </IconButton>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Items List */}
          <Stack spacing={0}>
            {cart.map((item, index) => (
              <Box
                key={item.ref}
                sx={{
                  '& > div': {
                    borderRadius: 0,
                    borderTop: index === 0 ? 'none' : '1px solid',
                    borderTopColor: 'divider'
                  },
                  '&:last-child > div': {
                    borderRadius: '0 0 4px 4px'
                  }
                }}
              >
                <OrderCartItem
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                  onUpdatePrice={updateItemPrice}
                  isAdmin={isAdmin}
                  editMode={editMode}
                  onPriceChange={handlePriceChange}
                />
              </Box>
            ))}
          </Stack>
        </Grid>

        {/* OS Column (Order Summary) */}
        <OrderSummary
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          cart={cart}
          subtotal={subtotal}
          tax={tax}
          total={total}
          formatCurrency={formatCurrency}
          companySettings={companySettings}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitOrder}
        />
      </Grid>
      )}

      {/* Admin: Add Custom Item Dialog */}
      {/* Add Custom Item Dialog - Admin Only */}
      {isAdmin && (
        <AdminAddItemDialog
          open={addItemDialog}
          onClose={() => setAddItemDialog(false)}
          products={products}
          onAddItem={handleAddCustomItem}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderForm;