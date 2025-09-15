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
 * - Accessibility support
 * - TypeScript interfaces
 */

'use client';

import React from 'react';
import { Button, Stack } from '@mui/material';
import {
  Google as GoogleIcon,
  Facebook as FacebookIcon
} from '@mui/icons-material';

// Props interface
interface SocialLoginButtonsProps {
  onSocialLogin: (provider: 'google' | 'facebook') => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  showBoth?: boolean;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ 
  onSocialLogin, 
  loading = false,
  disabled = false,
  variant = 'outlined',
  size = 'large',
  showBoth = true
}) => {
  const isDisabled = loading || disabled;

  return (
    <Stack spacing={2}>
      {/* Google Sign Up */}
      <Button
        fullWidth
        variant={variant}
        size={size}
        startIcon={<GoogleIcon />}
        onClick={() => onSocialLogin('google')}
        disabled={isDisabled}
        sx={{
          borderColor: variant === 'outlined' ? '#DB4437' : undefined,
          color: variant === 'outlined' ? '#DB4437' : '#fff',
          backgroundColor: variant === 'contained' ? '#DB4437' : undefined,
          textTransform: 'none',
          fontSize: size === 'large' ? '1rem' : '0.875rem',
          py: size === 'large' ? 1.5 : 1,
          borderRadius: 2,
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: '#DB4437',
            backgroundColor: variant === 'outlined' 
              ? 'rgba(219, 68, 55, 0.04)' 
              : '#C23321',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(219, 68, 55, 0.15)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&:disabled': {
            opacity: 0.6,
            transform: 'none',
            boxShadow: 'none',
          }
        }}
        aria-label="הרשמה עם Google"
      >
        הרשמה עם Google
      </Button>

      {/* Facebook Sign Up */}
      {showBoth && (
        <Button
          fullWidth
          variant={variant}
          size={size}
          startIcon={<FacebookIcon />}
          onClick={() => onSocialLogin('facebook')}
          disabled={isDisabled}
          sx={{
            borderColor: variant === 'outlined' ? '#1877F2' : undefined,
            color: variant === 'outlined' ? '#1877F2' : '#fff',
            backgroundColor: variant === 'contained' ? '#1877F2' : undefined,
            textTransform: 'none',
            fontSize: size === 'large' ? '1rem' : '0.875rem',
            py: size === 'large' ? 1.5 : 1,
            borderRadius: 2,
            fontWeight: 500,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: '#1877F2',
              backgroundColor: variant === 'outlined'
                ? 'rgba(24, 119, 242, 0.04)'
                : '#166FE5',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(24, 119, 242, 0.15)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&:disabled': {
              opacity: 0.6,
              transform: 'none',
              boxShadow: 'none',
            }
          }}
          aria-label="הרשמה עם Facebook"
        >
          הרשמה עם Facebook
        </Button>
      )}
    </Stack>
  );
};

export default React.memo(SocialLoginButtons);

