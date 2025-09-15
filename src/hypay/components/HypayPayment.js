/**
 * HypayPayment Component
 * 
 * Main payment interface component for Hypay integration.
 * Handles payment initialization, status display, and user interactions.
 * 
 * Follows existing codebase patterns and integrates with MUI components.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon
} from '@mui/icons-material';

import { usePayment } from '../hooks/usePayment';
import { formatCurrency } from '../../utils/dataHelpers';

const HypayPayment = ({ 
  orderData, 
  companySettings, 
  onPaymentSuccess, 
  onPaymentError,
  onCancel,
  disabled = false 
}) => {
  // Local state
  const [expanded, setExpanded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  // Payment hook
  const {
    isProcessingPayment,
    paymentSession,
    paymentStatus,
    paymentError,
    processPayment,
    cancelPayment,
    resetPayment,
    refundPayment
  } = usePayment(orderData, companySettings);

  // Handle payment status changes
  useEffect(() => {
    if (paymentStatus === 'success' && paymentSession) {
      onPaymentSuccess?.(paymentSession);
    } else if (paymentStatus === 'failed' && paymentError) {
      onPaymentError?.(paymentError);
    }
  }, [paymentStatus, paymentSession, paymentError, onPaymentSuccess, onPaymentError]);

  /**
   * Handle payment initiation
   */
  const handlePayNow = async () => {
    try {
      await processPayment({
        methods: [paymentMethod],
        currency: companySettings?.currency || 'ILS'
      });
    } catch (error) {
      console.error('Payment initiation error:', error);
    }
  };

  /**
   * Handle payment cancellation
   */
  const handleCancel = () => {
    cancelPayment();
    onCancel?.();
  };

  /**
   * Handle retry payment
   */
  const handleRetry = () => {
    resetPayment();
  };

  /**
   * Get status color based on payment status
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      case 'cancelled': return 'info';
      default: return 'default';
    }
  };

  /**
   * Get status icon based on payment status
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <SuccessIcon />;
      case 'failed': return <ErrorIcon />;
      case 'pending': return <CircularProgress size={20} />;
      case 'cancelled': return <CancelIcon />;
      default: return <PaymentIcon />;
    }
  };

  /**
   * Format payment method display name
   */
  const getPaymentMethodName = (method) => {
    const methods = {
      credit_card: 'כרטיס אשראי',
      paypal: 'PayPal',
      bit: 'Bit',
      apple_pay: 'Apple Pay',
      google_pay: 'Google Pay'
    };
    return methods[method] || method;
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h2">
            תשלום מאובטח דרך Hypay
          </Typography>
        </Box>

        {/* Order Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            סיכום הזמנה #{orderData?.orderId}
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                לקוח: {orderData?.customerName}
              </Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'left' }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatCurrency(orderData?.total, companySettings?.currency)}
              </Typography>
            </Grid>
          </Grid>
          
          {/* Expandable items list */}
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <CollapseIcon /> : <ExpandIcon />}
              sx={{ p: 0, minHeight: 'auto' }}
            >
              <Typography variant="caption">
                {expanded ? 'הסתר פריטים' : `הצג פריטים (${orderData?.items?.length})`}
              </Typography>
            </Button>
            
            <Collapse in={expanded}>
              <List dense sx={{ mt: 1 }}>
                {orderData?.items?.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemText
                      primary={
                        <Typography variant="caption">
                          {item.productName} {item.size && `- ${item.size}`}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {item.quantity} × {formatCurrency(item.unitPrice, companySettings?.currency)}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Payment Status */}
        {paymentStatus !== 'idle' && (
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={getStatusIcon(paymentStatus)}
              label={`סטטוס תשלום: ${paymentStatus === 'success' ? 'הושלם בהצלחה' : 
                     paymentStatus === 'failed' ? 'נכשל' : 
                     paymentStatus === 'pending' ? 'בתהליך' : 
                     paymentStatus === 'cancelled' ? 'בוטל' : paymentStatus}`}
              color={getStatusColor(paymentStatus)}
              sx={{ mb: 2 }}
            />
          </Box>
        )}

        {/* Error Display */}
        {paymentError && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={handleRetry}
                disabled={isProcessingPayment}
              >
                <RefreshIcon />
              </IconButton>
            }
          >
            {paymentError}
          </Alert>
        )}

        {/* Success Display */}
        {paymentStatus === 'success' && paymentSession && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              התשלום הושלם בהצלחה!
            </Typography>
            {paymentSession.transaction_id && (
              <Typography variant="caption" color="text.secondary">
                מספר עסקה: {paymentSession.transaction_id}
              </Typography>
            )}
          </Alert>
        )}

        {/* Payment Method Selection */}
        {paymentStatus === 'idle' && !disabled && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              בחר אמצעי תשלום:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(companySettings?.paymentMethods || ['credit_card', 'paypal', 'bit']).map((method) => (
                <Chip
                  key={method}
                  label={getPaymentMethodName(method)}
                  variant={paymentMethod === method ? 'filled' : 'outlined'}
                  color={paymentMethod === method ? 'primary' : 'default'}
                  onClick={() => setPaymentMethod(method)}
                  clickable
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {paymentStatus === 'idle' && (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={handlePayNow}
                disabled={disabled || isProcessingPayment || !orderData}
                startIcon={isProcessingPayment ? <CircularProgress size={20} /> : <PaymentIcon />}
                sx={{ minWidth: 150 }}
              >
                {isProcessingPayment ? 'מעבד...' : 'שלם עכשיו'}
              </Button>
              
              {onCancel && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleCancel}
                  disabled={isProcessingPayment}
                  sx={{ minWidth: 100 }}
                >
                  ביטול
                </Button>
              )}
            </>
          )}

          {paymentStatus === 'pending' && (
            <Button
              variant="outlined"
              size="large"
              onClick={handleCancel}
              disabled={isProcessingPayment}
              startIcon={<CancelIcon />}
            >
              בטל תשלום
            </Button>
          )}

          {(paymentStatus === 'failed' || paymentStatus === 'cancelled') && (
            <Button
              variant="contained"
              size="large"
              onClick={handleRetry}
              disabled={isProcessingPayment}
              startIcon={<RefreshIcon />}
            >
              נסה שוב
            </Button>
          )}
        </Box>

        {/* Processing Indicator */}
        {paymentStatus === 'pending' && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              התשלום מעובד... אנא אל תסגור את החלון
            </Typography>
            <CircularProgress size={24} sx={{ mt: 1 }} />
          </Box>
        )}

        {/* Session Info (for debugging in development) */}
        {process.env.NODE_ENV === 'development' && paymentSession && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Debug: Session ID: {paymentSession.session_id}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default HypayPayment;
