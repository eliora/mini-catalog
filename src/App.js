import React, { useEffect } from 'react';
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
  createTheme, 
  CssBaseline, 
  Container, 
  Box,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Badge,
  Typography
} from '@mui/material';
import { CacheProvider } from '@emotion/react';
import { createRtlCache, createDeepTheme } from './theme/deepTheme';
import Catalog from './components/Catalog';
import OrderForm from './components/OrderForm';
import Admin from './components/Admin';
import Login from './components/Login';
import AppProviders from './providers/AppProviders';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { useCompany } from './context/CompanyContext';

// Import performance monitor for development only
if (process.env.NODE_ENV === 'development') {
  try {
    require('./utils/imagePerformance');
  } catch (error) {
    console.warn('Image performance monitor failed to load:', error);
  }
}

// Create RTL cache and deep theme
const rtlCache = createRtlCache();
const theme = createDeepTheme();



function AppInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, getCartItemCount } = useCart();
  const { isAdmin, token, logout } = useAuth();
  const { settings: companySettings } = useCompany();

  useEffect(() => {
    console.log('Cart updated:', cart);
  }, [cart]);

  // Update document title based on company settings
  useEffect(() => {
    const companyName = companySettings?.companyName || 'קטלוג מוצרים';
    const companyDescription = companySettings?.companyDescription;
    
    if (companyDescription) {
      document.title = `${companyName} - ${companyDescription}`;
    } else {
      document.title = companyName;
    }
  }, [companySettings]);

  // Get current tab based on URL path
  const getCurrentTab = () => {
    switch (location.pathname) {
      case '/catalog':
        return 0;
      case '/orderform':
        return 1;
      case '/admin':
        return 2;
      default:
        return 0;
    }
  };

  const selectedTab = getCurrentTab();

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        navigate('/catalog');
        break;
      case 1:
        navigate('/orderform');
        break;
      case 2:
        navigate('/admin');
        break;
      default:
        navigate('/catalog');
    }
  };

  // Listen for navigation events from child components
  useEffect(() => {
    const handleNavigateToTab = (event) => {
      switch (event.detail.tab) {
        case 0:
          navigate('/catalog');
          break;
        case 1:
          navigate('/orderform');
          break;
        case 2:
          navigate('/admin');
          break;
        default:
          navigate('/catalog');
      }
    };

    window.addEventListener('navigateToTab', handleNavigateToTab);
    return () => {
      window.removeEventListener('navigateToTab', handleNavigateToTab);
    };
  }, [navigate]);

  const handleAdminLogin = async () => {
    navigate('/admin');
  };

  const handleAdminLogout = () => {
    logout();
    navigate('/catalog');
  };

  // Show login if trying to access admin without being logged in
  if (location.pathname === '/admin' && !isAdmin) {
    return (
      <CacheProvider value={rtlCache}>
        <ThemeProvider theme={theme}>
          <div dir="rtl">
            <CssBaseline />
            <Login onLogin={handleAdminLogin} />
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
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            minHeight: '60px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${theme.deepColors?.grey[200] || '#e5e7eb'}`,
            boxShadow: theme.customShadows?.depth2 || '0 4px 16px rgba(0, 0, 0, 0.08)',
            '& .MuiToolbar-root': {
              minHeight: '60px !important',
              height: '60px',
              padding: '0 24px',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
              }
            }
          }}
        >
          <Toolbar sx={{ minHeight: '32px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              {/* Logo Only */}
              {companySettings?.companyLogo && (
                <Box
                  component="img"
                  src={companySettings.companyLogo}
                  alt={companySettings.companyName || 'Jean Darcel'}
                  sx={{
                    height: 24,
                    width: 'auto',
                    display: { xs: 'none', sm: 'block' }
                  }}
                />
              )}
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Enhanced Deep Main Menu */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 6,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -20,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 60,
              height: 4,
              borderRadius: 2,
              background: theme.gradients?.primary || 'linear-gradient(90deg, #1976d2, #1565c0)',
            }
          }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              sx={{ 
                minWidth: 400,
                '& .MuiTabs-root': {
                  position: 'relative',
                },
                '& .MuiTabs-flexContainer': {
                  gap: 1,
                },
              }}
            >
              <Tab 
                label="קטלוג" 
                icon={<Box component="span" sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: selectedTab === 0 ? 'primary.contrastText' : 'grey.400',
                  mb: 0.5,
                  transition: 'all 0.3s ease'
                }} />}
                iconPosition="top"
                sx={{ 
                  minWidth: 120,
                  minHeight: 60,
                  '& .MuiTab-iconWrapper': {
                    marginBottom: 1,
                  }
                }} 
              />
              <Tab
                label={
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>טופס הזמנה</span>
                    {getCartItemCount() > 0 && (
                      <Box sx={{
                        minWidth: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: 'secondary.main',
                        color: 'secondary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        boxShadow: theme.customShadows?.secondaryShadow || '0 4px 12px rgba(220, 0, 78, 0.3)',
                        animation: getCartItemCount() > 0 ? 'pulse 2s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.1)' },
                          '100%': { transform: 'scale(1)' },
                        },
                      }}>
                        {getCartItemCount()}
                      </Box>
                    )}
                  </Box>
                }
                icon={<Box component="span" sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: selectedTab === 1 ? 'primary.contrastText' : 'grey.400',
                  mb: 0.5,
                  transition: 'all 0.3s ease'
                }} />}
                iconPosition="top"
                sx={{ 
                  minWidth: 140,
                  minHeight: 60,
                  '& .MuiTab-iconWrapper': {
                    marginBottom: 1,
                  }
                }}
              />
              <Tab 
                label="ניהול" 
                icon={<Box component="span" sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: selectedTab === 2 ? 'primary.contrastText' : 'grey.400',
                  mb: 0.5,
                  transition: 'all 0.3s ease'
                }} />}
                iconPosition="top"
                sx={{ 
                  minWidth: 120,
                  minHeight: 60,
                  '& .MuiTab-iconWrapper': {
                    marginBottom: 1,
                  }
                }} 
              />
            </Tabs>
          </Box>

          <Routes>
            <Route path="/" element={<Navigate to="/catalog" replace />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/orderform" element={<OrderForm />} />
            <Route path="/admin" element={
              isAdmin ? <Admin onLogout={handleAdminLogout} adminToken={token} /> : <Navigate to="/catalog" replace />
            } />
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
      <Router>
        <AppProviders>
          <AppInner />
        </AppProviders>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
