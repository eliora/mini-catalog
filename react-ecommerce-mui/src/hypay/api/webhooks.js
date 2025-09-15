/**
 * Webhook Handlers for Hypay Payment Integration
 * 
 * This module handles incoming webhook notifications from Hypay.
 * It processes payment status updates and synchronizes with the local database.
 * 
 * For production deployment, this should be deployed as a serverless function
 * (Vercel, Netlify, AWS Lambda) or integrated into your backend API.
 */

import { supabase } from '../../config/supabase';
import { verifyWebhookSignature } from './hypay';

/**
 * Main webhook handler for Hypay notifications
 * @param {Object} request - HTTP request object
 * @param {Object} response - HTTP response object
 */
export const handleHypayWebhook = async (request, response) => {
  const { body, headers } = request;
  
  try {
    // Verify webhook signature for security
    const signature = headers['x-hypay-signature'] || headers['X-Hypay-Signature'];
    const isValidSignature = await verifyWebhookSignature(
      JSON.stringify(body),
      signature
    );

    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return response.status(401).json({ error: 'Invalid signature' });
    }

    console.log('📥 Received Hypay webhook:', body);

    // Parse webhook data
    const {
      event_type,
      session_id,
      transaction_id,
      status,
      amount,
      currency,
      customer,
      order_id,
      error_message,
      created_at
    } = body;

    // Process different event types
    switch (event_type) {
      case 'payment.created':
        await handlePaymentCreated(session_id, body);
        break;
      
      case 'payment.processing':
        await handlePaymentProcessing(session_id, body);
        break;
      
      case 'payment.completed':
      case 'payment.success':
        await handlePaymentSuccess(session_id, transaction_id, body);
        break;
      
      case 'payment.failed':
      case 'payment.declined':
        await handlePaymentFailed(session_id, body);
        break;
      
      case 'payment.cancelled':
        await handlePaymentCancelled(session_id, body);
        break;
      
      case 'payment.refunded':
        await handlePaymentRefunded(session_id, transaction_id, body);
        break;
      
      case 'payment.expired':
        await handlePaymentExpired(session_id, body);
        break;
      
      default:
        console.warn(`Unknown webhook event type: ${event_type}`);
    }

    // Send success response to Hypay
    response.status(200).json({ 
      status: 'success', 
      message: 'Webhook processed successfully' 
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    
    // Send error response (Hypay will retry)
    response.status(500).json({ 
      status: 'error', 
      message: 'Internal server error' 
    });
  }
};

/**
 * Handle payment created event
 */
const handlePaymentCreated = async (sessionId, data) => {
  try {
    const { error } = await supabase
      .from('payment_sessions')
      .update({
        status: 'created',
        payment_url: data.payment_url,
        updated_at: new Date()
      })
      .eq('session_id', sessionId);

    if (error) throw error;

    console.log(`✅ Payment session ${sessionId} created`);
  } catch (error) {
    console.error(`❌ Error updating payment session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Handle payment processing event
 */
const handlePaymentProcessing = async (sessionId, data) => {
  try {
    const { error } = await supabase
      .from('payment_sessions')
      .update({
        status: 'processing',
        updated_at: new Date()
      })
      .eq('session_id', sessionId);

    if (error) throw error;

    // Update related order status
    await updateOrderStatus(sessionId, 'processing', 'processing');

    console.log(`✅ Payment session ${sessionId} processing`);
  } catch (error) {
    console.error(`❌ Error updating payment processing ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Handle successful payment
 */
const handlePaymentSuccess = async (sessionId, transactionId, data) => {
  try {
    // Update payment session
    const { data: sessionData, error: sessionError } = await supabase
      .from('payment_sessions')
      .update({
        status: 'completed',
        transaction_id: transactionId,
        payment_method: data.payment_method,
        updated_at: new Date()
      })
      .eq('session_id', sessionId)
      .select('order_id')
      .single();

    if (sessionError) throw sessionError;

    // Update related order
    if (sessionData?.order_id) {
      await updateOrderStatus(sessionId, 'confirmed', 'completed', {
        transaction_id: transactionId,
        confirmed_at: new Date()
      });

      // Send confirmation email/notification here if needed
      await sendOrderConfirmation(sessionData.order_id);
    }

    console.log(`✅ Payment ${sessionId} completed successfully`);
  } catch (error) {
    console.error(`❌ Error processing payment success ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Handle failed payment
 */
const handlePaymentFailed = async (sessionId, data) => {
  try {
    // Update payment session
    const { error } = await supabase
      .from('payment_sessions')
      .update({
        status: 'failed',
        error_message: data.error_message || data.decline_reason,
        updated_at: new Date()
      })
      .eq('session_id', sessionId);

    if (error) throw error;

    // Update related order
    await updateOrderStatus(sessionId, 'payment_failed', 'failed', {
      payment_error: data.error_message || data.decline_reason
    });

    console.log(`✅ Payment ${sessionId} marked as failed`);
  } catch (error) {
    console.error(`❌ Error processing payment failure ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Handle cancelled payment
 */
const handlePaymentCancelled = async (sessionId, data) => {
  try {
    // Update payment session
    const { error } = await supabase
      .from('payment_sessions')
      .update({
        status: 'cancelled',
        updated_at: new Date()
      })
      .eq('session_id', sessionId);

    if (error) throw error;

    // Update related order
    await updateOrderStatus(sessionId, 'cancelled', 'cancelled', {
      cancelled_at: new Date()
    });

    console.log(`✅ Payment ${sessionId} cancelled`);
  } catch (error) {
    console.error(`❌ Error processing payment cancellation ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Handle payment refund
 */
const handlePaymentRefunded = async (sessionId, transactionId, data) => {
  try {
    // Update payment session
    const { error } = await supabase
      .from('payment_sessions')
      .update({
        status: 'refunded',
        updated_at: new Date()
      })
      .eq('session_id', sessionId);

    if (error) throw error;

    // Update related order
    await updateOrderStatus(sessionId, 'refunded', 'refunded', {
      refund_amount: data.refund_amount,
      refund_reason: data.refund_reason,
      refunded_at: new Date()
    });

    console.log(`✅ Payment ${sessionId} refunded`);
  } catch (error) {
    console.error(`❌ Error processing payment refund ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Handle expired payment
 */
const handlePaymentExpired = async (sessionId, data) => {
  try {
    // Update payment session
    const { error } = await supabase
      .from('payment_sessions')
      .update({
        status: 'expired',
        updated_at: new Date()
      })
      .eq('session_id', sessionId);

    if (error) throw error;

    // Update related order
    await updateOrderStatus(sessionId, 'payment_expired', 'expired');

    console.log(`✅ Payment ${sessionId} expired`);
  } catch (error) {
    console.error(`❌ Error processing payment expiration ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Update order status based on payment status
 */
const updateOrderStatus = async (sessionId, orderStatus, paymentStatus, additionalFields = {}) => {
  try {
    const updateData = {
      status: orderStatus,
      payment_status: paymentStatus,
      payment_session_id: sessionId,
      updated_at: new Date(),
      ...additionalFields
    };

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('payment_session_id', sessionId);

    if (error) throw error;

    console.log(`✅ Order updated for session ${sessionId}: ${orderStatus}/${paymentStatus}`);
  } catch (error) {
    console.error(`❌ Error updating order for session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Send order confirmation (placeholder for email/SMS notifications)
 */
const sendOrderConfirmation = async (orderId) => {
  try {
    // Get order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;

    console.log(`📧 Order confirmation for #${orderId}:`, order);

    // TODO: Implement actual email/SMS sending
    // - Send email to customer
    // - Send notification to admin
    // - Update inventory if needed
    // - Trigger fulfillment process

    return order;
  } catch (error) {
    console.error(`❌ Error sending confirmation for order ${orderId}:`, error);
    // Don't throw - confirmation failure shouldn't break payment processing
  }
};

/**
 * Verify webhook authenticity (middleware function)
 */
export const verifyHypayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-hypay-signature'] || req.headers['X-Hypay-Signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);
    
    const isValid = await verifyWebhookSignature(rawBody, signature);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    
    next();
  } catch (error) {
    console.error('Webhook verification error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
};

/**
 * Cleanup expired payment sessions (can be run as a cron job)
 */
export const cleanupExpiredSessions = async () => {
  try {
    const { data, error } = await supabase.rpc('cleanup_expired_payment_sessions');
    
    if (error) throw error;
    
    console.log(`🧹 Cleaned up ${data} expired payment sessions`);
    return data;
  } catch (error) {
    console.error('❌ Error cleaning up expired sessions:', error);
    throw error;
  }
};

export default {
  handleHypayWebhook,
  verifyHypayWebhook,
  cleanupExpiredSessions
};
