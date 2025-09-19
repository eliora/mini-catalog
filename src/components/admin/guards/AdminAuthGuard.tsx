/**
 * @file Admin Authentication Guard
 * @description Protects admin routes from unauthorized access
 * Redirects to login if user is not authenticated or not admin
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Alert, Typography, Button } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ 
  children
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth context to load
      if (isLoading) {
        return;
      }

      // If not authenticated, redirect to login
      if (!isAuthenticated()) {
        router.push('/auth/login?redirect=/admin');
        return;
      }

      // If authenticated but not admin, show access denied
      if (!isAdmin()) {
        setIsChecking(false);
        return;
      }

      // User is authenticated and admin, allow access
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Show loading while checking authentication
    if (isLoading || isChecking) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          בדיקת הרשאות...
        </Typography>
      </Box>
    );
  }

  // If not authenticated, show nothing (redirecting)
  if (!isAuthenticated()) {
    return null;
  }

  // If not admin, show access denied
  if (!isAdmin()) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          gap: 3,
          p: 3
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500, width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            גישה נדחתה
          </Typography>
          <Typography variant="body2" paragraph>
            אין לך הרשאות לגשת לאזור הניהול. רק מנהלים מורשים יכולים לגשת לדף זה.
          </Typography>
        </Alert>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => router.push('/')}
          >
            חזרה לעמוד הראשי
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/auth/login')}
          >
            התחבר מחדש
          </Button>
        </Box>
      </Box>
    );
  }

  // User is authenticated and admin, render children
  return <>{children}</>;
};

export default AdminAuthGuard;

