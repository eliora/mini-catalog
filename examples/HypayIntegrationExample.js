/**
 * Hypay Integration Example
 * 
 * This file demonstrates how to integrate the Hypay payment module
 * into your existing e-commerce application.
 */

import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Button, Alert } from '@mui/material';

// Import the payment components from the hypay module
import { HypayPayment, PaymentDialog } from '../src/hypay';
import { usePayment } from '../src/hypay/hooks/usePayment';
import { useOrderSubmissionWithPayment } from '../src/hypay/hooks/useOrderSubmissionWithPayment';

// Example: Simple checkout page with Hypay integration
const CheckoutPageExample = () => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // Sample order data
  const sampleOrder = {
    orderId: '12345',
    customerName: 'יוסי כהן',
    customerEmail: 'yossi@example.com',
    customerPhone: '050-1234567',
    items: [
      {
        ref: 'PROD001',
        productName: 'מוצר לדוגמה 1',
        size: 'M',
        quantity: 2,
        unitPrice: 99.90,
        totalPrice: 199.80
      },
      {
        ref: 'PROD002',
        productName: 'מוצר לדוגמה 2',
        size: 'L',
        quantity: 1,
        unitPrice: 149.90,
        totalPrice: 149.90
      }
    ],
    subtotal: 349.70,
    tax: 59.45,
    total: 409.15
  };

  // Sample company settings
  const companySettings = {
    currency: 'ILS',
    taxRate: 17,
    paymentMethods: ['credit_card', 'paypal', 'bit'],
    paymentExpiryMinutes: 30
  };

  const handlePaymentSuccess = (paymentSession) => {
    console.log('Payment successful!', paymentSession);
    alert(`תשלום הושלם בהצלחה! מספר עסקה: ${paymentSession.transaction_id}`);
    setShowPaymentDialog(false);
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    alert(`שגיאה בתשלום: ${error}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        דוגמה לאינטגרציה עם Hypay
      </Typography>

      {/* Order Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          סיכום הזמנה #{sampleOrder.orderId}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography><strong>לקוח:</strong> {sampleOrder.customerName}</Typography>
          <Typography><strong>אימייל:</strong> {sampleOrder.customerEmail}</Typography>
          <Typography><strong>טלפון:</strong> {sampleOrder.customerPhone}</Typography>
        </Box>

        <Typography variant="subtitle2" gutterBottom>פריטים:</Typography>
        {sampleOrder.items.map((item, index) => (
          <Box key={index} sx={{ mb: 1, pl: 2 }}>
            <Typography variant="body2">
              {item.productName} ({item.size}) - {item.quantity} יח' × ₪{item.unitPrice} = ₪{item.totalPrice}
            </Typography>
          </Box>
        ))}

        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography><strong>סכום ביניים:</strong> ₪{sampleOrder.subtotal}</Typography>
          <Typography><strong>מע"ם:</strong> ₪{sampleOrder.tax}</Typography>
          <Typography variant="h6" color="primary">
            <strong>סכום לתשלום:</strong> ₪{sampleOrder.total}
          </Typography>
        </Box>
      </Paper>

      {/* Payment Options */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          אפשרויות תשלום
        </Typography>

        {/* Option 1: Inline Payment Component */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            אופציה 1: רכיב תשלום בתוך העמוד
          </Typography>
          <HypayPayment
            orderData={sampleOrder}
            companySettings={companySettings}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </Box>

        {/* Option 2: Payment Dialog */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            אופציה 2: חלון תשלום נפרד
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setShowPaymentDialog(true)}
          >
            פתח חלון תשלום
          </Button>
        </Box>
      </Paper>

      {/* Integration Notes */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>הערות לאינטגרציה:</strong>
        </Typography>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>וודא שמשתני הסביבה של Hypay מוגדרים ב-.env</li>
          <li>הרץ את ה-migration לבסיס הנתונים ליצירת הטבלאות הנדרשות</li>
          <li>הגדר webhook URL בפאנל הניהול של Hypay</li>
          <li>בדוק שההרשאות ב-Supabase מוגדרות נכון</li>
        </ul>
      </Alert>

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        orderData={sampleOrder}
        companySettings={companySettings}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        onCancel={() => setShowPaymentDialog(false)}
      />
    </Container>
  );
};

// Example: Using the enhanced order submission hook
const OrderFormExample = () => {
  const [cart] = useState([
    {
      ref: 'ITEM001',
      productName: 'מוצר לדוגמה',
      size: 'M',
      quantity: 1,
      unitPrice: 100
    }
  ]);
  
  const [customerName, setCustomerName] = useState('לקוח לדוגמה');
  const companySettings = { taxRate: 17, currency: 'ILS' };
  const mockClearCart = () => console.log('Cart cleared');

  const {
    isSubmitting,
    isProcessingPayment,
    paymentDialog,
    submitOrder,
    handlePaymentSuccess,
    handlePaymentError,
    setPaymentDialog
  } = useOrderSubmissionWithPayment(
    cart,
    customerName,
    100, // subtotal
    17,  // tax
    117, // total
    companySettings,
    mockClearCart,
    { requirePayment: true }
  );

  const handleSubmit = () => {
    submitOrder({
      requirePayment: true,
      paymentMethod: 'credit_card'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        דוגמה לשימוש ב-Hook המשופר
      </Typography>
      
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={isSubmitting || isProcessingPayment}
      >
        {isProcessingPayment ? 'מעבד תשלום...' : isSubmitting ? 'שולח הזמנה...' : 'הגש הזמנה עם תשלום'}
      </Button>

      <PaymentDialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        orderData={{
          orderId: 'TEMP',
          customerName,
          items: cart,
          total: 117
        }}
        companySettings={companySettings}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </Box>
  );
};

// Example: Direct payment hook usage
const PaymentHookExample = () => {
  const orderData = {
    orderId: 'HOOK_EXAMPLE',
    customerName: 'לקוח לדוגמה',
    total: 250.00,
    items: []
  };

  const {
    isProcessingPayment,
    paymentStatus,
    paymentError,
    processPayment,
    cancelPayment
  } = usePayment(orderData, { currency: 'ILS' });

  const handleStartPayment = async () => {
    try {
      await processPayment({
        methods: ['credit_card', 'paypal'],
        expiresIn: 30
      });
    } catch (error) {
      console.error('Failed to start payment:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        דוגמה לשימוש ישיר ב-Payment Hook
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        סטטוס תשלום: {paymentStatus}
      </Typography>

      {paymentError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {paymentError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleStartPayment}
          disabled={isProcessingPayment}
        >
          {isProcessingPayment ? 'מעבד...' : 'התחל תשלום'}
        </Button>

        {paymentStatus === 'pending' && (
          <Button
            variant="outlined"
            onClick={cancelPayment}
          >
            בטל תשלום
          </Button>
        )}
      </Box>
    </Box>
  );
};

// Export examples
export {
  CheckoutPageExample,
  OrderFormExample,
  PaymentHookExample
};

export default CheckoutPageExample;
