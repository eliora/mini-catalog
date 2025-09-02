import React, { useState } from 'react';
import { createOrder } from '../api/orders';
import { useCart } from '../context/CartContext';
import { useForm } from 'react-hook-form';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  CardActions,
  Chip
} from '@mui/material';
import {
  Remove as RemoveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  CheckCircle as CheckIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';

const OrderForm = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const formContext = useForm({
    defaultValues: {
      customerName: ''
    }
  });

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.17; // 17% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

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
        total: parseFloat(calculateTotal().toFixed(2)),
        items: validatedItems
      };
      
      console.log('=== ORDER SUBMISSION DEBUG ===');
      console.log('Customer name:', customerName.trim());
      console.log('Customer name length:', customerName.trim().length);
      console.log('Total calculated:', calculateTotal());
      console.log('Total formatted:', parseFloat(calculateTotal().toFixed(2)));
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
              <Card key={item.ref} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: isSmall ? 2 : 3 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    {/* Product Image Placeholder */}
                    <Avatar
                      sx={{
                        width: isSmall ? 60 : 80,
                        height: isSmall ? 60 : 80,
                        bgcolor: 'primary.light',
                        fontSize: isSmall ? '1rem' : '1.2rem'
                      }}
                    >
                      {item.productName?.charAt(0)}
                    </Avatar>

                    {/* Product Details */}
                    <Stack spacing={1} sx={{ flex: 1, textAlign: 'right' }}>
                      <Typography 
                        variant={isSmall ? "subtitle1" : "h6"} 
                        sx={{ fontWeight: 600, lineHeight: 1.2 }}
                      >
                        {item.productName}
                      </Typography>
                      
                      {item.productName2 && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontStyle: 'italic' }}
                        >
                          {item.productName2}
                        </Typography>
                      )}

                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Chip 
                          label={`#${item.ref}`} 
                          size="small" 
                          variant="outlined" 
                        />
                        <Chip 
                          label={`$${item.unitPrice}`} 
                          size="small" 
                          color="primary"
                        />
                      </Stack>

                      {/* Quantity Controls */}
                      <Stack 
                        direction="row" 
                        alignItems="center" 
                        justifyContent="space-between"
                        sx={{ mt: 1 }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.ref, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            sx={{ 
                              border: '1px solid',
                              borderColor: 'divider',
                              width: 32,
                              height: 32
                            }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              minWidth: 40, 
                              textAlign: 'center',
                              fontWeight: 600
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.ref, item.quantity + 1)}
                            sx={{ 
                              border: '1px solid',
                              borderColor: 'divider',
                              width: 32,
                              height: 32
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Stack>

                        {/* Item Total and Delete */}
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography 
                            variant="h6" 
                            color="primary"
                            sx={{ fontWeight: 600 }}
                          >
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </Typography>
                          
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => removeFromCart(item.ref)}
                            sx={{ 
                              '&:hover': {
                                backgroundColor: 'error.main',
                                color: 'error.contrastText'
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>

        {/* Order Summary Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card 
            sx={{ 
              borderRadius: 2,
              position: { lg: 'sticky' },
              top: { lg: 20 }
            }}
          >
            <CardContent sx={{ p: isSmall ? 2 : 3 }}>
              <Stack spacing={2}>
                {/* Header */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ReceiptIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    סיכום הזמנה
                  </Typography>
                </Stack>

                <Divider />

                {/* Order Details */}
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body1">מוצרים בעגלה:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {cart.length}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body1">כמות כוללת:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body1">סכום ביניים:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      ${calculateSubtotal().toFixed(2)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body1">מס (17%):</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      ${calculateTax().toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider />

                {/* Total */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    סה"כ לתשלום:
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  >
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </Stack>

                <Divider />

                {/* Action Buttons */}
                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<CheckIcon />}
                    onClick={() => setCheckoutDialog(true)}
                    sx={{ 
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600
                    }}
                  >
                    המשך לתשלום
                  </Button>

                  <Button
                    variant="outlined"
                    size="medium"
                    fullWidth
                    onClick={clearCart}
                    color="error"
                  >
                    נקה עגלה
                  </Button>
                </Stack>

                {/* Shipping Info */}
                <Paper 
                  sx={{ 
                    p: 1.5, 
                    bgcolor: 'primary.light', 
                    color: 'primary.contrastText',
                    borderRadius: 1
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ShippingIcon fontSize="small" />
                    <Typography variant="body2">
                      משלוח חינם מעל $100
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
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
                    ${calculateSubtotal().toFixed(2)}
                  </Typography>
                </Stack>
                
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1">מס (17%):</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ${calculateTax().toFixed(2)}
                  </Typography>
                </Stack>
                
                <Divider sx={{ my: 1 }} />
                
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    סה"כ לתשלום:
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                    ${calculateTotal().toFixed(2)}
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
