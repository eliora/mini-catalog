import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Container, 
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import Catalog from './components/Catalog';
import OrderForm from './components/OrderForm';
import Admin from './components/Admin';
import Login from './components/Login';
import AppProviders from './providers/AppProviders';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';

// RTL theme with Hebrew font support
const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      'Heebo',
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
  },
  components: {
    MuiTextField: {
      defaultProps: {
        dir: 'rtl',
      },
    },
    MuiInputLabel: {
      defaultProps: {
        dir: 'rtl',
      },
    },
  },
});

function AppInner() {
  const [selectedTab, setSelectedTab] = useState(0);
  const { cart, getCartItemCount } = useCart();
  const { isAdmin, token, logout } = useAuth();

  useEffect(() => {
    console.log('Cart updated:', cart);
  }, [cart]);

  const handleAdminLogin = async () => {
    setSelectedTab(2);
  };

  const handleAdminLogout = () => {
    logout();
    setSelectedTab(0);
  };

  if (selectedTab === 2 && !isAdmin) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={handleAdminLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, direction: 'rtl' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              קטלוג מוצרים
            </Typography>
            <Badge badgeContent={getCartItemCount()} color="secondary">
              <Typography variant="body2">עגלה</Typography>
            </Badge>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
          <Tabs 
            value={selectedTab} 
            onChange={(e, newValue) => setSelectedTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="קטלוג" />
            <Tab 
              label={
                <Badge badgeContent={getCartItemCount()} color="secondary">
                  טופס הזמנה
                </Badge>
              } 
            />
            <Tab label="ניהול" />
          </Tabs>

          {selectedTab === 0 && (
            <Catalog />
          )}
          
          {selectedTab === 1 && (
            <OrderForm />
          )}
          
          {selectedTab === 2 && isAdmin && (
            <Admin onLogout={handleAdminLogout} adminToken={token} />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AppProviders>
      <AppInner />
    </AppProviders>
  );
}

export default App;
