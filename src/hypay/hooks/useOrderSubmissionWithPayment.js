/**
 * useOrderSubmissionWithPayment Hook
 * 
 * Enhanced version of useOrderSubmission that integrates Hypay payment processing.
 * Handles the complete flow: order creation → payment → order confirmation.
 * 
 * This hook extends the existing pattern while maintaining backward compatibility.
 */

import { useState, useCallback } from 'react';
import { createOrder, updateOrder } from '../../api/orders';
import { usePayment } from './usePayment';

export const useOrderSubmissionWithPayment = (
  cart,
  customerName,
  subtotal,
  tax,
  total,
  companySettings,
  clearCart,
  options = {}
) => {
  // Enhanced state management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);

  // Payment integration
  const {
    isProcessingPayment,
    paymentSession,
    paymentStatus,
    paymentError,
    processPayment,
    resetPayment
  } = usePayment(currentOrder, companySettings);

  /**
   * Submit order with optional payment processing
   * @param {Object} submitOptions - Submission options
   */
  const submitOrder = useCallback(async (submitOptions = {}) => {
    const {
      requirePayment = companySettings?.requirePaymentOnSubmit || false,
      skipValidation = false,
      paymentMethod = 'credit_card'
    } = { ...options, ...submitOptions };

    // Basic validation
    if (!skipValidation && cart.length === 0) {
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

      // Create initial order data
      const orderData = {
        customerName: finalCustomerName,
        items: validatedItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        taxRate: companySettings?.taxRate || 17,
        orderDate: new Date().toISOString(),
        status: requirePayment ? 'pending_payment' : 'pending',
        paymentStatus: requirePayment ? 'required' : 'not_required',
        paymentMethod: requirePayment ? paymentMethod : null
      };

      console.log('🚀 Creating order:', orderData);
      
      // Create order in database
      const result = await createOrder(orderData);
      
      if (!result || !result.id) {
        throw new Error('Failed to create order - no ID returned');
      }

      console.log('✅ Order created successfully:', result);
      
      // Set current order for payment processing
      const orderWithId = { ...orderData, orderId: result.id };
      setCurrentOrder(orderWithId);

      // Handle payment flow
      if (requirePayment && total > 0) {
        setPaymentRequired(true);
        setPaymentDialog(true);
        
        setSnackbar({
          open: true,
          message: `הזמנה מספר #${result.id} נוצרה. ממשיך לתשלום...`,
          severity: 'info'
        });
      } else {
        // Complete order without payment
        await completeOrder(result, orderWithId);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Order submission error:', error);
      
      let errorMessage = 'שגיאה בהגשת ההזמנה';
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'החיבור איטי מדי - אנא נסה שוב';
      } else if (error.message?.includes('network')) {
        errorMessage = 'בעיית רשת - בדוק את החיבור לאינטרנט';
      } else if (error.message) {
        errorMessage = `שגיאה: ${error.message}`;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [cart, customerName, subtotal, tax, total, companySettings, clearCart, options]);

  /**
   * Complete order after successful payment or for non-payment orders
   */
  const completeOrder = useCallback(async (orderResult, orderData) => {
    try {
      // Update order status to confirmed
      await updateOrder(orderResult.id, {
        ...orderData,
        status: 'confirmed',
        paymentStatus: paymentSession ? 'completed' : 'not_required',
        paymentSessionId: paymentSession?.session_id,
        transactionId: paymentSession?.transaction_id,
        confirmedAt: new Date().toISOString()
      });

      setSnackbar({
        open: true,
        message: `ההזמנה מספר #${orderResult.id} אושרה בהצלחה!`,
        severity: 'success'
      });
      
      // Set order summary for success page
      setOrderSummary({ 
        orderId: orderResult.id,
        customerName: orderData.customerName,
        items: orderData.items,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        total: orderData.total,
        paymentStatus: paymentSession ? 'paid' : 'not_required',
        transactionId: paymentSession?.transaction_id
      });
      
      // Clear cart and reset payment state
      clearCart();
      resetPayment();
      setPaymentRequired(false);
      setPaymentDialog(false);
      
    } catch (error) {
      console.error('❌ Error completing order:', error);
      setSnackbar({
        open: true,
        message: 'שגיאה באישור ההזמנה',
        severity: 'error'
      });
    }
  }, [clearCart, resetPayment, paymentSession]);

  /**
   * Handle successful payment
   */
  const handlePaymentSuccess = useCallback(async (paymentSessionData) => {
    if (!currentOrder) {
      console.error('No current order for payment success');
      return;
    }

    try {
      // Complete the order with payment data
      await completeOrder({ id: currentOrder.orderId }, currentOrder);
      
    } catch (error) {
      console.error('Error handling payment success:', error);
      setSnackbar({
        open: true,
        message: 'התשלום הושלם אך אירעה שגיאה באישור ההזמנה',
        severity: 'warning'
      });
    }
  }, [currentOrder, completeOrder]);

  /**
   * Handle payment failure
   */
  const handlePaymentError = useCallback((error) => {
    setSnackbar({
      open: true,
      message: `שגיאה בתשלום: ${error}`,
      severity: 'error'
    });
    
    // Optionally update order status to payment_failed
    if (currentOrder) {
      updateOrder(currentOrder.orderId, {
        paymentStatus: 'failed',
        paymentError: error,
        status: 'payment_failed'
      }).catch(console.error);
    }
  }, [currentOrder]);

  /**
   * Cancel payment and optionally cancel order
   */
  const cancelPayment = useCallback(async () => {
    setPaymentDialog(false);
    setPaymentRequired(false);
    
    if (currentOrder) {
      try {
        // Update order status to cancelled
        await updateOrder(currentOrder.orderId, {
          status: 'cancelled',
          paymentStatus: 'cancelled',
          cancelledAt: new Date().toISOString()
        });
        
        setSnackbar({
          open: true,
          message: 'התשלום בוטל וההזמנה נמחקה',
          severity: 'info'
        });
      } catch (error) {
        console.error('Error cancelling order:', error);
      }
    }
    
    setCurrentOrder(null);
    resetPayment();
  }, [currentOrder, resetPayment]);

  /**
   * Reset order summary and return to form
   */
  const resetOrderSummary = useCallback(() => {
    setOrderSummary(null);
    setCurrentOrder(null);
    setPaymentRequired(false);
    setPaymentDialog(false);
    resetPayment();
  }, [resetPayment]);

  /**
   * Close snackbar
   */
  const closeSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return {
    // Enhanced state
    isSubmitting,
    isProcessingPayment,
    orderSummary,
    snackbar,
    currentOrder,
    paymentRequired,
    paymentDialog,
    
    // Payment state
    paymentSession,
    paymentStatus,
    paymentError,
    
    // Actions
    submitOrder,
    handlePaymentSuccess,
    handlePaymentError,
    cancelPayment,
    resetOrderSummary,
    closeSnackbar,
    
    // Dialog controls
    setPaymentDialog
  };
};

export default useOrderSubmissionWithPayment;
