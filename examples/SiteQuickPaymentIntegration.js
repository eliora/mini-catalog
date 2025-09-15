/**
 * Site Quick Payment Integration Examples
 * 
 * This file demonstrates how to integrate the site/quickpayment page
 * into your React application with different routing setups.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';

// Import the site page
import { QuickPaymentPage } from '../src/pages/site';

// Example 1: Basic React Router Integration
const BasicRouterExample = () => {
  return (
    <BrowserRouter>
      <Box sx={{ flexGrow: 1 }}>
        {/* Navigation Header */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              My E-commerce Site
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Home
            </Button>
            <Button color="inherit" component={Link} to="/site/quickpayment">
              Quick Payment
            </Button>
          </Toolbar>
        </AppBar>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/site/quickpayment" element={<QuickPaymentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
};

// Example 2: Integration with Existing App Structure
const ExistingAppIntegration = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        
        {/* Add the quick payment route */}
        <Route path="/site/quickpayment" element={<QuickPaymentPage />} />
        
        {/* Backward compatibility redirect */}
        <Route path="/quickpayment" element={<Navigate to="/site/quickpayment" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

// Example 3: Conditional Routing (for apps without React Router)
const ConditionalRenderingExample = () => {
  const [currentPage, setCurrentPage] = React.useState('home');

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
    <Box>
      {/* Simple Navigation */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Site
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => setCurrentPage('home')}
          >
            Home
          </Button>
          <Button 
            color="inherit" 
            onClick={() => setCurrentPage('quickpayment')}
          >
            Quick Payment
          </Button>
        </Toolbar>
      </AppBar>

      {/* Page Content */}
      {renderPage()}
    </Box>
  );
};

// Example 4: Full App.js Integration Example
const AppIntegrationExample = () => {
  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Mini Catalog
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Catalog
            </Button>
            <Button color="inherit" component={Link} to="/orders">
              Orders
            </Button>
            <Button color="inherit" component={Link} to="/site/quickpayment">
              Quick Pay
            </Button>
            <Button color="inherit" component={Link} to="/admin">
              Admin
            </Button>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/orders/*" element={<OrdersPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            
            {/* Quick Payment Page */}
            <Route path="/site/quickpayment" element={<QuickPaymentPage />} />
            
            {/* Redirects */}
            <Route path="/quickpayment" element={<Navigate to="/site/quickpayment" replace />} />
          </Routes>
        </Box>

        {/* Footer */}
        <Box component="footer" sx={{ py: 2, bgcolor: 'grey.100', mt: 'auto' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              © 2024 My E-commerce Site. Powered by Hypay.
            </Typography>
          </Container>
        </Box>
      </Box>
    </BrowserRouter>
  );
};

// Example 5: Standalone Usage (without routing)
const StandaloneUsage = () => {
  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        Quick Payment Demo
      </Typography>
      
      {/* Use the component directly */}
      <QuickPaymentPage />
    </Box>
  );
};

// Helper Components (placeholders)
const HomePage = () => (
  <Container sx={{ py: 4 }}>
    <Typography variant="h3" gutterBottom>Welcome to Our Site</Typography>
    <Typography>This is the home page.</Typography>
    <Button variant="contained" component={Link} to="/site/quickpayment" sx={{ mt: 2 }}>
      Go to Quick Payment
    </Button>
  </Container>
);

const CatalogPage = () => (
  <Container sx={{ py: 4 }}>
    <Typography variant="h4" gutterBottom>Product Catalog</Typography>
    <Typography>Your existing catalog component goes here.</Typography>
  </Container>
);

const OrdersPage = () => (
  <Container sx={{ py: 4 }}>
    <Typography variant="h4" gutterBottom>Orders</Typography>
    <Typography>Your existing orders component goes here.</Typography>
  </Container>
);

const AdminPage = () => (
  <Container sx={{ py: 4 }}>
    <Typography variant="h4" gutterBottom>Admin Panel</Typography>
    <Typography>Your existing admin component goes here.</Typography>
  </Container>
);

// Export examples
export {
  BasicRouterExample,
  ExistingAppIntegration,
  ConditionalRenderingExample,
  AppIntegrationExample,
  StandaloneUsage
};

export default BasicRouterExample;
