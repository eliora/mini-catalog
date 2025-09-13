import React, { useEffect, useState } from 'react';
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { 
  ThemeProvider, 
  CssBaseline, 
  Box,
  Container,
  CircularProgress
} from '@mui/material';
import { CacheProvider } from '@emotion/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRtlCache, createDeepTheme } from './theme/deepTheme';
import queryClient from './lib/queryClient';
import CatalogClean from './components/catalog/CatalogClean';
import { OrderForm } from './components/orderform';
import Admin from './components/admin/Admin';
import AppProviders from './providers/AppProviders';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { useCompany } from './context/CompanyContext';
// import UserMenu from './components/auth/UserMenu'; // TODO: Implement user menu
import AuthCallback from './components/auth/AuthCallback';
import JDAHeader from './components/layout/JDAHeader';

// Image performance utilities removed - can be added back if needed

// Create RTL cache and deep theme
const rtlCache = createRtlCache();
const theme = createDeepTheme();



function AppInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, getCartItemCount } = useCart();
  const { isAdmin, signOut, initializing } = useAuth();
  const { settings: companySettings } = useCompany();

  // Search state for header
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');

  useEffect(() => {
    console.log('Cart updated:', cart);
  }, [cart]);

  // Update document title based on company settings
  useEffect(() => {
    const companyName = companySettings?.companyName || 'פורטל לקוסמטיקאיות';
    const companyDescription = companySettings?.companyDescription;
    
    if (companyDescription) {
      document.title = `${companyName} - ${companyDescription}`;
    } else {
      document.title = companyName;
    }
  }, [companySettings]);



  const handleAdminLogout = () => {
    signOut();
    navigate('/catalog');
  };

  // Header search handlers
  const handleHeaderSearchChange = (value) => {
    setHeaderSearchTerm(value);
    // Navigate to catalog if not already there
    if (location.pathname !== '/catalog') {
      navigate('/catalog');
    }
    // You can dispatch a custom event to communicate with Catalog component
    window.dispatchEvent(new CustomEvent('headerSearch', { detail: { searchTerm: value } }));
  };

  const handleHeaderSearchClear = () => {
    setHeaderSearchTerm('');
    window.dispatchEvent(new CustomEvent('headerSearch', { detail: { searchTerm: '' } }));
  };

  // Redirect to catalog if trying to access admin without being logged in
  // Users can login through the header PersonIcon and then access admin
  React.useEffect(() => {
    if (location.pathname === '/admin' && !isAdmin) {
      navigate('/catalog');
    }
  }, [location.pathname, isAdmin, navigate]);

  // Show loading screen while auth is initializing
  if (initializing) {
    return (
      <CacheProvider value={rtlCache}>
        <ThemeProvider theme={theme}>
          <div dir="rtl">
            <CssBaseline />
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
              }}
            >
              <CircularProgress />
            </Box>
          </div>
        </ThemeProvider>
      </CacheProvider>
    );
  }

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <div dir="rtl">
          <CssBaseline />
          <Box sx={{ flexGrow: 1 }}>
            {/* JDA Style Header */}
            <JDAHeader
              companySettings={companySettings}
              cartItemCount={getCartItemCount()}
              searchTerm={headerSearchTerm}
              onSearchChange={handleHeaderSearchChange}
              onClearSearch={handleHeaderSearchClear}
              searchPlaceholder="חיפוש מוצרים..."
            />

        <Container maxWidth="xl" sx={{ mt: 2, mb: 2 }}>

          <Routes>
            <Route path="/" element={<Navigate to="/catalog" replace />} />
            <Route path="/catalog" element={<CatalogClean />} />
            <Route path="/orderform" element={<OrderForm />} />
            <Route path="/admin" element={
              isAdmin ? <Admin onLogout={handleAdminLogout} /> : <Navigate to="/catalog" replace />
            } />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<Navigate to="/catalog" replace />} />
          </Routes>
        </Container>
          </Box>
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppProviders>
            <AppInner />
          </AppProviders>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
