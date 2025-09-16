/**
 * Login Page
 * 
 * Authentication page for admin access.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Login from '@/components/auth/Login';
import { useAuth } from '@/context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/admin';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // If user is already authenticated, redirect to the intended page
    if (mounted && !isLoading && user) {
      router.push(redirectTo);
    }
  }, [mounted, isLoading, user, redirectTo, router]);

  // Show loading spinner while checking auth state
  if (!mounted || isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If user is already logged in, don't show login form
  if (user) {
    return null;
  }

  const handleLoginSuccess = (success: boolean) => {
    if (success) {
      router.push(redirectTo);
    }
  };

  return (
    <Login 
      onLogin={handleLoginSuccess}
      redirectTo={redirectTo}
    />
  );
}
