/**
 * SocialLoginButtons Component - Social authentication options
 * 
 * Provides Google and Facebook login buttons for quick registration.
 * Handles social provider authentication with consistent styling.
 * 
 * Features:
 * - Google OAuth integration
 * - Facebook OAuth integration  
 * - Consistent button styling with brand colors
 * - Loading states during authentication
 * - Error handling for social login failures
 * 
 * @param {Function} onSocialLogin - Social login handler
 * @param {boolean} loading - Whether authentication is in progress
 */

import React from 'react';
import { Button, Stack } from '@mui/material';
import {
  Google as GoogleIcon,
  Facebook as FacebookIcon
} from '@mui/icons-material';

const SocialLoginButtons = ({ onSocialLogin, loading = false }) => {
  return (
    <Stack spacing={2}>
      {/* Google Sign Up */}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={() => onSocialLogin('google')}
        disabled={loading}
        sx={{
          borderColor: '#DB4437',
          color: '#DB4437',
          textTransform: 'none',
          fontSize: '1rem',
          py: 1.5,
          '&:hover': {
            borderColor: '#DB4437',
            backgroundColor: 'rgba(219, 68, 55, 0.04)'
          }
        }}
      >
        הרשמה עם Google
      </Button>

      {/* Facebook Sign Up */}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<FacebookIcon />}
        onClick={() => onSocialLogin('facebook')}
        disabled={loading}
        sx={{
          borderColor: '#1877F2',
          color: '#1877F2',
          textTransform: 'none',
          fontSize: '1rem',
          py: 1.5,
          '&:hover': {
            borderColor: '#1877F2',
            backgroundColor: 'rgba(24, 119, 242, 0.04)'
          }
        }}
      >
        הרשמה עם Facebook
      </Button>
    </Stack>
  );
};

export default React.memo(SocialLoginButtons);
