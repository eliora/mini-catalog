# Quick Payment Page Setup Guide

This guide shows you how to set up the `/site/quickpayment` page in your React application.

## 📁 Files Created

- **`src/pages/site/QuickPaymentPage.js`** - Main page component
- **`src/pages/site/index.js`** - Page exports
- **`src/routes/SiteRoutes.js`** - Route configuration
- **`examples/SiteQuickPaymentIntegration.js`** - Integration examples

## 🚀 Quick Setup

### Option 1: With React Router (Recommended)

#### 1. Install React Router (if not already installed)
```bash
npm install react-router-dom
```

#### 2. Add Route to Your App.js
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QuickPaymentPage } from './pages/site';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Your existing routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        
        {/* Add the quick payment route */}
        <Route path="/site/quickpayment" element={<QuickPaymentPage />} />
        
        {/* Optional: Redirect for backward compatibility */}
        <Route path="/quickpayment" element={<Navigate to="/site/quickpayment" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

#### 3. Add Navigation Link
```jsx
import { Link } from 'react-router-dom';

// In your navigation component
<Button component={Link} to="/site/quickpayment">
  Quick Payment
</Button>
```

### Option 2: Without React Router

#### Simple State-Based Navigation
```jsx
import { QuickPaymentPage } from './pages/site';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'quickpayment':
        return <QuickPaymentPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <div>
      {/* Navigation */}
      <nav>
        <button onClick={() => setCurrentPage('home')}>Home</button>
        <button onClick={() => setCurrentPage('quickpayment')}>Quick Payment</button>
      </nav>
      
      {/* Page Content */}
      {renderPage()}
    </div>
  );
}
```

### Option 3: Standalone Usage

Use the component directly without routing:

```jsx
import { QuickPaymentPage } from './pages/site';

function PaymentApp() {
  return (
    <div>
      <h1>Payment Portal</h1>
      <QuickPaymentPage />
    </div>
  );
}
```

## ⚙️ Configuration

### Company Settings

The page uses your existing company settings from `CompanyContext`. Make sure you have:

```jsx
const companySettings = {
  companyName: 'Your Company Name',
  supportEmail: 'support@yourcompany.com',
  supportPhone: '03-1234567',
  currency: 'ILS',
  paymentMethods: ['credit_card', 'paypal', 'bit'],
  paymentExpiryMinutes: 30
};
```

### Custom Configuration

You can customize the page by modifying the component props:

```jsx
<QuickPaymentPage
  companySettings={{
    currency: 'USD',
    paymentMethods: ['credit_card', 'paypal']
  }}
  title="Custom Payment Title"
  description="Custom description"
  minAmount={10}
  maxAmount={10000}
  onPaymentSuccess={(session) => {
    console.log('Payment successful:', session);
    // Custom success handling
  }}
/>
```

## 🎯 URL Access

Once set up, users can access the payment page at:

- **Primary URL:** `/site/quickpayment`
- **Redirect URL:** `/quickpayment` (if configured)

## 📱 Mobile Responsive

The page is fully mobile responsive and will automatically adapt to different screen sizes.

## 🔒 Security

The page includes:
- SSL encryption indicators
- PCI DSS compliance badges
- Secure payment processing through Hypay
- Error handling and validation

## 🎨 Customization

### Styling

You can customize the appearance by modifying the component styles:

```jsx
// Custom theme colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#your-brand-color',
    },
  },
});
```

### Branding

Update company information in your context or pass custom props:

```jsx
<QuickPaymentPage
  companySettings={{
    companyName: 'My Brand',
    supportEmail: 'help@mybrand.com'
  }}
/>
```

## 📊 Analytics Integration

The page includes optional Google Analytics tracking:

```jsx
// In your index.html or app
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

Payment events will automatically be tracked when successful.

## 🧪 Testing

### Test the Page

1. Navigate to `/site/quickpayment`
2. Enter a test amount (e.g., 100)
3. Fill in customer details
4. Select payment method
5. Use Hypay sandbox mode for testing

### Test Cases

- ✅ Minimum amount validation
- ✅ Maximum amount validation  
- ✅ Required field validation
- ✅ Payment method selection
- ✅ Success flow
- ✅ Error handling
- ✅ Mobile responsiveness

## 📞 Support

If you need help:

1. Check the **examples** folder for integration examples
2. Review the **Hypay setup guide** for payment configuration
3. Test in sandbox mode before going live

## 🚀 Go Live Checklist

- [ ] Route configured and accessible
- [ ] Company settings populated
- [ ] Hypay credentials configured (production)
- [ ] SSL certificate installed
- [ ] Payment methods tested
- [ ] Mobile layout verified
- [ ] Analytics tracking configured (optional)
- [ ] Support contact information updated

---

Your quick payment page is now ready for production use! 🎉
