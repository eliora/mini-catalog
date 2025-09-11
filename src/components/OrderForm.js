import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createOrder, getOrderById } from '../api/orders';
import { useCart } from '../context/CartContext';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';
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
import BazaarButton from './bazaar/BazaarButton';
import { DashboardCard, OrderCard } from './bazaar/BazaarCard';
import CartItem from './CartItem';
import '../styles/print.css';

const OrderForm = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, addToCart, updateItemPrice } = useCart();
  const { settings: companySettings } = useCompany();
  const { isAdmin } = useAuth();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [revivedOrderId, setRevivedOrderId] = useState(null); // Currently unused but kept for future order revival feature

  const summaryRef = useRef(null);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Handle revived orders from admin panel
  useEffect(() => {
    const handleReviveOrder = (event) => {
      const { orderData } = event.detail;
      if (orderData) {
        // Clear current cart
        clearCart();
        
        // Set customer name
        setCustomerName(orderData.customerName || '');
        
        // Add items to cart
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
        setRevivedOrderId(orderData.orderId);
        
        // Clear any existing order summary
        setOrderSummary(null);
        
        // Show success message
        setSnackbar({
          open: true,
          message: `הזמנה #${orderData.orderId} הוחזרה לעריכה`,
          severity: 'success'
        });
      }
    };

    window.addEventListener('orderRevive', handleReviveOrder);
    return () => {
      window.removeEventListener('orderRevive', handleReviveOrder);
    };
  }, [clearCart, addToCart]);

  const formatCurrency = useCallback((amount) => {
    return `₪${amount.toFixed(2)}`;
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }, [cart]);

  const tax = useMemo(() => {
    return subtotal * ((companySettings?.taxRate || 17) / 100);
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
      <Fade in timeout={800}>
        <Box 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#F6F9FC'
          }}
        >
          <Zoom in timeout={600} style={{ transitionDelay: '200ms' }}>
            <Box 
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1px solid #E3E9EF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
              }}
            >
              <ShoppingBagIcon sx={{ fontSize: 48, color: '#4E97FD' }} />
            </Box>
          </Zoom>
          <Slide direction="up" in timeout={600} style={{ transitionDelay: '400ms' }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2, 
                  color: '#2B3445',
                  fontSize: '1.75rem' 
                }}
              >
                העגלה שלך ריקה
              </Typography>
              <Typography 
                variant="body1"
                sx={{ 
                  maxWidth: 400, 
                  mx: 'auto', 
                  lineHeight: 1.6,
                  color: '#7D879C',
                  fontSize: '0.95rem'
                }}
              >
                גלה את המוצרים המדהימים שלנו והתחל בהזמנה חדשה
              </Typography>
            </Box>
          </Slide>
        </Box>
      </Fade>
    );
  }

  return (
    <Box sx={{ py: 2, px: { xs: 2, sm: 3 }, width: '100%', maxWidth: 'none', background: '#F6F9FC', minHeight: '100vh' }}>
      {/* Professional Invoice-Style Order Summary */}
      {orderSummary && (
        <Paper 
          ref={summaryRef} 
          elevation={0}
          data-print-area
          sx={{ 
            width: '100%',
            mb: 4,
            overflow: 'hidden',
            background: '#FFFFFF',
            border: '1px solid #E3E9EF',
            borderRadius: 3
          }}
        >
          {/* Compact Success Banner for Screen */}
          <Box sx={{ 
            bgcolor: '#33D067', 
            color: 'white', 
            p: 2,
            textAlign: 'center',
            '@media print': { display: 'none' }
          }}>
            <CheckIcon sx={{ fontSize: 24, mr: 1, verticalAlign: 'middle' }} />
            <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
              הזמנה הוגשה בהצלחה!
            </Typography>
          </Box>

          {/* Professional Invoice Content */}
          <Box sx={{ p: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              borderBottom: '2px solid #4E97FD',
              pb: 3,
              mb: 4
            }}>
              <Box sx={{ width: '40%' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#4E97FD', mb: 1 }}>
                  {companySettings?.companyName || 'קטלוג מוצרים'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7D879C', lineHeight: 1.4 }}>
                  {companySettings?.companyDescription || 'מערכת ניהול הזמנות'}
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700, 
                  color: '#2B3445',
                  fontSize: '2rem',
                  mb: 1
                }}>
                  הזמנה
                </Typography>
                <Chip 
                  label={`מספר: #${orderSummary.id}`}
                  sx={{ 
                    backgroundColor: '#4E97FD',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                />
              </Box>
            </Box>

            {/* Customer and Date Info */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: '#7D879C', mb: 0.5 }}>לקוח:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2B3445' }}>
                  {orderSummary.customerName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: '#7D879C', mb: 0.5 }}>תאריך:</Typography>
                <Typography variant="body1" sx={{ color: '#2B3445' }}>
                  {new Date().toLocaleDateString('he-IL')}
                </Typography>
              </Grid>
            </Grid>

            {/* Order Items Table */}
            <Table sx={{ mb: 4 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F6F9FC' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#2B3445' }}>מוצר</TableCell>
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
                        {item.size && (
                          <Typography variant="caption" sx={{ color: '#7D879C' }}>
                            מידה: {item.size}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#2B3445' }}>
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#2B3445' }}>
                      {item.quantity}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2B3445' }}>
                      {formatCurrency(item.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Order Totals */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ width: 300 }}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ color: '#7D879C' }}>סכום ביניים:</Typography>
                    <Typography variant="body1" sx={{ color: '#2B3445' }}>{formatCurrency(orderSummary.subtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ color: '#7D879C' }}>מע"מ ({companySettings?.taxRate || 17}%):</Typography>
                    <Typography variant="body1" sx={{ color: '#2B3445' }}>{formatCurrency(orderSummary.tax)}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2B3445' }}>סה"כ לתשלום:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#4E97FD' }}>{formatCurrency(orderSummary.total)}</Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Box>

          {/* Print Button */}
          <Box sx={{ p: 3, borderTop: '1px solid #E3E9EF', '@media print': { display: 'none' } }}>
            <BazaarButton
              onClick={handlePrint}
              startIcon={<PrintIcon />}
              variant="contained"
              color="primary"
              fullWidth
            >
              הדפס הזמנה
            </BazaarButton>
          </Box>
        </Paper>
      )}

      {/* Light Bazaar Pro Header */}
      {!orderSummary && (
        <Fade in timeout={600}>
          <Card 
            sx={{ 
              mb: 3, 
              background: '#FFFFFF',
              border: '1px solid #E3E9EF',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                {/* Main Title Section */}
                <Grid item xs={12} md={6}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box 
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: '#4E97FD',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(78, 151, 253, 0.24)'
                      }}
                    >
                      <ShoppingBagIcon sx={{ fontSize: 24, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700, 
                          color: '#2B3445',
                          mb: 0.5,
                          fontSize: '1.5rem'
                        }}
                      >
                        עגלת קניות
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#7D879C', fontSize: '0.9rem' }}>
                        סקירה ועריכה של המוצרים שנבחרו
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                {/* Stats Section */}
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        background: '#F6F9FC',
                        border: '1px solid #E3E9EF',
                        borderRadius: 2
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#4E97FD', mb: 0.5 }}>
                          {cart.length}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#7D879C', fontSize: '0.75rem' }}>
                          מוצרים
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        background: '#F6F9FC',
                        border: '1px solid #E3E9EF',
                        borderRadius: 2
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#33D067', mb: 0.5 }}>
                          {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#7D879C', fontSize: '0.75rem' }}>
                          יחידות
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              
              {isAdmin && (
                <Slide direction="up" in timeout={800} style={{ transitionDelay: '300ms' }}>
                  <Alert 
                    severity="info" 
                    icon={<PaymentIcon />}
                    sx={{ 
                      mt: 3,
                      borderRadius: 2,
                      border: '1px solid #DBF0FE',
                      background: '#F6F9FC',
                      color: '#2B3445'
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      מצב מנהל פעיל - ניתן לערוך מחירים ישירות בעגלת הקניות
                    </Typography>
                  </Alert>
                </Slide>
              )}
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Cart Items - Full width, light design */}
      {!orderSummary && (
      <Grid container spacing={isSmall ? 2 : 3} sx={{ mx: 0, width: '100%', pr: 0 }}>
        <Grid item xs={12} lg={8} sx={{ pl: 0, pr: 0 }}>
          <Stack spacing={isSmall ? 1 : 2}>
            {cart.map((item) => (
              <CartItem
                key={item.ref}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onUpdatePrice={updateItemPrice}
                isAdmin={isAdmin}
              />
            ))}
          </Stack>
        </Grid>

        {/* Light Bazaar Pro Order Summary Sidebar */}
        <Grid item xs={12} lg={4} sx={{ pl: 0, pr: 0 }}>
          <Zoom in timeout={800} style={{ transitionDelay: '200ms' }}>
            <Card
              sx={{ 
                position: { lg: 'sticky' },
                top: { lg: 20 },
                background: '#FFFFFF',
                border: '1px solid #E3E9EF',
                borderRadius: 3,
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden'
              }}
            >
              {/* Light Header */}
              <CardHeader
                sx={{
                  background: '#4E97FD',
                  color: 'white',
                  textAlign: 'center',
                  py: 2.5
                }}
                title={
                  <Box>
                    <PaymentIcon sx={{ fontSize: 28, mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      סיכום הזמנה
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5, fontSize: '0.8rem' }}>
                      פרטי התשלום והמשלוח
                    </Typography>
                  </Box>
                }
              />
              
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {/* Customer Name Field */}
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2B3445',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1.5
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 18 }} />
                      פרטי לקוח
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="הזן שם לקוח (אופציונלי)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#F6F9FC',
                          border: '1px solid #E3E9EF',
                          transition: 'all 0.2s ease',
                          '& fieldset': {
                            border: 'none'
                          },
                          '&:hover': {
                            borderColor: '#4E97FD',
                            backgroundColor: '#FFFFFF'
                          },
                          '&.Mui-focused': {
                            borderColor: '#4E97FD',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 2px 8px rgba(78, 151, 253, 0.15)'
                          }
                        },
                        '& input': {
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          padding: '12px 14px'
                        }
                      }}
                    />
                  </Box>

                  {/* Order Summary Cards */}
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2B3445',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <ReceiptIcon sx={{ fontSize: 18 }} />
                      פירוט עלויות
                    </Typography>
                    
                    <Stack spacing={1.5}>
                      <Box 
                        sx={{ 
                          p: 1,
                          borderRadius: 1,
                          background: '#F6F9FC',
                          border: '1px solid #E3E9EF'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#7D879C', fontSize: '0.8rem' }}>
                          מוצרים: {cart.length} • יחידות: {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </Typography>
                      </Box>
                      
                      <Card 
                        sx={{ 
                          background: '#F6F9FC',
                          border: '1px solid #E3E9EF',
                          borderRadius: 2
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#7D879C' }}>
                              סכום ביניים
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2B3445' }}>
                              {formatCurrency(subtotal)}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        sx={{ 
                          background: '#F6F9FC',
                          border: '1px solid #E3E9EF',
                          borderRadius: 2
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#7D879C' }}>
                              מע"מ ({companySettings?.taxRate || 17}%)
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2B3445' }}>
                              {formatCurrency(tax)}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Box>

                  {/* Total Section */}
                  <Card
                    sx={{
                      background: '#4E97FD',
                      borderRadius: 3,
                      border: '2px solid #3975D9',
                      boxShadow: '0 4px 16px rgba(78, 151, 253, 0.25)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: '#ffffff'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, color: 'white' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          סה"כ לתשלום
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                          {formatCurrency(total)}
                        </Typography>
                      </Box>
                      
                      <BazaarButton
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting || cart.length === 0}
                        variant="contained"
                        fullWidth
                        sx={{
                          background: isSubmitting 
                            ? '#AEB4BE'
                            : '#FFFFFF',
                          color: isSubmitting ? '#7D879C' : '#4E97FD',
                          fontWeight: 700,
                          fontSize: '1rem',
                          py: 1.5,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                          '&:hover': {
                            background: '#F6F9FC',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                          },
                          '&:disabled': {
                            background: '#AEB4BE',
                            color: '#7D879C',
                            boxShadow: 'none'
                          }
                        }}
                        startIcon={isSubmitting ? <PaymentIcon /> : <CheckIcon />}
                      >
                        {isSubmitting ? 'מעבד הזמנה...' : 'הגש הזמנה'}
                      </BazaarButton>
                    </CardContent>
                  </Card>
                </Stack>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
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