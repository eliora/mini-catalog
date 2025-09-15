import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/', { replace: true });
          return;
        }

        if (data.session) {
          console.log('User authenticated successfully:', data.session.user.email);
          // Redirect to main page
          navigate('/', { replace: true });
        } else {
          console.log('No session found, redirecting to home');
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        navigate('/', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

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
      <CircularProgress size={48} />
      <Typography variant="h6" color="text.secondary">
        מתחבר...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        אנא המתן בזמן שאנחנו מסיימים את ההתחברות
      </Typography>
    </Box>
  );
};

export default AuthCallback;
