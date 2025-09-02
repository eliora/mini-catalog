import React, { useState, useMemo } from 'react';
import { createOrder } from '../api/orders';
import { useCart } from '../context/CartContext';
import { useForm } from 'react-hook-form';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Divider,
  Grid,
  Card,
  CardContent,
  Stack,
  Container,
  useTheme,
  useMediaQuery,
  Chip,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  CheckCircle as CheckIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import CartItem from './CartItem';

const OrderForm = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const formContext = useForm({
    defaultValues: {
      customerName: ''
    }
  });

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  }, [cart]);

  const tax = useMemo(() => {
    return subtotal * 0.17; // 17% tax
  }, [subtotal]);

  const total = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  const handleCheckout = async (data) => {
    console.log('=== CHECKOUT DEBUG ===');
    console.log('Cart at checkout:', cart);
    console.log('Cart length:', cart.length);
    if (cart.length > 0) {
      console.log('First cart item:', cart[0]);
      console.log('First cart item keys:', Object.keys(cart[0]));
    }
    
    const customerName = data.customerName;
    
    if (!customerName || !customerName.trim()) {
      setSnackbar({ open: true, message: 'אנא הזן שם לקוח', severity: 'error' });
      return;
    }

    if (customerName.trim().length < 2) {
      setSnackbar({ open: true, message: 'שם לקוח חייב להיות לפחות 2 תווים', severity: 'error' });
      return;
    }

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
        customerName: customerName.trim(),
        total: parseFloat(total.toFixed(2)),
        items: validatedItems
      };
      
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

      const result = await createOrder(orderData);
      if (result && result.id) {
        setSnackbar({ 
          open: true, 
          message: `ההזמנה מספר #${result.id} הוגשה בהצלחה!`,
          severity: 'success' 
        });
        setCheckoutDialog(false);
        formContext.reset();
        // Clear cart after successful order
        clearCart();
      } else {
        setSnackbar({ open: true, message: 'שגיאה בשליחת ההזמנה', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'שגיאה בהגשת הזמנה', severity: 'error' });
    }
  };

  if (cart.length === 0) {
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
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <CartIcon color="primary" sx={{ fontSize: isSmall ? 28 : 32 }} />
        <Typography variant={isSmall ? "h5" : "h4"} sx={{ fontWeight: 600 }}>
          עגלת קניות
        </Typography>
        <Chip 
          label={`${cart.length} מוצרים`} 
          color="primary" 
          size={isSmall ? "small" : "medium"}
        />
      </Stack>

      {/* Cart Items - Mobile First Design */}
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
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    ${subtotal.toFixed(2)}
                  </Typography>
                </ListItem>
                <ListItem disableGutters sx={{ color: 'text.secondary' }}>
                  <ListItemText primary="מס (17%):" />
                  <Typography variant="body2">
                    ${tax.toFixed(2)}
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
                  >
                    ${total.toFixed(2)}
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
                  onClick={() => setCheckoutDialog(true)}
                  sx={{ 
                    py: 1.25,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  המשך לתשלום
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
    </Container>

    {/* Checkout Dialog */}
      <Dialog 
        open={checkoutDialog} 
        onClose={() => setCheckoutDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isSmall}
      >
        <DialogTitle sx={{ textAlign: 'right', pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
            <CheckIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              השלם את ההזמנה שלך
            </Typography>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ px: isSmall ? 2 : 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Customer Details */}
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'right', fontWeight: 600 }}>
                פרטי לקוח
              </Typography>
              
              <FormContainer
                formContext={formContext}
                onSuccess={handleCheckout}
                id="checkout-form"
              >
                <TextFieldElement
                  name="customerName"
                  label="שם לקוח מלא"
                  required
                  fullWidth
                  placeholder="הזן שם לקוח מלא"
                  size={isSmall ? "small" : "medium"}
                  validation={{
                    required: 'שם לקוח הוא שדה חובה',
                    minLength: {
                      value: 2,
                      message: 'שם לקוח חייב להיות לפחות 2 תווים'
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </FormContainer>
            </Paper>

            {/* Order Summary */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'right', fontWeight: 600 }}>
                סיכום הזמנה סופי
              </Typography>
              
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1">מוצרים:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {cart.length}
                  </Typography>
                </Stack>
                
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1">סכום ביניים:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ${subtotal.toFixed(2)}
                  </Typography>
                </Stack>
                
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1">מס (17%):</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ${tax.toFixed(2)}
                  </Typography>
                </Stack>
                
                <Divider sx={{ my: 1 }} />
                
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    סה"כ לתשלום:
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                    ${total.toFixed(2)}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>

            {/* Terms */}
            <Alert severity="info" sx={{ textAlign: 'right' }}>
              <Typography variant="body2">
                בלחיצה על "הגש הזמנה", אתה מאשר שכל המידע נכון ומסכים לתנאי השירות.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: isSmall ? 2 : 3, gap: 1 }}>
          <Button 
            onClick={() => setCheckoutDialog(false)}
            variant="outlined"
            size={isSmall ? "medium" : "large"}
            sx={{ minWidth: 100 }}
          >
            ביטול
          </Button>
          
          <Button
            onClick={formContext.handleSubmit(handleCheckout)}
            variant="contained"
            size={isSmall ? "medium" : "large"}
            startIcon={<CheckIcon />}
            sx={{ 
              minWidth: 140,
              fontWeight: 600
            }}
          >
            הגש הזמנה
          </Button>
        </DialogActions>
      </Dialog>

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
