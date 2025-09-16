'use client';

/**
 * AppLayout Component - Main Application Layout
 * 
 * Provides the main layout structure for the application including:
 * - JDAHeader with search and cart functionality
 * - Container wrapper for content
 * - Navigation and routing logic
 */

import React, { useState, useEffect } from 'react';
import { Box, Container, CircularProgress, Typography } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useCompany } from '@/context/CompanyContext';
import JDAHeader from './JDAHeader';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { cart, getItemCount } = useCart();
  const { isAdmin, signOut, initializing } = useAuth();
  const { settings: companySettings } = useCompany();
  
  // Search state for header
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');
  
  // Fix hydration mismatch by ensuring consistent cart count between server and client
  const [cartCount, setCartCount] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  
  // Only run on client after component has mounted
  useEffect(() => {
    setHasMounted(true);
    setCartCount(getItemCount());
  }, [getItemCount]);
  
  // Update cart count when cart changes, but only after mounting
  useEffect(() => {
    if (hasMounted) {
      setCartCount(getItemCount());
    }
  }, [cart, getItemCount, hasMounted]);

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
    router.push('/catalog');
  };

  // Header search handlers
  const handleHeaderSearchChange = (value: string) => {
    setHeaderSearchTerm(value);
    // Navigate to catalog if not already there
    if (pathname !== '/catalog') {
      router.push('/catalog');
    }
    // Dispatch a custom event to communicate with Catalog component
    window.dispatchEvent(new CustomEvent('headerSearch', { detail: { searchTerm: value } }));
  };

  const handleHeaderSearchClear = () => {
    setHeaderSearchTerm('');
    window.dispatchEvent(new CustomEvent('headerSearch', { detail: { searchTerm: '' } }));
  };

  // Redirect to catalog if trying to access admin without being logged in
  useEffect(() => {
    if (pathname === '/admin' && !isAdmin()) {
      router.push('/catalog');
    }
  }, [pathname, isAdmin, router]);

  // Show loading screen while auth is initializing
  if (initializing) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          טוען מערכת...
        </Typography>
      </Box>
    );
  }

  // Check if current route is a standalone page (no header/container)
  const isStandalonePage = pathname === '/quickpayment' || pathname === '/site/quickpayment';
  
  // Check if current route is an admin page (no JDAHeader, has its own layout)
  const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/(admin-dashboard)');

  if (isStandalonePage || isAdminPage) {
    // Standalone pages and admin pages (full screen, no JDAHeader)
    return <>{children}</>;
  }

  // Regular pages (with header and container)
  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* JDA Style Header */}
      <JDAHeader
        companySettings={companySettings}
        cartItemCount={hasMounted ? cartCount : 0}
        searchTerm={headerSearchTerm}
        onSearchChange={handleHeaderSearchChange}
        onClearSearch={handleHeaderSearchClear}
        searchPlaceholder="חיפוש מוצרים..."
      />

      <Container maxWidth="xl" sx={{ mt: 2, mb: 2 }}>
        {children}
      </Container>
    </Box>
  );
};

export default AppLayout;
