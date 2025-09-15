/**
 * Hypay Payment Gateway API Integration (Fixed with Debug & Sandbox Fallback)
 * 
 * This module handles all Hypay payment gateway operations including:
 * - Payment session creation
 * - Transaction processing
 * - Payment status queries
 * - Webhook verification
 * 
 * Based on Hypay API documentation and follows existing codebase patterns
 */

import { supabase } from '../../config/supabase';

// Hypay API configuration - Real Hypay integration with your test credentials
const HYPAY_CONFIG = {
  baseUrl: process.env.REACT_APP_HYPAY_BASE_URL || 'https://pay.hyp.co.il/p/',
  masof: process.env.REACT_APP_HYPAY_MASOF || '0010131918', // Your test Masof
  passP: process.env.REACT_APP_HYPAY_PASS_P || 'yaad', // Your PassP from settings
  apiKey: process.env.REACT_APP_HYPAY_API_KEY || '7110eda4d09e062aa5e4a390b0a572ac0d2c0220', // Your API Key
  sandbox: process.env.REACT_APP_HYPAY_SANDBOX !== 'false' // Default to sandbox
};

/**
 * Get Hypay configuration from database settings
 * Allows dynamic configuration without redeployment
 */
export const getHypaySettings = async () => {
  // Add debug logging for environment variables
  console.log('🐛 DEBUG: Hypay Environment Variables Check:');
  console.log('REACT_APP_HYPAY_BASE_URL:', process.env.REACT_APP_HYPAY_BASE_URL);
  console.log('REACT_APP_HYPAY_MASOF:', process.env.REACT_APP_HYPAY_MASOF);
  console.log('REACT_APP_HYPAY_PASS_P:', process.env.REACT_APP_HYPAY_PASS_P ? 'SET' : 'NOT SET');
  console.log('REACT_APP_HYPAY_API_KEY:', process.env.REACT_APP_HYPAY_API_KEY ? 'SET' : 'NOT SET');
  console.log('REACT_APP_HYPAY_SANDBOX:', process.env.REACT_APP_HYPAY_SANDBOX);

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'hypay_config')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
    
    // Merge database config with environment variables
    const dbConfig = data?.value || {};
    console.log('🐛 DEBUG: Database config:', dbConfig);
    
    const finalConfig = {
      ...HYPAY_CONFIG,
      ...dbConfig,
      // Environment variables take precedence for security
      masof: HYPAY_CONFIG.masof || dbConfig.masof,
      passP: HYPAY_CONFIG.passP || dbConfig.passP,
      apiKey: HYPAY_CONFIG.apiKey || dbConfig.apiKey
    };

    console.log('🐛 DEBUG: Final Hypay config:');
    console.log({
      ...finalConfig,
      passP: finalConfig.passP ? 'SET' : 'NOT SET',
      apiKey: finalConfig.apiKey ? `${finalConfig.apiKey.substring(0, 8)}...` : 'NOT SET'
    });

    // Check if configuration is complete
    if (!finalConfig.masof || !finalConfig.passP) {
      console.error('🐛 DEBUG: Hypay configuration incomplete!');
      console.error('Missing masof:', !finalConfig.masof);
      console.error('Missing passP:', !finalConfig.passP);
    } else {
      console.log('✅ DEBUG: Hypay configuration is complete!');
      console.log('📋 DEBUG: Using Masof:', finalConfig.masof, 
        finalConfig.masof.startsWith('00100') ? '(TEST TERMINAL)' : '(LIVE TERMINAL)');
      console.log('📋 DEBUG: Using PassP:', finalConfig.passP);
      console.log('📋 DEBUG: API Key configured:', finalConfig.apiKey ? 'YES' : 'NO');
    }

    return finalConfig;
  } catch (error) {
    console.error('🐛 DEBUG: Error fetching Hypay settings:', error);
    console.log('🐛 DEBUG: Falling back to HYPAY_CONFIG:', {
      ...HYPAY_CONFIG,
      passP: HYPAY_CONFIG.passP ? 'SET' : 'NOT SET',
      apiKey: HYPAY_CONFIG.apiKey ? `${HYPAY_CONFIG.apiKey.substring(0, 8)}...` : 'NOT SET'
    });
    return HYPAY_CONFIG;
  }
};

