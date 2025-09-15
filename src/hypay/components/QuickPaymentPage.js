/**
 * QuickPaymentPage Component
 * 
 * Standalone payment page where users can input any payment amount
 * and process payment through Hypay without being tied to a specific order.
 * 
 * Perfect for donations, deposits, custom payments, or one-off transactions.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AttachMoney as MoneyIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugIcon
} from '@mui/icons-material';

import { usePayment } from '../hooks/usePayment';
import { formatCurrency } from '../../utils/dataHelpers';

const QuickPaymentPage = ({ 
  companySettings = {},
  onPaymentSuccess,
  onPaymentError,
  defaultCurrency = 'ILS',
  minAmount = 1,
  maxAmount = 10000,
  title = 'תשלום מהיר',
  description = 'הזן את הסכום הרצוי ופרטיך לביצוע התשלום'
}) => {
  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentPurpose, setPaymentPurpose] = useState('general');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [errors, setErrors] = useState({});

  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');

  // Debug state
  const [debugLogs, setDebugLogs] = useState([]);
  const [debugExpanded, setDebugExpanded] = useState(false);

  // Steps
  const steps = ['פרטי תשלום', 'פרטים אישיים', 'תשלום'];

  // Debug logging function
  const addDebugLog = useCallback((type, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString('he-IL');
    const logEntry = {
      id: Date.now(),
      timestamp,
      type, // 'info', 'success', 'error', 'warning'
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    
    setDebugLogs(prev => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 logs
    
    // Also log to console with emoji
    const emoji = {
      info: '🐛',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || '📋';
    
    console.log(`${emoji} DEBUG [${timestamp}]: ${message}`, data || '');
  }, []);

  /**
   * Get payment purpose label
   */
  const getPaymentPurposeLabel = (purpose) => {
    const purposes = {
      general: 'תשלום כללי',
      donation: 'תרומה',
      deposit: 'פיקדון',
      service: 'תשלום עבור שירות',
      product: 'תשלום עבור מוצר',
      subscription: 'מנוי',
      other: 'אחר'
    };
    return purposes[purpose] || purposes.general;
  };

  // Create order data for payment hook
  const orderData = React.useMemo(() => {
    if (!paymentAmount || !customerName) {
      addDebugLog('warning', 'Order data incomplete', {
        paymentAmount,
        customerName,
        missing: !paymentAmount ? 'amount' : 'customer name'
      });
      return null;
    }

    const order = {
      orderId: `QUICK_${Date.now()}`,
      customerName,
      customerEmail,
      customerPhone,
      total: parseFloat(paymentAmount) || 0,
      items: [{
        ref: 'QUICK_PAYMENT',
        productName: getPaymentPurposeLabel(paymentPurpose),
        productName2: description,
        size: '',
        quantity: 1,
        unitPrice: parseFloat(paymentAmount) || 0,
        totalPrice: parseFloat(paymentAmount) || 0
      }],
      billingAddress: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      }
    };
    
    addDebugLog('info', 'Order data created', order);
    return order;
  }, [paymentAmount, customerName, customerEmail, customerPhone, paymentPurpose, description, addDebugLog]);

  // Payment hook
  const {
    isProcessingPayment,
    paymentSession,
    paymentStatus,
    paymentError,
    processPayment,
    resetPayment
  } = usePayment(orderData, companySettings);

  // Initialize debug logging
  useEffect(() => {
    addDebugLog('info', 'QuickPaymentPage initialized', {
      companySettings,
      defaultCurrency,
      minAmount,
      maxAmount
    });
  }, [addDebugLog, companySettings, defaultCurrency, minAmount, maxAmount]);

  // Handle payment status changes
  useEffect(() => {
    if (paymentStatus === 'success' && paymentSession) {
      addDebugLog('success', 'Payment completed successfully!', {
        session_id: paymentSession.session_id,
        transaction_id: paymentSession.transaction_id,
        amount: paymentSession.amount,
        status: paymentSession.status
      });
      onPaymentSuccess?.(paymentSession);
    } else if (paymentStatus === 'failed' && paymentError) {
      addDebugLog('error', 'Payment failed', {
        error: paymentError,
        paymentSession
      });
      onPaymentError?.(paymentError);
    }
  }, [paymentStatus, paymentSession, paymentError, onPaymentSuccess, onPaymentError, addDebugLog]);

  // Track payment status changes
  useEffect(() => {
    if (paymentStatus !== 'idle') {
      addDebugLog('info', `Payment status changed to: ${paymentStatus}`, {
        paymentStatus,
        paymentSession,
        paymentError
      });
    }
  }, [paymentStatus, paymentSession, paymentError, addDebugLog]);

  /**
   * Validate current step without setting errors (for checking validity)
   */
  const checkStepValidity = useCallback((step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Payment details
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
          newErrors.paymentAmount = 'יש להזין סכום תקין';
        } else if (parseFloat(paymentAmount) < minAmount) {
          newErrors.paymentAmount = `הסכום המינימלי הוא ${formatCurrency(minAmount, currency)}`;
        } else if (parseFloat(paymentAmount) > maxAmount) {
          newErrors.paymentAmount = `הסכום המקסימלי הוא ${formatCurrency(maxAmount, currency)}`;
        }
        break;

      case 1: // Personal details
        if (!customerName.trim()) {
          newErrors.customerName = 'יש להזין שם מלא';
        }
        if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
          newErrors.customerEmail = 'יש להזין כתובת אימייל תקינה';
        }
        if (customerPhone && !/^[\d\-\s\+\(\)]{10,}$/.test(customerPhone.replace(/\s/g, ''))) {
          newErrors.customerPhone = 'יש להזין מספר טלפון תקין';
        }
        break;

      default:
        break;
    }

    return Object.keys(newErrors).length === 0;
  }, [paymentAmount, minAmount, maxAmount, currency, customerName, customerEmail, customerPhone]);

  /**
   * Validate current step and update errors state
   */
  const validateStep = useCallback((step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Payment details
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
          newErrors.paymentAmount = 'יש להזין סכום תקין';
        } else if (parseFloat(paymentAmount) < minAmount) {
          newErrors.paymentAmount = `הסכום המינימלי הוא ${formatCurrency(minAmount, currency)}`;
        } else if (parseFloat(paymentAmount) > maxAmount) {
          newErrors.paymentAmount = `הסכום המקסימלי הוא ${formatCurrency(maxAmount, currency)}`;
        }
        break;

      case 1: // Personal details
        if (!customerName.trim()) {
          newErrors.customerName = 'יש להזין שם מלא';
        }
        if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
          newErrors.customerEmail = 'יש להזין כתובת אימייל תקינה';
        }
        if (customerPhone && !/^[\d\-\s\+\(\)]{10,}$/.test(customerPhone.replace(/\s/g, ''))) {
          newErrors.customerPhone = 'יש להזין מספר טלפון תקין';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [paymentAmount, minAmount, maxAmount, currency, customerName, customerEmail, customerPhone]);

  // Memoized validity check for current step
  const currentStepValid = useMemo(() => 
    checkStepValidity(currentStep), 
    [checkStepValidity, currentStep]
  );

  /**
   * Handle next step
   */
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else if (currentStep === 2) {
        handlePayment();
      }
    }
  };

  /**
   * Handle previous step
   */
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Handle payment initiation
   */
  const handlePayment = async () => {
    addDebugLog('info', 'Starting payment process', {
      selectedPaymentMethod,
      currency,
      orderData
    });
    
    try {
      addDebugLog('info', 'Calling processPayment function');
      
      await processPayment({
        methods: [selectedPaymentMethod],
        currency,
        expiresIn: 30
      });
      
      addDebugLog('success', 'processPayment completed successfully');
    } catch (error) {
      addDebugLog('error', 'Payment process failed', {
        error: error.message,
        stack: error.stack
      });
      console.error('Payment initiation error:', error);
    }
  };

  /**
   * Handle retry payment
   */
  const handleRetry = () => {
    resetPayment();
    setCurrentStep(0);
  };

  /**
   * Handle reset form
   */
  const handleReset = () => {
    setCurrentStep(0);
    setPaymentAmount('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setPaymentPurpose('general');
    setErrors({});
    resetPayment();
  };

  /**
   * Get payment method display name
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

  /**
   * Render step content
   */
  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Payment details
        return (
          <Box sx={{ py: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="סכום לתשלום"
                  variant="outlined"
                  fullWidth
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  error={!!errors.paymentAmount}
                  helperText={errors.paymentAmount}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MoneyIcon />
                        {currency === 'ILS' ? '₪' : currency}
                      </InputAdornment>
                    ),
                  }}
                  type="number"
                  inputProps={{ min: minAmount, max: maxAmount, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>מטבע</InputLabel>
                  <Select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    label="מטבע"
                  >
                    <MenuItem value="ILS">שקל (₪)</MenuItem>
                    <MenuItem value="USD">דולר ($)</MenuItem>
                    <MenuItem value="EUR">יורו (€)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>מטרת התשלום</InputLabel>
                  <Select
                    value={paymentPurpose}
                    onChange={(e) => setPaymentPurpose(e.target.value)}
                    label="מטרת התשלום"
                  >
                    <MenuItem value="general">תשלום כללי</MenuItem>
                    <MenuItem value="donation">תרומה</MenuItem>
                    <MenuItem value="deposit">פיקדון</MenuItem>
                    <MenuItem value="service">תשלום עבור שירות</MenuItem>
                    <MenuItem value="product">תשלום עבור מוצר</MenuItem>
                    <MenuItem value="subscription">מנוי</MenuItem>
                    <MenuItem value="other">אחר</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {paymentAmount && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                    <Typography variant="h6" color="primary">
                      סכום לתשלום: {formatCurrency(parseFloat(paymentAmount) || 0, currency)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getPaymentPurposeLabel(paymentPurpose)}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 1: // Personal details
        return (
          <Box sx={{ py: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="שם מלא"
                  variant="outlined"
                  fullWidth
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  error={!!errors.customerName}
                  helperText={errors.customerName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="אימייל (אופציונלי)"
                  variant="outlined"
                  fullWidth
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  error={!!errors.customerEmail}
                  helperText={errors.customerEmail}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                  type="email"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="טלפון (אופציונלי)"
                  variant="outlined"
                  fullWidth
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  error={!!errors.customerPhone}
                  helperText={errors.customerPhone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                  type="tel"
                />
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>סיכום:</strong><br />
                    שם: {customerName || 'לא הוזן'}<br />
                    סכום: {formatCurrency(parseFloat(paymentAmount) || 0, currency)}<br />
                    מטרה: {getPaymentPurposeLabel(paymentPurpose)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 2: // Payment
        return (
          <Box sx={{ py: 2 }}>
            {/* Payment method selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                בחר אמצעי תשלום:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(companySettings?.paymentMethods || ['credit_card', 'paypal', 'bit']).map((method) => (
                  <Chip
                    key={method}
                    label={getPaymentMethodName(method)}
                    variant={selectedPaymentMethod === method ? 'filled' : 'outlined'}
                    color={selectedPaymentMethod === method ? 'primary' : 'default'}
                    onClick={() => setSelectedPaymentMethod(method)}
                    clickable
                  />
                ))}
              </Box>
            </Box>

            {/* Payment summary */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                אישור פרטי התשלום
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>שם:</strong> {customerName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>סכום:</strong> {formatCurrency(parseFloat(paymentAmount) || 0, currency)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>מטרה:</strong> {getPaymentPurposeLabel(paymentPurpose)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>אמצעי תשלום:</strong> {getPaymentMethodName(selectedPaymentMethod)}
                  </Typography>
                </Grid>
                {customerEmail && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>אימייל:</strong> {customerEmail}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Payment status */}
            {paymentStatus !== 'idle' && (
              <Box sx={{ mb: 2 }}>
                <Chip
                  icon={
                    paymentStatus === 'success' ? <SuccessIcon /> :
                    paymentStatus === 'failed' ? <ErrorIcon /> :
                    <CircularProgress size={20} />
                  }
                  label={`סטטוס: ${paymentStatus === 'success' ? 'הושלם בהצלחה' : 
                         paymentStatus === 'failed' ? 'נכשל' : 
                         paymentStatus === 'pending' ? 'בתהליך' : paymentStatus}`}
                  color={paymentStatus === 'success' ? 'success' : paymentStatus === 'failed' ? 'error' : 'warning'}
                  sx={{ mb: 2 }}
                />
              </Box>
            )}

            {/* Error display */}
            {paymentError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {paymentError}
              </Alert>
            )}

            {/* Success display */}
            {paymentStatus === 'success' && paymentSession && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  התשלום הושלם בהצלחה! 🎉
                </Typography>
                {paymentSession.transaction_id && (
                  <Typography variant="caption" color="text.secondary">
                    מספר עסקה: {paymentSession.transaction_id}
                  </Typography>
                )}
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  // Show success screen after payment completion
  if (paymentStatus === 'success') {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3, textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            התשלום הושלם בהצלחה! 🎉
          </Typography>
          <Typography variant="body1">
            סכום: {formatCurrency(parseFloat(paymentAmount), currency)}
          </Typography>
          <Typography variant="body2">
            {paymentSession?.transaction_id && `מספר עסקה: ${paymentSession.transaction_id}`}
          </Typography>
        </Alert>

        <Button
          variant="contained"
          onClick={handleReset}
          size="large"
        >
          ביצע תשלום נוסף
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <PaymentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </Box>

      {/* Stepper */}
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Main Content */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {renderStepContent(currentStep)}

          <Divider sx={{ my: 3 }} />

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outlined"
            >
              חזור
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {(paymentStatus === 'failed' || paymentStatus === 'cancelled') && (
                <Button
                  onClick={handleRetry}
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                >
                  נסה שוב
                </Button>
              )}

              {currentStep < 2 && (
              <Button
                onClick={handleNext}
                variant="contained"
                disabled={!currentStepValid}
              >
                  המשך
                </Button>
              )}

              {currentStep === 2 && paymentStatus === 'idle' && (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  disabled={isProcessingPayment}
                  startIcon={isProcessingPayment ? <CircularProgress size={20} /> : <PaymentIcon />}
                  size="large"
                >
                  {isProcessingPayment ? 'מעבד...' : 'שלם עכשיו'}
                </Button>
              )}
            </Box>
          </Box>

          {/* Processing indicator */}
          {paymentStatus === 'pending' && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="h6">
                בתהליך...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                התשלום מעובד... אנא השלם את התשלום בחלון שנפתח
              </Typography>
              <CircularProgress size={24} sx={{ mt: 2 }} />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                אם החלון לא נפתח, אנא אפשר חלונות קופצים לאתר זה
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Debug Window */}
      <Box sx={{ mt: 2 }}>
        <Accordion 
          expanded={debugExpanded} 
          onChange={(event, isExpanded) => setDebugExpanded(isExpanded)}
          sx={{ backgroundColor: '#f5f5f5' }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BugIcon color="primary" />
              <Typography variant="h6">
                Debug Information
              </Typography>
              <Chip 
                label={debugLogs.length} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {debugLogs.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No debug logs yet. Start a payment to see debug information.
                </Typography>
              ) : (
                debugLogs.map((log) => (
                  <Paper 
                    key={log.id} 
                    sx={{ 
                      p: 2, 
                      mb: 1, 
                      backgroundColor: {
                        info: '#e3f2fd',
                        success: '#e8f5e8', 
                        error: '#ffebee',
                        warning: '#fff3e0'
                      }[log.type] || '#f5f5f5'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {log.message}
                      </Typography>
                      <Chip 
                        label={log.timestamp} 
                        size="small" 
                        variant="outlined"
                        color={{
                          info: 'primary',
                          success: 'success',
                          error: 'error', 
                          warning: 'warning'
                        }[log.type] || 'default'}
                      />
                    </Box>
                    {log.data && (
                      <Box sx={{ 
                        backgroundColor: 'rgba(0,0,0,0.05)', 
                        p: 1, 
                        borderRadius: 1,
                        maxHeight: 200,
                        overflow: 'auto'
                      }}>
                        <Typography 
                          variant="body2" 
                          component="pre" 
                          sx={{ 
                            fontFamily: 'monospace', 
                            fontSize: '0.75rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all'
                          }}
                        >
                          {log.data}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                ))
              )}
            </Box>
            
            {/* Debug Controls */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button 
                size="small" 
                onClick={() => setDebugLogs([])}
                disabled={debugLogs.length === 0}
              >
                Clear Logs
              </Button>
              <Button 
                size="small" 
                onClick={() => {
                  const logs = debugLogs.map(log => `[${log.timestamp}] ${log.message}${log.data ? '\n' + log.data : ''}`).join('\n\n');
                  navigator.clipboard.writeText(logs);
                }}
                disabled={debugLogs.length === 0}
              >
                Copy to Clipboard
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default QuickPaymentPage;
