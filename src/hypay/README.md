# Hypay Payment Module

Complete payment gateway integration for React e-commerce applications.

## 📁 Module Structure

```
src/hypay/
├── api/                    # API integration
│   ├── hypay.js           # Main Hypay API wrapper
│   └── webhooks.js        # Webhook handling
├── hooks/                 # React hooks
│   ├── usePayment.js      # Payment processing hook
│   ├── useOrderSubmissionWithPayment.js  # Enhanced order submission
│   └── index.js           # Hooks exports
├── components/            # React components
│   ├── HypayPayment.js    # Payment interface component
│   ├── PaymentDialog.js   # Payment modal dialog
│   ├── OrderFormWithPayment.js  # Enhanced order form
│   └── index.js           # Components exports
├── index.js               # Main module export
└── README.md              # This file
```

## 🚀 Quick Start

### Basic Usage
```jsx
import { OrderFormWithPayment } from './hypay';

function App() {
  return <OrderFormWithPayment requirePaymentByDefault={true} />;
}
```

### Custom Implementation
```jsx
import { HypayPayment, usePayment } from './hypay';

function MyCheckout() {
  const { processPayment, paymentStatus } = usePayment(orderData, settings);
  
  return (
    <HypayPayment
      orderData={orderData}
      companySettings={settings}
      onPaymentSuccess={handleSuccess}
    />
  );
}
```

### Quick Payment Page
```jsx
import { QuickPaymentPage } from './hypay';

function PaymentPage() {
  return (
    <QuickPaymentPage
      title="תרומה לארגון"
      description="תרומתך חשובה לנו"
      minAmount={10}
      maxAmount={5000}
      companySettings={{ currency: 'ILS' }}
      onPaymentSuccess={(session) => {
        console.log('Payment successful:', session);
      }}
    />
  );
}
```

## 📖 API Reference

### Components

#### `<HypayPayment />`
Main payment component with inline payment interface.

**Props:**
- `orderData` - Order information object
- `companySettings` - Company/payment settings
- `onPaymentSuccess` - Success callback function
- `onPaymentError` - Error callback function
- `onCancel` - Cancel callback function
- `disabled` - Disable payment controls

#### `<PaymentDialog />`
Modal dialog for payment processing.

**Props:**
- `open` - Boolean to control dialog visibility
- `onClose` - Close callback function
- `orderData` - Order information object
- `companySettings` - Company/payment settings
- `onPaymentSuccess` - Success callback function
- `onPaymentError` - Error callback function
- `title` - Dialog title (optional)

#### `<OrderFormWithPayment />`
Enhanced order form with integrated payment processing.

**Props:**
- `requirePaymentByDefault` - Boolean to require payment by default
- `allowPaymentToggle` - Boolean to allow payment toggle control

#### `<QuickPaymentPage />`
Standalone payment page where users can input any payment amount.

**Props:**
- `companySettings` - Company/payment settings object
- `onPaymentSuccess` - Success callback function
- `onPaymentError` - Error callback function
- `defaultCurrency` - Default currency (default: 'ILS')
- `minAmount` - Minimum payment amount (default: 1)
- `maxAmount` - Maximum payment amount (default: 10000)
- `title` - Page title (default: 'תשלום מהיר')
- `description` - Page description

### Hooks

#### `usePayment(orderData, companySettings)`
Core payment processing hook.

**Returns:**
```javascript
{
  // State
  isProcessingPayment,
  paymentSession,
  paymentStatus, // 'idle', 'pending', 'success', 'failed', 'cancelled'
  paymentError,
  redirectUrl,
  
  // Actions
  initializePayment,
  processPayment,
  openPaymentWindow,
  cancelPayment,
  resetPayment,
  refundPayment,
  loadPaymentSession
}
```

#### `useOrderSubmissionWithPayment(...)`
Enhanced order submission with payment integration.

**Parameters:**
- `cart` - Cart items array
- `customerName` - Customer name string
- `subtotal` - Order subtotal number
- `tax` - Tax amount number
- `total` - Total amount number
- `companySettings` - Company settings object
- `clearCart` - Function to clear cart
- `options` - Additional options object

**Returns:**
```javascript
{
  // Enhanced state
  isSubmitting,
  isProcessingPayment,
  orderSummary,
  snackbar,
  currentOrder,
  paymentRequired,
  paymentDialog,
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
  setPaymentDialog
}
```

### API Functions

#### `createPaymentSession(orderData, paymentOptions)`
Create a new payment session with Hypay.

#### `getPaymentStatus(sessionId)`
Query the current status of a payment session.

#### `processRefund(transactionId, amount, reason)`
Process a refund for a completed transaction.

#### `getPaymentSession(sessionId)`
Retrieve payment session data from database.

#### `handleHypayWebhook(request, response)`
Handle incoming webhook notifications from Hypay.

## 🔧 Configuration

### Environment Variables
```bash
REACT_APP_HYPAY_MERCHANT_ID=your_merchant_id
REACT_APP_HYPAY_API_KEY=your_api_key
REACT_APP_HYPAY_SECRET_KEY=your_secret_key
REACT_APP_HYPAY_SANDBOX=true
```

### Database Setup
Run the migration: `database-migrations/008-create-hypay-tables.sql`

### Webhook Configuration
Deploy webhook handler and configure URL in Hypay dashboard.

## 🎨 Features

- ✅ Multiple payment methods (Credit Card, PayPal, Bit)
- ✅ Real-time payment status tracking
- ✅ Secure webhook verification
- ✅ Hebrew RTL interface
- ✅ Mobile responsive design
- ✅ MUI Material Design components
- ✅ Automatic order status synchronization
- ✅ Comprehensive error handling
- ✅ Payment session management
- ✅ Refund processing support
- ✅ Quick payment page for custom amounts
- ✅ Step-by-step payment flow
- ✅ Flexible payment purposes (donations, deposits, etc.)
- ✅ Multi-currency support

## 📚 Documentation

- **Setup Guide:** `../../HYPAY_SETUP_GUIDE.md`
- **Complete Overview:** `../../HYPAY_MODULE_SUMMARY.md`
- **Examples:** `../../examples/HypayIntegrationExample.js`
- **Quick Payment Examples:** `../../examples/QuickPaymentExample.js`

## 🔒 Security

- Environment-based API key management
- Webhook signature verification
- Row Level Security (RLS) policies
- HTTPS-only communication
- PCI DSS compliant architecture

## 🐛 Troubleshooting

### Common Issues

**Payment Session Creation Fails:**
- Check API credentials in environment variables
- Verify merchant ID and API key are correct
- Ensure network connectivity to Hypay API

**Webhooks Not Received:**
- Verify webhook URL is accessible (HTTPS required)
- Check webhook signature verification
- Monitor server logs for webhook processing errors

**Payment Status Not Updating:**
- Check webhook processing logs
- Verify database permissions
- Ensure payment session ID matching

## 📞 Support

- Hypay Documentation: [hypay.docs.apiary.io](https://hypay.docs.apiary.io)
- Module Issues: Check the setup guide and examples
- Development Help: Review the comprehensive JSDoc comments in source files

---

**Version:** 1.0.0  
**License:** MIT  
**Dependencies:** React, MUI, Supabase
