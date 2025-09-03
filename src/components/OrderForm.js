import React, { useState, useCallback, useMemo, useRef } from 'react';
import { createOrder, getOrderById } from '../api/orders';
import { useCart } from '../context/CartContext';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Snackbar,
  Divider,
  Grid,
  Stack,
  Container,
  useTheme,
  useMediaQuery,
  Chip,
  List,
  ListItem,
  ListItemText,
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
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import CartItem from './CartItem';

const OrderForm = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);
  const summaryRef = useRef(null);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  }, [cart]);

  const formatCurrency = useCallback((amount) => {
    try {
      return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 2 }).format(amount);
    } catch (_) {
      return `₪${amount.toFixed(2)}`;
    }
  }, []);

  const tax = useMemo(() => {
    return subtotal * 0.17; // 17% tax
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  const handleCheckout = useCallback(async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('=== CHECKOUT DEBUG ===');
      console.log('Cart at checkout:', cart);
      console.log('Cart length:', cart.length);
      if (cart.length > 0) {
        console.log('First cart item:', cart[0]);
        console.log('First cart item keys:', Object.keys(cart[0]));
      }
    }
    
    const finalCustomerName = (customerName && customerName.trim().length >= 2) ? customerName.trim() : 'ללא שם';

    if (cart.length === 0) {
      setSnackbar({ open: true, message: 'העגלה ריקה', severity: 'error' });
      return;
    }

    // Validate cart items - be more lenient
    const invalidItems = cart.filter(item => {
      // Only check for absolutely essential fields
      const isValid = item.ref && item.quantity && item.quantity >= 1;
      if (!isValid) {
        console.log('Invalid cart item found:', {
          ref: item.ref,
          productName: item.productName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          item: item
        });
      }
      return !isValid;
    });
    
    if (invalidItems.length > 0) {
      console.log('Invalid items in cart:', invalidItems);
      setSnackbar({ open: true, message: `יש ${invalidItems.length} פריטים לא תקינים בעגלה`, severity: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);

      // Ensure cart items have all required fields
      const validatedItems = cart.map(item => ({
        ref: item.ref || '',
        productName: item.productName || '',
        productName2: item.productName2 || '',
        line: item.line || '',
        notice: item.notice || '',
        size: item.size || '',
        unitPrice: parseFloat(item.unitPrice) || 0,
        productType: item.productType || '',
        mainPic: item.mainPic || '',
        quantity: parseInt(item.quantity) || 1
      }));

      const orderData = {
        customerName: finalCustomerName,
        total: parseFloat(total.toFixed(2)),
        items: validatedItems
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('=== ORDER SUBMISSION DEBUG ===');
        console.log('Customer name:', customerName.trim());
        console.log('Customer name length:', customerName.trim().length);
        console.log('Total calculated:', total);
        console.log('Total formatted:', parseFloat(total.toFixed(2)));
        console.log('Cart length:', validatedItems.length);
        console.log('Cart items:', validatedItems);
        console.log('First cart item:', validatedItems[0]);
        console.log('Order data to send:', orderData);
        console.log('JSON stringified length:', JSON.stringify(orderData).length);
        console.log('=== END DEBUG ===');
      }

      const result = await createOrder(orderData);
      if (result && result.id) {
        try {
          // optional verification read-back
          await getOrderById(result.id);
        } catch (_) {}
        setSnackbar({
          open: true,
          message: `ההזמנה מספר #${result.id} הוגשה בהצלחה!`,
          severity: 'success'
        });
        // Capture a snapshot for the summary page
        setOrderSummary({ 
          id: result.id, 
          customerName: finalCustomerName,
          items: validatedItems,
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          total: parseFloat(total.toFixed(2))
        });
        setCustomerName('');
        clearCart();
      } else {
        throw new Error('הזמנה לא התקבלה כראוי');
      }
    } catch (error) {
      console.error('Order submission error:', error);

      // Provide more specific error messages
      let errorMessage = `שגיאה בהגשת ההזמנה: ${error.message}`;

      if (error.message.includes('customerName') || error.message.includes('column')) {
        errorMessage = 'שגיאה במסד הנתונים: אנא בדוק שהטבלה "orders" קיימת עם העמודות הנכונות';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'שגיאת רשת: אנא בדוק את החיבור לאינטרנט ונסה שוב';
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [cart, customerName, total, clearCart, subtotal, tax]);

  if (!orderSummary && cart.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', direction: 'rtl' }}>
        <CartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
            העגלה שלך ריקה
          </Typography>
          <Typography variant="body1" color="text.secondary">
            הוסף כמה מוצרים מהקטלוג כדי להתחיל
          </Typography>
      </Box>
    );
  }

  return (
    <>
    <Container maxWidth="lg" sx={{ direction: 'rtl', py: 2 }}>
      {/* Post submit full-width summary page */}
      {orderSummary && (
        <Paper ref={summaryRef} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant={isSmall ? 'h6' : 'h5'} sx={{ fontWeight: 700 }}>
              סיכום הזמנה
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => window.print()}>הדפס / שמור כ-PDF</Button>
            </Stack>
          </Stack>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary">מספר הזמנה</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{orderSummary.id}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary">שם לקוח</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{orderSummary.customerName}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary">סה"כ לתשלום</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatCurrency(orderSummary.total)}</Typography>
            </Grid>
          </Grid>

          <Table size={isSmall ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell align="right">מקט</TableCell>
                <TableCell align="right">מוצר</TableCell>
                <TableCell align="right">גודל</TableCell>
                <TableCell align="right">כמות</TableCell>
                <TableCell align="right">מחיר יחידה</TableCell>
                <TableCell align="right">סה"כ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderSummary.items.map((it) => (
                <TableRow key={`${it.ref}-${it.size || ''}`}>
                  <TableCell align="right">{it.ref}</TableCell>
                  <TableCell align="right">{it.productName || it.productName2}</TableCell>
                  <TableCell align="right">{it.size || '-'}</TableCell>
                  <TableCell align="right">{it.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(it.unitPrice)}</TableCell>
                  <TableCell align="right">{formatCurrency(it.unitPrice * it.quantity)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} />
                <TableCell align="right" sx={{ fontWeight: 600 }}>סכום ביניים</TableCell>
                <TableCell align="right">{formatCurrency(orderSummary.subtotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} />
                <TableCell align="right" sx={{ color: 'text.secondary' }}>מס (17%)</TableCell>
                <TableCell align="right">{formatCurrency(orderSummary.tax)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} />
                <TableCell align="right" sx={{ fontWeight: 700 }}>סה"כ לתשלום</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatCurrency(orderSummary.total)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      )}
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <CartIcon color="primary" sx={{ fontSize: isSmall ? 28 : 32 }} />
        <Typography variant={isSmall ? "h5" : "h4"} sx={{ fontWeight: 600 }}>
          סיכום הזמנה
        </Typography>
        <Chip 
          label={`${cart.length} מוצרים`} 
          color="primary" 
          size={isSmall ? "small" : "medium"}
        />
      </Stack>

      {/* Cart Items - Mobile First Design */}
      {!orderSummary && (
      <Grid container spacing={isSmall ? 2 : 3}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={isSmall ? 1 : 2}>
            {cart.map((item) => (
              <CartItem
                key={item.ref}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </Stack>
        </Grid>

        {/* Order Summary Sidebar */}
        <Grid item xs={12} lg={4}>
          <Paper 
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              position: { lg: 'sticky' },
              top: { lg: 20 },
              p: isSmall ? 2 : 3
            }}
          >
            <Stack spacing={2}>
              {/* Header */}
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <ReceiptIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  סיכום הזמנה
                </Typography>
              </Stack>

              {/* Order Details List */}
              <List disablePadding>
                <ListItem disableGutters>
                  <ListItemText primary="מוצרים בעגלה:" />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {cart.length}
                  </Typography>
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="כמות כוללת:" />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Typography>
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary="סכום ביניים:" />
                  <Typography variant="body1" sx={{ fontWeight: 500 }} aria-label="סכום ביניים">
                    {formatCurrency(subtotal)}
                  </Typography>
                </ListItem>
                <ListItem disableGutters sx={{ color: 'text.secondary' }}>
                  <ListItemText primary="מס (17%):" />
                  <Typography variant="body2" aria-label="מס">
                    {formatCurrency(tax)}
                  </Typography>
                </ListItem>
              </List>

              <Divider />

              {/* Total */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    סה"כ לתשלום:
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color="primary.main"
                    sx={{ fontWeight: 700 }}
                    aria-label={'סה"כ לתשלום'}
                  >
                    {formatCurrency(total)}
                  </Typography>
                </Stack>
              </Box>

              {/* Action Buttons */}
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<CheckIcon />}
                  onClick={handleCheckout}
                  sx={{ 
                    py: 1.25,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'שולח...' : 'הגש הזמנה'}
                </Button>

                <Button
                  variant="text"
                  size="medium"
                  fullWidth
                  onClick={clearCart}
                  color="error"
                >
                  נקה עגלה
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      )}
    </Container>

    {/* Removed checkout dialog in favor of inline flow */}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OrderForm;
