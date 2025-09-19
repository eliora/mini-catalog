'use client';

/**
 * AppLayout Component - Main Application Layout
 * 
 * Provides the main layout structure for the application including:
 * - JDAHeader with search and cart functionality
 * - Container wrapper for content
 * - Navigation and routing logic
 */

import React, { useEffect } from 'react';
import { Box, Container, CircularProgress, Typography } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCompany } from '@/context/CompanyContext';
import JDAHeader from './JDAHeader';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isInitializing } = useAuth();
  const { settings: companySettings } = useCompany();
  

  // Update document title based on company settings
  useEffect(() => {
    const companyName = companySettings?.company_name || 'פורטל לקוסמטיקאיות';
    const companyDescription = companySettings?.company_description;
    
    if (companyDescription) {
      document.title = `${companyName} - ${companyDescription}`;
    } else {
      document.title = companyName;
    }
  }, [companySettings]);


  // Redirect to catalog if trying to access admin without being logged in
  useEffect(() => {
    if (pathname === '/admin' && !isAdmin()) {
      router.push('/catalog');
    }
  }, [pathname, isAdmin, router]);

  // Show loading screen while auth is initializing
  if (isInitializing) {
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
      />

      <Container maxWidth="xl" sx={{ mt: 2, mb: 2 }}>
        {children}
      </Container>
    </Box>
  );
};

export default AppLayout;
