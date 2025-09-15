/**
 * PaymentDialog Component
 * 
 * Modal dialog for payment processing using Hypay.
 * Integrates with existing order flow and provides a clean payment interface.
 * 
 * Follows MUI dialog patterns from the existing codebase.
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Slide,
  Alert,
  Typography,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  Close as CloseIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';

import HypayPayment from './HypayPayment';

// Transition for dialog animation
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PaymentDialog = ({ 
  open, 
  onClose, 
  orderData, 
  companySettings,
  onPaymentSuccess,
  onPaymentError,
  title = 'תשלום מאובטח'
}) => {
  // Local state
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentResult, setPaymentResult] = useState(null);

  // Steps configuration
  const steps = ['אימות פרטים', 'תשלום', 'אישור'];

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setPaymentResult(null);
    }
  }, [open]);

  /**
   * Handle payment success
   */
  const handlePaymentSuccess = (paymentSession) => {
    setPaymentResult({ success: true, session: paymentSession });
    setCurrentStep(2);
    
    // Notify parent component after short delay for UX
    setTimeout(() => {
      onPaymentSuccess?.(paymentSession);
      onClose();
    }, 2000);
  };

  /**
   * Handle payment error
   */
  const handlePaymentError = (error) => {
    setPaymentResult({ success: false, error });
    onPaymentError?.(error);
  };

  /**
   * Handle dialog close
   */
  const handleClose = (event, reason) => {
    // Prevent closing during payment processing
    if (reason === 'backdropClick' && currentStep === 1) {
      return;
    }
    onClose();
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Handle next navigation
   */
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Render step content
   */
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ py: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              אנא וודא שהפרטים הבאים נכונים לפני המעבר לתשלום
            </Alert>
            
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                פרטי הזמנה
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>מספר הזמנה:</strong> #{orderData?.orderId || 'TEMP'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>שם הלקוח:</strong> {orderData?.customerName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>כמות פריטים:</strong> {orderData?.items?.length || 0}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '1.1em' }}>
                <strong>סכום לתשלום:</strong> ₪{orderData?.total?.toFixed(2)}
              </Typography>
            </Box>

            {orderData?.items && orderData.items.length > 0 && (
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  פריטים בהזמנה
                </Typography>
                {orderData.items.slice(0, 3).map((item, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                    • {item.productName} {item.size && `(${item.size})`} - {item.quantity} יח'
                  </Typography>
                ))}
                {orderData.items.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    ועוד {orderData.items.length - 3} פריטים...
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <HypayPayment
              orderData={orderData}
              companySettings={companySettings}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            {paymentResult?.success ? (
              <>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    התשלום הושלם בהצלחה! 🎉
                  </Typography>
                  <Typography variant="body2">
                    ההזמנה שלך נקלטה במערכת ותטופל בהקדם האפשרי
                  </Typography>
                </Alert>
                
                {paymentResult.session?.transaction_id && (
                  <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      מספר אסמכתא: {paymentResult.session.transaction_id}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Alert severity="error">
                <Typography variant="h6" sx={{ mb: 1 }}>
                  התשלום נכשל
                </Typography>
                <Typography variant="body2">
                  {paymentResult?.error || 'אירעה שגיאה במהלך התשלום'}
                </Typography>
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, minHeight: 400 }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {currentStep > 0 && currentStep < 2 && (
            <IconButton 
              onClick={handleBack}
              sx={{ mr: 1 }}
              disabled={currentStep === 1} // Disable back during payment
            >
              <BackIcon />
            </IconButton>
          )}
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>
        
        <IconButton 
          onClick={() => onClose()}
          disabled={currentStep === 1} // Disable close during payment
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Progress Stepper */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Content */}
      <DialogContent sx={{ px: 3, py: 0, minHeight: 300 }}>
        {renderStepContent(currentStep)}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Box>
          {currentStep === 0 && (
            <Button onClick={() => onClose()}>
              ביטול
            </Button>
          )}
        </Box>
        
        <Box>
          {currentStep === 0 && (
            <Button 
              variant="contained"
              onClick={handleNext}
              disabled={!orderData || orderData.total <= 0}
            >
              המשך לתשלום
            </Button>
          )}
          
          {currentStep === 2 && paymentResult?.success && (
            <Button 
              variant="contained"
              onClick={() => onClose()}
            >
              סגור
            </Button>
          )}
          
          {currentStep === 2 && !paymentResult?.success && (
            <Button 
              variant="outlined"
              onClick={() => setCurrentStep(1)}
            >
              נסה שוב
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
