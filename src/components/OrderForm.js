import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createOrder, getOrderById } from '../api/orders';
import { useCart } from '../context/CartContext';
import { useCompany } from '../context/CompanyContext';
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
  useTheme,
  useMediaQuery,
  Chip,
  List,
  ListItem,
  ListItemText,
  TextField,
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
  Add as AddIcon
} from '@mui/icons-material';
import CartItem from './CartItem';
import '../styles/print.css';

const OrderForm = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { settings: companySettings } = useCompany();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleNewOrder = useCallback(() => {
    setOrderSummary(null);
    setCustomerName('');
  }, []);
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
    <Box sx={{ direction: 'rtl', py: 2, px: { xs: 2, sm: 3 }, width: '100%', maxWidth: 'none' }}>
      {/* Professional Invoice-Style Order Summary */}
      {orderSummary && (
        <Paper 
          ref={summaryRef} 
          elevation={3}
          data-print-area
          sx={{ 
            width: '100%',
            mb: 4,
            overflow: 'hidden'
          }}
        >
          {/* Success Banner for Screen */}
          <Box sx={{ 
            bgcolor: 'success.main', 
            color: 'success.contrastText', 
            p: 2,
            textAlign: 'center',
            '@media print': { display: 'none' }
          }}>
            <CheckIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              הזמנה הוגשה בהצלחה!
            </Typography>
          </Box>

          {/* Professional Invoice Header */}
          <Box className="print-invoice-header" sx={{ p: 3, '@media print': { p: 0 } }}>
            <Box className="print-company-logo">
              <Typography className="print-company-name" variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {companySettings.companyName}
              </Typography>
              <Box className="print-company-details">
                <Typography variant="caption" display="block">{companySettings.companyDescription}</Typography>
                <Typography variant="caption" display="block">{companySettings.companyTagline}</Typography>
                {companySettings.companyAddress && (
                  <Typography variant="caption" display="block">{companySettings.companyAddress}</Typography>
                )}
                {(companySettings.companyPhone || companySettings.companyEmail) && (
                  <Typography variant="caption" display="block">
                    {companySettings.companyPhone && `טל: ${companySettings.companyPhone}`}
                    {companySettings.companyPhone && companySettings.companyEmail && ' | '}
                    {companySettings.companyEmail && `מייל: ${companySettings.companyEmail}`}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box className="print-invoice-title">
              <Typography variant="h3" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>
                הזמנה
              </Typography>
            </Box>
            
            <Box className="print-order-number">
              <Typography className="number" variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                #{new Date().getFullYear()}-{String(orderSummary.id).padStart(4, '0')}
              </Typography>
              <Typography className="date" variant="caption">
                {new Date().toLocaleDateString('he-IL')}
              </Typography>
            </Box>
          </Box>

          {/* Customer and Order Information */}
          <Box className="print-info-section" sx={{ p: 3, '@media print': { p: 0, mb: 2 } }}>
            <Box className="print-customer-info">
              <Typography className="print-info-title">פרטי לקוח</Typography>
              <Box className="print-info-row">
                <Typography className="print-info-label">שם לקוח:</Typography>
                <Typography className="print-info-value">
                  {orderSummary.customerName || 'אורח'}
                </Typography>
              </Box>
              <Box className="print-info-row">
                <Typography className="print-info-label">סוג לקוח:</Typography>
                <Typography className="print-info-value">רגיל</Typography>
              </Box>
            </Box>
            
            <Box className="print-order-info">
              <Typography className="print-info-title">פרטי הזמנה</Typography>
              <Box className="print-info-row">
                <Typography className="print-info-label">מספר הזמנה:</Typography>
                <Typography className="print-info-value">
                  #{new Date().getFullYear()}-{String(orderSummary.id).padStart(4, '0')}
                </Typography>
              </Box>
              <Box className="print-info-row">
                <Typography className="print-info-label">תאריך:</Typography>
                <Typography className="print-info-value">
                  {new Date().toLocaleDateString('he-IL')}
                </Typography>
              </Box>
              <Box className="print-info-row">
                <Typography className="print-info-label">סטטוס:</Typography>
                <Typography className="print-info-value">הוגשה</Typography>
              </Box>
            </Box>
          </Box>

          {/* Products Section */}
          <Box className="print-products-section" sx={{ p: 3, '@media print': { p: 0 } }}>
            <Typography className="print-section-title">פירוט מוצרים</Typography>
            
            <Table className="print-table">
              <TableHead>
                <TableRow>
                  <TableCell align="right">מק"ט</TableCell>
                  <TableCell align="right">שם מוצר</TableCell>
                  <TableCell align="right">גודל</TableCell>
                  <TableCell align="right">כמות</TableCell>
                  <TableCell align="right">מחיר יחידה</TableCell>
                  <TableCell align="right">סה"כ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderSummary.items.map((item, index) => (
                  <TableRow key={`${item.ref}-${item.size || ''}-${index}`}>
                    <TableCell className="product-code" align="right">
                      {item.ref}
                    </TableCell>
                    <TableCell align="right">
                      {item.productName || item.productName2}
                    </TableCell>
                    <TableCell align="right">
                      {item.size || '-'}
                    </TableCell>
                    <TableCell className="quantity" align="right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="price" align="right">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="price" align="right">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* Summary Section */}
          <Box className="print-summary-section" sx={{ p: 3, '@media print': { p: 0 } }}>
            <Box className="print-summary">
              <Box className="print-summary-header">סיכום הזמנה</Box>
              <Box className="print-summary-row subtotal">
                <Typography className="print-summary-label">סכום ביניים:</Typography>
                <Typography className="print-summary-value">
                  {formatCurrency(orderSummary.subtotal)}
                </Typography>
              </Box>
              <Box className="print-summary-row tax">
                <Typography className="print-summary-label">מע"מ (17%):</Typography>
                <Typography className="print-summary-value">
                  {formatCurrency(orderSummary.tax)}
                </Typography>
              </Box>
              <Box className="print-summary-row total">
                <Typography className="print-summary-label">סה"כ לתשלום:</Typography>
                <Typography className="print-summary-value">
                  {formatCurrency(orderSummary.total)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Stack 
            className="action-buttons"
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center" 
            sx={{ p: 3, '@media print': { display: 'none' } }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ 
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              הדפס / שמור כ-PDF
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleNewOrder}
              sx={{ 
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2
                }
              }}
            >
              הזמנה חדשה
            </Button>
          </Stack>

          {/* Professional Footer */}
          <Box className="print-footer" sx={{ '@media screen': { display: 'none' } }}>
            <Box className="print-footer-content">
              <Typography className="print-footer-company">{companySettings.companyName}</Typography>
              <Typography className="print-footer-contact">
                {companySettings.companyDescription}
                {companySettings.companyPhone && ` | טל: ${companySettings.companyPhone}`}
                {companySettings.companyEmail && ` | ${companySettings.companyEmail}`}
              </Typography>
              <Typography className="print-footer-timestamp">
                הודפס: {new Date().toLocaleDateString('he-IL')} {new Date().toLocaleTimeString('he-IL')}
              </Typography>
            </Box>
            <Typography className="print-footer-disclaimer">
              {companySettings.invoiceFooter}
            </Typography>
          </Box>
        </Paper>
      )}
      {/* Header */}
      {!orderSummary && (
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
      )}

      {/* Cart Items - Full width, compact, right-aligned */}
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
              />
            ))}
          </Stack>
        </Grid>

        {/* Order Summary Sidebar */}
        <Grid item xs={12} lg={4} sx={{ pl: 0, pr: 0 }}>
          <Box 
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              position: { lg: 'sticky' },
              top: { lg: 20 },
              p: 2,
              bgcolor: 'background.paper'
            }}
          >
            <Stack spacing={2}>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <ReceiptIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  סיכום הזמנה
                </Typography>
              </Box>

              {/* Customer Name Field */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, textAlign: 'right' }}>
                  שם לקוח:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="הזן שם לקוח (אופציונלי)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#ffffff',
                      '& fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.dark'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main'
                      }
                    },
                    '& input': {
                      textAlign: 'right',
                      fontSize: '1rem',
                      fontWeight: 600,
                      padding: '12px 14px'
                    }
                  }}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                  }}
                />
              </Box>

              {/* Order Summary Cards */}
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      מוצרים בעגלה:
                    </Typography>
                    <Chip label={cart.length} color="primary" size="small" sx={{ fontWeight: 600 }} />
                  </Stack>
                </Box>
                
                <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      כמות כוללת:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </Typography>
                  </Stack>
                </Box>
                
                <Box sx={{ p: 1.5, bgcolor: 'info.light', borderRadius: 2, border: '1px solid', borderColor: 'info.main' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'info.contrastText' }}>
                      סכום ביניים:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'info.contrastText' }} aria-label="סכום ביניים">
                      {formatCurrency(subtotal)}
                    </Typography>
                  </Stack>
                </Box>
                
                <Box sx={{ p: 1.5, bgcolor: 'warning.light', borderRadius: 2, border: '1px solid', borderColor: 'warning.main' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'warning.contrastText' }}>
                      מע"מ (17%):
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'warning.contrastText' }} aria-label="מס">
                      {formatCurrency(tax)}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              <Divider />

              {/* Total */}
              <Box
                sx={{
                  p: 2.5,
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  textAlign: 'center'
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white', mb: 0.5 }}>
                  סה"כ לתשלום
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ fontWeight: 800, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                  aria-label={'סה"כ לתשלום'}
                >
                  {formatCurrency(total)}
                </Typography>
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
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px 2px rgba(33, 203, 243, .4)'
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                      boxShadow: 'none'
                    }
                  }}
                  disabled={isSubmitting || cart.length === 0}
                >
                  {isSubmitting ? 'שולח הזמנה...' : 'הגש הזמנה'}
                </Button>

                <Button
                  variant="outlined"
                  size="medium"
                  fullWidth
                  onClick={clearCart}
                  color="error"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 500
                  }}
                >
                  נקה עגלה
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Grid>
      </Grid>
      )}
    </Box>

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
