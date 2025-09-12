import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createOrder, getOrderById } from '../../api/orders';
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
  useMediaQuery,
  Chip,
  TextField,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Fade,
  Slide,
  Zoom
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
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Person as PersonIcon,
  Add as AddIcon,
  LocalMall as ShoppingBagIcon,
  CreditCard as PaymentIcon,
  Timeline as TrendingIcon
} from '@mui/icons-material';
import BazaarButton from '../bazaar/BazaarButton';
import { DashboardCard, OrderCard } from '../bazaar/BazaarCard';
import CartItem from '../CartItem';
import OrderCartItem from './OrderCartItem';
import OrderSummary from './OrderSummary';
import '../../styles/print.css';

const OrderForm = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, addToCart, updateItemPrice } = useCart();
  const { settings: companySettings } = useCompany();
  const { isAdmin } = useAuth();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  const printRef = useRef(null);

  // const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);

  // Revive order functionality
  const reviveOrder = useCallback(async (orderId) => {
    try {
      const orderData = await getOrderById(orderId);
      
      if (!orderData) {
        throw new Error('Order not found');
      }

      // Clear current cart first
      clearCart();
      
      // Add order items back to cart
      if (orderData.items && orderData.items.length > 0) {
        orderData.items.forEach(item => {
          addToCart({
            ref: item.ref,
            productName: item.productName,
            productName2: item.productName2,
            size: item.size,
            unitPrice: item.unitPrice
          }, item.quantity);
        });
        
        // Set revived order ID for reference
        setCustomerName(orderData.customerName || '');
        
        setSnackbar({
          open: true,
          message: `הזמנה #${orderData.orderId} הוחזרה לעריכה`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error reviving order:', error);
      setSnackbar({
        open: true,
        message: 'שגיאה בטעינת ההזמנה',
        severity: 'error'
      });
    }
  }, [clearCart, addToCart]);

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
            <BazaarButton 
              onClick={() => window.history.back()}
              sx={{ px: 4, py: 1.5 }}
            >
              חזור לקטלוג
            </BazaarButton>
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
            <BazaarButton
              onClick={() => setOrderSummary(null)}
              variant="outlined"
              sx={{ minWidth: 150 }}
            >
              הזמנה חדשה
            </BazaarButton>
            <BazaarButton
              onClick={() => window.print()}
              startIcon={<PrintIcon />}
              sx={{ minWidth: 150 }}
            >
              הדפס הזמנה
            </BazaarButton>
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