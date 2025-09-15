'use client';

import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { supabaseBrowserClient } from '@/lib/supabaseClient';

interface AuthCallbackProps {
  redirectTo?: string;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ redirectTo = '/' }) => {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = supabaseBrowserClient;
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.replace(redirectTo);
          return;
        }

        if (data.session) {
          console.log('User authenticated successfully:', data.session.user.email);
          // Redirect to the specified path or main page
          router.replace(redirectTo);
        } else {
          console.log('No session found, redirecting to home');
          router.replace(redirectTo);
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        router.replace(redirectTo);
      }
    };

    handleAuthCallback();
  }, [router, redirectTo]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
        px: 2,
      }}
    >
      <CircularProgress 
        size={48} 
        sx={{ 
          color: 'primary.main',
          mb: 1 
        }} 
      />
      <Typography 
        variant="h6" 
        color="text.secondary"
        sx={{ 
          fontWeight: 600,
          textAlign: 'center'
        }}
      >
        מתחבר...
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ 
          textAlign: 'center',
          maxWidth: 400
        }}
      >
        אנא המתן בזמן שאנחנו מסיימים את ההתחברות
      </Typography>
    </Box>
  );
};

export default AuthCallback;
