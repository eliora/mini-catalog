/**
 * usePayment Hook
 * 
 * Custom hook for handling Hypay payment integration with existing order flow.
 * Manages payment session creation, status tracking, and error handling.
 * 
 * Integrates seamlessly with existing useOrderSubmission hook pattern.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  createPaymentSession, 
  getPaymentStatus, 
  getPaymentSession,
  processRefund,
  completeSandboxPayment
} from '../api/hypay';

export const usePayment = (orderData, companySettings) => {
  // Payment state management
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSession, setPaymentSession] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, pending, success, failed, cancelled
  const [paymentError, setPaymentError] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState(null);
  
  // For tracking payment window/popup
  const paymentWindowRef = useRef(null);
  const statusCheckIntervalRef = useRef(null);

  /**
   * Initialize payment session with Hypay
   * @param {Object} options - Payment options (currency, methods, etc.)
   * @returns {Object} Payment session data
   */
  const initializePayment = useCallback(async (options = {}) => {
    if (!orderData) {
      throw new Error('Order data is required for payment initialization');
    }

    setIsProcessingPayment(true);
    setPaymentError(null);
    
    try {
      // Get payment settings from company configuration
      const paymentOptions = {
        currency: companySettings?.currency || 'ILS',
        methods: companySettings?.paymentMethods || ['credit_card', 'paypal', 'bit'],
        expiresIn: companySettings?.paymentExpiryMinutes || 30,
        ...options
      };

      console.log('🔄 Initializing Hypay payment session...', { orderData, paymentOptions });
      
      const session = await createPaymentSession(orderData, paymentOptions);
      
      setPaymentSession(session);
      setPaymentStatus('pending');
      setRedirectUrl(session.payment_url);
      
      console.log('✅ Payment session created:', session);
      
      return session;
    } catch (error) {
      console.error('❌ Payment initialization error:', error);
      setPaymentError(error.message);
      setPaymentStatus('failed');
      throw error;
    } finally {
      setIsProcessingPayment(false);
    }
  }, [orderData, companySettings]);

  /**
   * Stop status polling
   */
  const stopStatusPolling = useCallback(() => {
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
  }, []);

  /**
   * Start polling payment status
   */
  const startStatusPolling = useCallback(() => {
    if (!paymentSession?.session_id) return;

    // Clear any existing interval
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
    }

    statusCheckIntervalRef.current = setInterval(async () => {
      try {
        // Check if payment window is still open
        if (paymentWindowRef.current?.closed) {
          stopStatusPolling();
          setPaymentStatus('cancelled');
          return;
        }

        const status = await getPaymentStatus(paymentSession.session_id);
        
        if (status.status === 'completed' || status.status === 'success') {
          setPaymentStatus('success');
          setPaymentSession(prev => ({ ...prev, ...status }));
          stopStatusPolling();
          
          // Close payment window
          if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
            paymentWindowRef.current.close();
          }
        } else if (status.status === 'failed' || status.status === 'declined') {
          setPaymentStatus('failed');
          setPaymentError(status.error_message || 'Payment failed');
          stopStatusPolling();
        } else if (status.status === 'expired') {
          setPaymentStatus('failed');
          setPaymentError('Payment session expired');
          stopStatusPolling();
        }
        
        // Update session with latest status
        setPaymentSession(prev => ({ ...prev, ...status }));
        
      } catch (error) {
        console.error('Error checking payment status:', error);
        // Don't stop polling for temporary errors
      }
    }, 3000); // Check every 3 seconds
  }, [paymentSession?.session_id, stopStatusPolling]);

  /**
   * Open Hypay payment form using POST method
   * @param {string} paymentUrl - Hypay payment URL
   * @param {Object} formData - Form data to post
   */
  const openHypayPaymentForm = useCallback((paymentUrl, formData) => {
    console.log('🚀 DEBUG: Opening Hypay payment form', { paymentUrl, formData });
    
    // Create a temporary form element
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;
    form.target = '_blank'; // Open in new window
    form.style.display = 'none';

    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    // Add form to document and submit
    document.body.appendChild(form);
    
    try {
      form.submit();
      console.log('✅ DEBUG: Hypay form submitted successfully');
      
      // Start polling for payment status
      startStatusPolling();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(form);
      }, 1000);
      
    } catch (error) {
      console.error('❌ DEBUG: Error submitting Hypay form:', error);
      setPaymentError('Failed to open payment page');
      document.body.removeChild(form);
    }
  }, [startStatusPolling]);

  /**
   * Open payment in new window/popup
   * @param {string} paymentUrl - Hypay payment URL
   * @param {Object} windowOptions - Window options
   */
  const openPaymentWindow = useCallback((paymentUrl, windowOptions = {}) => {
    const defaultOptions = {
      width: 600,
      height: 700,
      scrollbars: 'yes',
      resizable: 'yes',
      toolbar: 'no',
      location: 'no',
      directories: 'no',
      status: 'no',
      menubar: 'no',
      copyhistory: 'no'
    };

    const options = { ...defaultOptions, ...windowOptions };
    const optionsString = Object.entries(options)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');

    // Close any existing payment window
    if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
      paymentWindowRef.current.close();
    }

    paymentWindowRef.current = window.open(paymentUrl, 'HypayPayment', optionsString);
    
    if (paymentWindowRef.current) {
      paymentWindowRef.current.focus();
      startStatusPolling();
    } else {
      // Popup blocked - redirect to payment page
      setPaymentError('Popup blocked. Redirecting to payment page...');
      setTimeout(() => {
        window.location.href = paymentUrl;
      }, 2000);
    }
  }, [startStatusPolling]);

  /**
   * Process payment flow (initialize + handle Hypay form/real payment)
   * @param {Object} options - Payment options
   */
  const processPayment = useCallback(async (options = {}) => {
    try {
      const session = await initializePayment(options);
      
      // Handle Hypay form POST approach
      if (session.hypay_form && session.form_data) {
        console.log('🧪 DEBUG: Hypay form mode detected - creating form POST');
        
        openHypayPaymentForm(session.payment_url, session.form_data);
        return session;
      }
      
      // Fallback - open payment window if payment_url exists
      if (session.payment_url) {
        openPaymentWindow(session.payment_url);
      }
      
      return session;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }, [initializePayment, openPaymentWindow, openHypayPaymentForm]);

  /**
   * Cancel current payment session
   */
  const cancelPayment = useCallback(() => {
    setPaymentStatus('cancelled');
    stopStatusPolling();
    
    if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
      paymentWindowRef.current.close();
    }
  }, [stopStatusPolling]);

  /**
   * Reset payment state
   */
  const resetPayment = useCallback(() => {
    setPaymentSession(null);
    setPaymentStatus('idle');
    setPaymentError(null);
    setRedirectUrl(null);
    setIsProcessingPayment(false);
    stopStatusPolling();
    
    if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
      paymentWindowRef.current.close();
    }
  }, [stopStatusPolling]);

  /**
   * Process refund for a completed payment
   * @param {number} amount - Refund amount (optional)
   * @param {string} reason - Refund reason
   */
  const refundPayment = useCallback(async (amount = null, reason = '') => {
    if (!paymentSession?.transaction_id) {
      throw new Error('No transaction ID available for refund');
    }

    try {
      setIsProcessingPayment(true);
      
      const result = await processRefund(
        paymentSession.transaction_id,
        amount,
        reason
      );
      
      console.log('✅ Refund processed:', result);
      return result;
    } catch (error) {
      console.error('❌ Refund error:', error);
      throw error;
    } finally {
      setIsProcessingPayment(false);
    }
  }, [paymentSession?.transaction_id]);

  /**
   * Load existing payment session by ID
   * @param {string} sessionId - Payment session ID
   */
  const loadPaymentSession = useCallback(async (sessionId) => {
    try {
      setIsProcessingPayment(true);
      
      const session = await getPaymentSession(sessionId);
      setPaymentSession(session);
      
      // Determine status based on session data
      if (session.status === 'completed' || session.status === 'success') {
        setPaymentStatus('success');
      } else if (session.status === 'failed' || session.status === 'declined') {
        setPaymentStatus('failed');
        setPaymentError(session.error_message || 'Payment failed');
      } else if (session.status === 'expired') {
        setPaymentStatus('failed');
        setPaymentError('Payment session expired');
      } else {
        setPaymentStatus('pending');
      }
      
      return session;
    } catch (error) {
      console.error('Error loading payment session:', error);
      setPaymentError(error.message);
      throw error;
    } finally {
      setIsProcessingPayment(false);
    }
  }, []);

  /**
   * Manually complete sandbox payment (for testing)
   * @param {boolean} success - Whether payment should succeed
   */
  const completeSandboxManually = useCallback(async (success = true) => {
    if (!paymentSession?.session_id || !paymentSession?.sandbox_mode) {
      console.warn('No sandbox payment session to complete');
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      await completeSandboxPayment(paymentSession.session_id, success);
      
      if (success) {
        setPaymentStatus('success');
        setPaymentSession(prev => ({
          ...prev,
          status: 'completed',
          transaction_id: `txn_sandbox_${Date.now()}`
        }));
      } else {
        setPaymentStatus('failed');
        setPaymentError('Sandbox payment failed (manual test)');
      }
    } catch (error) {
      console.error('Error completing sandbox payment manually:', error);
      setPaymentError(error.message);
    } finally {
      setIsProcessingPayment(false);
    }
  }, [paymentSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStatusPolling();
      if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
        paymentWindowRef.current.close();
      }
    };
  }, [stopStatusPolling]);

  return {
    // State
    isProcessingPayment,
    paymentSession,
    paymentStatus,
    paymentError,
    redirectUrl,
    
    // Actions
    initializePayment,
    processPayment,
    openPaymentWindow,
    openHypayPaymentForm,
    cancelPayment,
    resetPayment,
    refundPayment,
    loadPaymentSession,
    completeSandboxManually,
    
    // Utilities
    startStatusPolling,
    stopStatusPolling
  };
};

export default usePayment;