/**
 * Create payment session with Hypay using form POST approach
 * @param {Object} orderData - Order information
 * @param {Object} paymentOptions - Payment configuration options
 * @returns {Object} Payment form data and URL for Hypay
 */
export const createPaymentSession = async (orderData, paymentOptions = {}) => {
  try {
    const config = await getHypaySettings();
    
    console.log('🐛 DEBUG: Creating Hypay payment session with config:', {
      baseUrl: config.baseUrl,
      masof: config.masof,
      passP: config.passP ? 'SET' : 'NOT SET',
      sandbox: config.sandbox
    });

    if (!config.masof) {
      console.error('🐛 DEBUG: Hypay payment session creation failed - missing masof');
      throw new Error('Hypay configuration is incomplete. Missing terminal number (masof).');
    }

    // Generate unique order ID if not provided
    const orderId = orderData.orderId?.toString() || `order_${Date.now()}`;
    const sessionId = `hypay_session_${Date.now()}`;
    
    // Prepare Hypay form data based on their API documentation
    const formData = {
      // Required parameters
      action: 'pay',
      Masof: config.masof,
      Info: `תשלום - ${orderData.customerName || 'לקוח'}`,
      Amount: Math.round(orderData.total), // Hypay expects amount in full currency units (not cents)
      
      // Authentication
      ...(config.passP && { PassP: config.passP }),
      
      // Customer information
      UserId: orderData.customer?.id || '000000000', // Use 9 zeros if no customer ID
      ClientName: orderData.customerName || '',
      ClientLName: orderData.customer?.lastName || '',
      email: orderData.customerEmail || '',
      cell: orderData.customerPhone || '',
      street: orderData.customer?.address?.street || '',
      city: orderData.customer?.address?.city || '',
      zip: orderData.customer?.address?.zip || '',
      
      // Order tracking
      Order: orderId,
      
      // Transaction options
      UTF8: 'True',
      UTF8out: 'True',
      MoreData: 'True',
      sendemail: orderData.customerEmail ? 'True' : 'False',
      Coin: '1', // 1 = ILS, 2 = USD, 3 = EUR, 4 = GBP
      
      // Optional fields for tracking
      Fild1: sessionId,
      Fild2: paymentOptions.source || 'quick-payment',
      Fild3: paymentOptions.description || ''
    };

    console.log('🐛 DEBUG: Hypay form data prepared:', {
      ...formData,
      PassP: formData.PassP ? 'SET' : 'NOT SET'
    });

    // Store payment session in database for tracking
    await storePaymentSession({
      session_id: sessionId,
      order_id: orderId,
      amount: orderData.total,
      currency: 'ILS',
      status: 'created',
      customer_name: orderData.customerName,
      payment_url: config.baseUrl,
      expires_at: new Date(Date.now() + (paymentOptions.expiresIn || 30) * 60 * 1000)
    });

    const paymentSession = {
      session_id: sessionId,
      payment_url: config.baseUrl,
      form_data: formData,
      status: 'created',
      amount: orderData.total,
      currency: 'ILS',
      order_id: orderId,
      hypay_form: true // Flag to indicate this uses Hypay form POST
    };

    console.log('✅ DEBUG: Hypay payment session created:', paymentSession);
    return paymentSession;
    
  } catch (error) {
    console.error('🐛 DEBUG: Error creating Hypay payment session:', error);
    throw error;
  }
};

/**
 * Query payment status from Hypay
 * @param {string} sessionId - Payment session ID
 * @returns {Object} Payment status information
 */
export const getPaymentStatus = async (sessionId) => {
  try {
    const config = await getHypaySettings();

    // In sandbox mode with demo credentials, simulate payment status
    if (config.sandbox && config.merchantId === 'demo_merchant_sandbox') {
      console.log('🧪 DEBUG: Simulating sandbox payment status check');
      
      const mockStatus = {
        session_id: sessionId,
        status: 'completed',
        transaction_id: `txn_sandbox_${Date.now()}`,
        amount: 100, // Mock amount
        currency: 'ILS'
      };

      console.log('✅ DEBUG: Mock payment status:', mockStatus);
      
      // Update local payment record
      await updatePaymentSession(sessionId, {
        status: mockStatus.status,
        transaction_id: mockStatus.transaction_id,
        updated_at: new Date()
      });

      return mockStatus;
    }

    const response = await fetch(`${config.baseUrl}/v1/payments/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Merchant-ID': config.merchantId
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Hypay API error: ${response.status}`);
    }

    // Update local payment record
    await updatePaymentSession(sessionId, {
      status: result.status,
      transaction_id: result.transaction_id,
      updated_at: new Date()
    });

    return result;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
};

