# Hypay Payment Integration Setup Guide

This guide walks you through setting up the Hypay payment gateway integration for your e-commerce application.

## Prerequisites

- Active Hypay merchant account
- Supabase project configured
- React application set up with existing order management

## 1. Hypay Account Setup

### Get API Credentials
1. Log into your Hypay merchant dashboard
2. Navigate to **Developer Settings** or **API Keys**
3. Copy your credentials:
   - Merchant ID
   - API Key
   - Secret Key (for webhook verification)

### Configure Webhook URL
1. In your Hypay dashboard, go to **Webhooks** section
2. Add your webhook URL: `https://yourdomain.com/api/hypay/webhook`
3. Select events to receive:
   - `payment.created`
   - `payment.processing`
   - `payment.completed`
   - `payment.failed`
   - `payment.cancelled`
   - `payment.refunded`
   - `payment.expired`

## 2. Environment Configuration

### Create .env file
Copy `.env.example` to `.env` and configure:

```bash
# Hypay Configuration
REACT_APP_HYPAY_BASE_URL=https://api.hypay.com
REACT_APP_HYPAY_MERCHANT_ID=your_merchant_id_here
REACT_APP_HYPAY_API_KEY=your_api_key_here
REACT_APP_HYPAY_SECRET_KEY=your_secret_key_here
REACT_APP_HYPAY_SANDBOX=true  # Set to false for production
```

### For Production
```bash
REACT_APP_HYPAY_SANDBOX=false
REACT_APP_HYPAY_BASE_URL=https://api.hypay.com
```

## 3. Database Setup

### Run Migration
Execute the database migration to create required tables:

```bash
# Using Supabase CLI
supabase db reset --db-url "your_database_url"

# Or run the SQL directly in Supabase dashboard
# Copy contents of database-migrations/008-create-hypay-tables.sql
```

### Verify Tables Created
Check that these tables exist:
- `payment_sessions` - Tracks Hypay payment sessions
- Updated `orders` table with payment columns
- Updated `settings` table with Hypay configuration

## 4. Component Integration

### Basic Integration
Replace your existing OrderForm with the payment-enabled version:

```jsx
// Before
import OrderForm from './components/orderform/OrderForm';

// After
import { OrderFormWithPayment } from './hypay';

function App() {
  return (
    <OrderFormWithPayment
      requirePaymentByDefault={false}  // Optional: require payment for all orders
      allowPaymentToggle={true}        // Allow users to toggle payment requirement
    />
  );
}
```

### Advanced Integration
Use individual components for custom implementations:

```jsx
import { HypayPayment, PaymentDialog, usePayment } from './hypay';

function CustomCheckout() {
  const { processPayment, paymentStatus } = usePayment(orderData, settings);
  
  return (
    <HypayPayment
      orderData={orderData}
      companySettings={settings}
      onPaymentSuccess={handleSuccess}
      onPaymentError={handleError}
    />
  );
}
```

## 5. Webhook Deployment

### Serverless Function (Recommended)

#### Vercel
Create `api/hypay/webhook.js`:

```javascript
import { handleHypayWebhook } from '../../src/hypay/api/webhooks';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  return await handleHypayWebhook(req, res);
}
```

#### Netlify Functions
Create `netlify/functions/hypay-webhook.js`:

```javascript
import { handleHypayWebhook } from '../../src/hypay/api/webhooks';

exports.handler = async (event, context) => {
  const req = {
    method: event.httpMethod,
    headers: event.headers,
    body: JSON.parse(event.body || '{}')
  };
  
  const res = {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'success' })
  };
  
  await handleHypayWebhook(req, res);
  return res;
};
```

### Express.js Integration
```javascript
import express from 'express';
import { handleHypayWebhook, verifyHypayWebhook } from './src/hypay/api/webhooks';

const app = express();

app.use('/api/hypay/webhook', express.json());
app.post('/api/hypay/webhook', verifyHypayWebhook, handleHypayWebhook);
```

## 6. Configuration Options

