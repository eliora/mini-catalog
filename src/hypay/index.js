/**
 * Hypay Payment Module - Main Export
 * 
 * Complete Hypay payment gateway integration for React e-commerce applications.
 * This module provides all the necessary components, hooks, and API functions
 * to integrate Hypay payment processing into your existing application.
 * 
 * Features:
 * - Payment session management
 * - Real-time payment status tracking
 * - Webhook handling for payment notifications
 * - Hebrew RTL interface support
 * - Mobile-responsive design
 * - MUI Material Design components
 * - Security-first approach with signature verification
 */

// API Functions
export {
  createPaymentSession,
  getPaymentStatus,
  processRefund,
  getPaymentSession,
  getPaymentSessionsByOrder,
  getHypaySettings,
  verifyWebhookSignature
} from './api/hypay';

export {
  handleHypayWebhook,
  verifyHypayWebhook,
  cleanupExpiredSessions
} from './api/webhooks';

// React Hooks
export {
  usePayment,
  useOrderSubmissionWithPayment
} from './hooks';

// React Components
export {
  HypayPayment,
  PaymentDialog,
  OrderFormWithPayment,
  QuickPaymentPage
} from './components';

// Default export for convenience
export { default as Hypay } from './api/hypay';
