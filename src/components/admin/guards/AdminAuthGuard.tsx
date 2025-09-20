/**
 * ADMIN AUTHENTICATION GUARD COMPONENT
 * ====================================
 * 
 * This component protects admin routes from unauthorized access by checking
 * authentication status and admin role. It provides a seamless user experience
 * with proper loading states, error handling, and redirects.
 * 
 * KEY FEATURES:
 * - Route protection for admin areas
 * - Authentication status checking
 * - Admin role verification
 * - Automatic redirects for unauthorized access
 * - Loading states with user feedback
 * - Access denied page with navigation options
 * - Hebrew language support
 * 
 * ARCHITECTURE:
 * - Uses AuthContext for authentication state
 * - React Router for navigation
 * - Material-UI for consistent styling
 * - TypeScript interfaces for type safety
 * - Effect hooks for authentication checking
 * 
 * SECURITY FEATURES:
 * - Client-side route protection
 * - Authentication verification
 * - Admin role checking
 * - Secure redirect handling
 * - No sensitive information exposure
 * 
 * USER EXPERIENCE:
 * - Loading spinner during authentication check
 * - Clear error messages for access denied
 * - Navigation options (home, login)
 * - Responsive design
 * - Hebrew RTL text support
 * 
 * PROTECTION FLOW:
 * 1. Check if authentication is loading
 * 2. Verify user is authenticated
 * 3. Check if user has admin role
 * 4. Redirect or show access denied accordingly
 * 5. Render protected content if authorized
 * 
 * USAGE:
 * - Wrap admin components with AdminAuthGuard
 * - Automatically handles authentication and authorization
 * - Provides loading and error states
 * - No additional configuration required
 * 
 * STYLING:
 * - Full-screen loading state
 * - Centered access denied message
 * - Material-UI components for consistency
 * - Responsive design for all screen sizes
 * 
 * @file src/components/admin/guards/AdminAuthGuard.tsx
 * @author Authentication System
 * @version 1.0.0
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