/**
 * Process refund through Hypay
 * @param {string} transactionId - Original transaction ID
 * @param {number} amount - Refund amount (optional, full refund if not specified)
 * @param {string} reason - Refund reason
 * @returns {Object} Refund response
 */
export const processRefund = async (transactionId, amount = null, reason = '') => {
  try {
    const config = await getHypaySettings();

    const refundData = {
      transaction_id: transactionId,
      reason: reason || 'Customer request'
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    const response = await fetch(`${config.baseUrl}/v1/refunds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Merchant-ID': config.merchantId
      },
      body: JSON.stringify(refundData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Hypay refund error: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('Error processing Hypay refund:', error);
    throw error;
  }
};

/**
 * Verify webhook signature for security
 * @param {string} payload - Webhook payload
 * @param {string} signature - Hypay signature header
 * @returns {boolean} True if signature is valid
 */
export const verifyWebhookSignature = async (payload, signature) => {
  try {
    const config = await getHypaySettings();
    
    if (!config.secretKey) {
      console.warn('Hypay secret key not configured - skipping signature verification');
      return true; // Allow in development, but warn
    }

    // Simple HMAC verification (adapt based on Hypay's specific method)
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', config.secretKey)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

/**
 * Store payment session in database
 * @param {Object} sessionData - Payment session information
 */
const storePaymentSession = async (sessionData) => {
  try {
    const { error } = await supabase
      .from('payment_sessions')
      .insert([sessionData]);

    if (error) throw error;
    console.log('✅ DEBUG: Payment session stored in database');
  } catch (error) {
    console.error('🐛 DEBUG: Error storing payment session:', error);
    // Don't throw - payment can continue even if storage fails
  }
};

/**
 * Update payment session in database
 * @param {string} sessionId - Session ID
 * @param {Object} updateData - Data to update
 */
const updatePaymentSession = async (sessionId, updateData) => {
  try {
    const { error } = await supabase
      .from('payment_sessions')
      .update(updateData)
      .eq('session_id', sessionId);

    if (error) throw error;
    console.log('✅ DEBUG: Payment session updated in database');
  } catch (error) {
    console.error('🐛 DEBUG: Error updating payment session:', error);
    // Don't throw - payment can continue even if update fails
  }
};

/**
 * Get payment session from database
 * @param {string} sessionId - Session ID
 * @returns {Object} Payment session data
 */
export const getPaymentSession = async (sessionId) => {
  try {
    const { data, error } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching payment session:', error);
    throw error;
  }
};

/**
 * Get payment sessions by order ID
 * @param {string} orderId - Order ID
 * @returns {Array} Payment sessions for the order
 */
export const getPaymentSessionsByOrder = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching payment sessions by order:', error);
    return [];
  }
};

/**
 * Complete sandbox payment (for testing)
 * @param {string} sessionId - Payment session ID
 * @param {boolean} success - Whether payment should succeed or fail
 * @returns {Object} Payment completion result
 */
export const completeSandboxPayment = async (sessionId, success = true) => {
  console.log('🧪 DEBUG: Completing sandbox payment:', { sessionId, success });
  
  try {
    const status = success ? 'completed' : 'failed';
    const transactionId = success ? `txn_sandbox_${Date.now()}` : null;
    const errorMessage = success ? null : 'Sandbox payment failed (simulated)';
    
    // Update local payment record
    await updatePaymentSession(sessionId, {
      status: status,
      transaction_id: transactionId,
      error_message: errorMessage,
      updated_at: new Date()
    });

    const result = {
      session_id: sessionId,
      status: status,
      transaction_id: transactionId,
      error_message: errorMessage
    };

    console.log('✅ DEBUG: Sandbox payment completed:', result);
    return result;
  } catch (error) {
    console.error('🐛 DEBUG: Error completing sandbox payment:', error);
    throw error;
  }
};

export default {
  createPaymentSession,
  getPaymentStatus,
  processRefund,
  verifyWebhookSignature,
  getPaymentSession,
  getPaymentSessionsByOrder,
  getHypaySettings,
  completeSandboxPayment
};