### Database Settings
Configure payment options via the admin panel or directly in the database:

```sql
UPDATE settings 
SET value = '{
  "enabled": true,
  "sandbox": false,
  "currency": "ILS",
  "paymentMethods": ["credit_card", "paypal", "bit"],
  "paymentExpiryMinutes": 30,
  "requirePaymentOnSubmit": true,
  "webhookEnabled": true,
  "autoConfirmOrders": true,
  "maxRefundDays": 30
}'::jsonb
WHERE key = 'hypay_config';
```

### Company Settings
Update your company configuration to include payment settings:

```javascript
const companySettings = {
  currency: 'ILS',
  taxRate: 17,
  paymentMethods: ['credit_card', 'paypal', 'bit'],
  requirePaymentOnSubmit: true,
  paymentExpiryMinutes: 30
};
```

## 7. Testing

### Sandbox Testing
1. Set `REACT_APP_HYPAY_SANDBOX=true`
2. Use test credit card numbers provided by Hypay
3. Test complete payment flow:
   - Order creation
   - Payment processing
   - Webhook notifications
   - Order confirmation

### Test Payment Cards
Hypay provides test card numbers for different scenarios:
- **Success**: 4580458045804580
- **Decline**: 4000000000000002
- **Insufficient Funds**: 4000000000009995

### Webhook Testing
Use ngrok or similar tools for local webhook testing:

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Use the HTTPS URL in Hypay webhook settings
https://abc123.ngrok.io/api/hypay/webhook
```

## 8. Production Deployment

### Pre-deployment Checklist
- [ ] Environment variables configured
- [ ] Database migration completed
- [ ] Webhook URL configured in Hypay dashboard
- [ ] SSL certificate installed (required for webhooks)
- [ ] Test transactions completed successfully
- [ ] Error monitoring set up

### Go Live Steps
1. Update environment variables for production
2. Set `REACT_APP_HYPAY_SANDBOX=false`
3. Update webhook URL to production endpoint
4. Test with small real transactions
5. Monitor webhook delivery and error logs

## 9. Monitoring & Maintenance

### Error Monitoring
Monitor these key areas:
- Payment session creation failures
- Webhook delivery failures
- Order status synchronization issues
- Expired payment cleanup

### Regular Maintenance
- Clean up expired payment sessions (automated)
- Monitor refund requests and processing
- Review payment analytics and failure rates
- Update payment method configurations as needed

### Logs to Monitor
```javascript
// Key log patterns to watch
console.log('🚀 Submitting order:', orderData);
console.log('✅ Payment session created:', session);
console.log('📥 Received Hypay webhook:', body);
console.error('❌ Payment initialization error:', error);
```

## 10. Support & Troubleshooting

### Common Issues

#### Payment Session Creation Fails
- Check API credentials are correct
- Verify merchant ID and API key
- Ensure order data is properly formatted
- Check network connectivity to Hypay API

#### Webhooks Not Received
- Verify webhook URL is accessible (HTTPS required)
- Check webhook signature verification
- Ensure webhook events are selected in Hypay dashboard
- Monitor server logs for webhook processing errors

#### Payment Status Not Updating
- Check webhook processing logs
- Verify database permissions
- Ensure payment session ID matching
- Check for webhook signature issues

### Getting Help
- Hypay Documentation: [hypay.docs.apiary.io](https://hypay.docs.apiary.io)
- Support Email: support@hypay.com
- Developer Forum: [developers.hypay.com](https://developers.hypay.com)

---

## Security Considerations

1. **Never expose secret keys in client-side code**
2. **Always verify webhook signatures**
3. **Use HTTPS for all payment-related endpoints**
4. **Implement rate limiting on webhook endpoints**
5. **Log payment events for audit trails**
6. **Regular security updates and dependency management**

## Performance Optimization

1. **Cache Hypay settings from database**
2. **Implement webhook retry mechanisms**
3. **Use database indexes for payment queries**
4. **Monitor payment processing response times**
5. **Implement cleanup jobs for old payment sessions**
