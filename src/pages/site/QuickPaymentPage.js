/**
 * Quick Payment Site Page
 * 
 * Standalone page component that can be used as a route (/site/quickpayment)
 * Provides a complete payment interface for users to input custom amounts.
 * 
 * Perfect for donations, service payments, deposits, and general payments.
 */

import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  Snackbar,
  Paper,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  CheckCircle
} from '@mui/icons-material';

import { QuickPaymentPage as HypayQuickPaymentPage } from '../../hypay';
import { useCompany } from '../../context/CompanyContext';

const SiteQuickPaymentPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get company settings from context
  const { settings: companySettings } = useCompany();
  
  // Local state for notifications
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  
  // Track if we've already handled this payment session to prevent loops
  const handledSessionRef = useRef(null);
  
  // Payment success handler
  const handlePaymentSuccess = (paymentSession) => {
    // Prevent handling the same session multiple times
    if (handledSessionRef.current === paymentSession?.session_id) {
      return;
    }
    
    handledSessionRef.current = paymentSession?.session_id;
    console.log('🎉 Payment successful:', paymentSession);
    
    setNotification({
      open: true,
      message: `תשלום הושלם בהצלחה! מספר עסקה: ${paymentSession.transaction_id || 'N/A'}`,
      severity: 'success'
    });

    // Optional: Track payment success analytics
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: paymentSession.transaction_id,
        value: paymentSession.amount || 0,
        currency: paymentSession.currency || 'ILS'
      });
    }
  };

  // Payment error handler
  const handlePaymentError = (error) => {
    console.error('❌ Payment failed:', error);
    
    setNotification({
      open: true,
      message: `שגיאה בתשלום: ${error}`,
      severity: 'error'
    });

    // Optional: Track payment failure analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `Payment error: ${error}`,
        fatal: false
      });
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Get merged payment settings
  const paymentSettings = {
    currency: 'ILS',
    paymentMethods: ['credit_card', 'paypal', 'bit'],
    paymentExpiryMinutes: 30,
    ...companySettings
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'grey.50',
      py: { xs: 2, md: 4 }
    }}>
      {/* Header Section */}
      <Container maxWidth="lg">
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 3, md: 5 }
        }}>
          {/* Company/Site Branding */}
          <Typography 
            variant={isMobile ? "h4" : "h2"} 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2
            }}
          >
            {companySettings?.companyName || 'מערכת תשלומים'}
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
          >
            מערכת תשלומים מאובטחת ומתקדמת לביצוע תשלומים מהירים ובטוחים
          </Typography>

          {/* Payment Method Indicators */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            justifyContent: 'center',
            flexWrap: 'wrap',
            mb: 2
          }}>
            <Chip 
              label="כרטיס אשראי" 
              variant="outlined" 
              size="small"
              icon={<CheckCircle sx={{ fontSize: 16 }} />}
            />
            <Chip 
              label="PayPal" 
              variant="outlined" 
              size="small"
              icon={<CheckCircle sx={{ fontSize: 16 }} />}
            />
            <Chip 
              label="Bit" 
              variant="outlined" 
              size="small"
              icon={<CheckCircle sx={{ fontSize: 16 }} />}
            />
            <Chip 
              label="תשלום מאובטח" 
              color="success" 
              size="small"
              icon={<CheckCircle sx={{ fontSize: 16 }} />}
            />
          </Box>
        </Box>

        {/* Payment Section */}
        <Paper 
          elevation={isMobile ? 1 : 3}
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: isMobile ? 
              '0 2px 8px rgba(0,0,0,0.1)' : 
              '0 8px 32px rgba(0,0,0,0.12)'
          }}
        >
          <HypayQuickPaymentPage
            companySettings={paymentSettings}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            title="תשלום מהיר ובטוח"
            description="הזן את הסכום הרצוי ופרטיך לביצוע תשלום מאובטח"
            minAmount={1}
            maxAmount={50000}
            defaultCurrency="ILS"
          />
        </Paper>

        {/* Security & Trust Section */}
        <Box sx={{ 
          mt: { xs: 3, md: 5 }, 
          textAlign: 'center'
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            מערכת התשלומים שלנו מאובטחת ועומדת בתקני אבטחה בינלאומיים
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Chip 
              label="SSL מוצפן" 
              size="small" 
              color="success"
            />
            <Chip 
              label="PCI DSS" 
              size="small" 
              color="success"
            />
            <Chip 
              label="אבטחה מתקדמת" 
              size="small" 
              color="success"
            />
          </Box>
        </Box>

        {/* Footer Information */}
        <Box sx={{ 
          mt: { xs: 4, md: 6 }, 
          pt: 3,
          borderTop: 1,
          borderColor: 'divider',
          textAlign: 'center'
        }}>
          <Typography variant="body2" color="text.secondary">
            לשאלות ותמיכה: {companySettings?.supportEmail || 'support@example.com'} | 
            טלפון: {companySettings?.supportPhone || '03-1234567'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            כל התשלומים מעובדים באמצעות Hypay - מערכת תשלומים מאובטחת ומוכרת
          </Typography>
        </Box>
      </Container>

      {/* Success/Error Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
          }}
          icon={notification.severity === 'success' ? <SuccessIcon /> : <ErrorIcon />}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SiteQuickPaymentPage;
