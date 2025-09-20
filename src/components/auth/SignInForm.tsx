/**
 * SIGN IN FORM COMPONENT
 * =======================
 * 
 * This component provides a comprehensive sign-in form with social login options.
 * It features email/password authentication, OAuth provider integration,
 * password visibility toggle, and forgot password functionality.
 * 
 * KEY FEATURES:
 * - Email/password authentication
 * - Social login integration (Google, Facebook)
 * - Password visibility toggle
 * - Forgot password functionality
 * - Real-time form validation
 * - Comprehensive error handling with Hebrew messages
 * - Loading states and disabled states
 * - Responsive design with Material-UI
 * 
 * ARCHITECTURE:
 * - Uses AuthContext for authentication state management
 * - Material-UI components for consistent styling
 * - TypeScript interfaces for type safety
 * - Form validation with error display
 * - Social login redirect handling
 * 
 * SECURITY FEATURES:
 * - Input validation and sanitization
 * - Email format validation
 * - Error message handling without exposing sensitive info
 * - Secure form submission
 * - Password reset functionality
 * 
 * SOCIAL LOGIN:
 * - Google OAuth integration
 * - Facebook OAuth integration
 * - Redirect-based authentication flow
 * - Error handling for OAuth failures
 * 
 * USAGE:
 * - Import and use in authentication dialogs/pages
 * - Pass onSuccess callback for success handling
 * - Pass onSwitchToSignUp callback for form switching
 * - Optional showSocialLogin prop to hide social buttons
 * 
 * STYLING:
 * - Clean form layout with proper spacing
 * - Social login buttons with provider icons
 * - Password visibility toggle with icons
 * - Hebrew RTL text support
 * - Responsive design for mobile and desktop
 * 
 * @file src/components/auth/SignInForm.tsx
 * @author Authentication System
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Link,
  InputAdornment,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

// Props interface for SignInForm
interface SignInFormProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
  showSocialLogin?: boolean;
}

// Form data interface
interface SignInFormData {
  email: string;
  password: string;
}

const SignInForm: React.FC<SignInFormProps> = ({ 
  onSuccess, 
  onSwitchToSignUp,
  showSocialLogin = true 
}) => {
  const { signIn, isLoading, resetPassword } = useAuth();
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Handle form field changes
  const handleChange = (field: keyof SignInFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (error) setError(''); // Clear error when user starts typing
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('נא למלא את כל השדות');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('נא להזין כתובת אימייל תקינה');
      return;
    }

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.error) {
        handleSignInError(result.error);
      } else {
        onSuccess();
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('שגיאה בהתחברות. נסה שוב.');
    }
  };

  // Handle provider sign in (Google, Facebook)
  const handleProviderSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setError('');
      // Note: Provider sign-in redirects, so onSuccess won't be called immediately
      // The auth callback will handle the redirect
      window.location.href = `/auth/${provider}`;
    } catch (err) {
      console.error(`${provider} sign in error:`, err);
      setError(`שגיאה בהתחברות עם ${provider === 'google' ? 'Google' : 'Facebook'}`);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('נא להזין כתובת אימייל תחילה');
      return;
    }

    try {
      const result = await resetPassword(formData.email);
      
      if (result.error) {
        setError(result.error);
      } else {
        setError(''); // Clear any existing errors
        // Show success message (you might want to use a different state for this)
        alert('נשלח אימייל לאיפוס סיסמה');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('שגיאה בשליחת אימייל לאיפוס סיסמה');
    }
  };

  // Utility function to validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle specific sign-in errors
  const handleSignInError = (errorMessage: string) => {
    if (errorMessage.includes('Invalid login credentials')) {
      setError('אימייל או סיסמה שגויים');
    } else if (errorMessage.includes('Email not confirmed')) {
      setError('נא לאמת את האימייל שלך לפני ההתחברות');
    } else if (errorMessage.includes('Too many requests')) {
      setError('יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר');
    } else {
      setError(errorMessage || 'שגיאה בהתחברות');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Social Sign In */}
      {showSocialLogin && (
        <>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<GoogleIcon />}
              onClick={() => handleProviderSignIn('google')}
              disabled={isLoading}
              sx={{
                borderColor: 'grey.300',
                color: 'text.primary',
                textTransform: 'none',
                fontSize: '1rem',
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50'
                },
                '&:disabled': {
                  opacity: 0.6,
                }
              }}
            >
              המשך עם Google
            </Button>

            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<FacebookIcon />}
              onClick={() => handleProviderSignIn('facebook')}
              disabled={isLoading}
              sx={{
                borderColor: 'grey.300',
                color: 'text.primary',
                textTransform: 'none',
                fontSize: '1rem',
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#1877F2',
                  backgroundColor: 'rgba(24, 119, 242, 0.04)'
                },
                '&:disabled': {
                  opacity: 0.6,
                }
              }}
            >
              המשך עם Facebook
            </Button>
          </Stack>

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
            <Divider sx={{ flex: 1 }} />
            <Chip 
              label="או" 
              size="small" 
              sx={{ 
                mx: 2, 
                backgroundColor: 'background.paper',
                color: 'text.secondary',
                fontSize: '0.875rem'
              }} 
            />
            <Divider sx={{ flex: 1 }} />
          </Box>
        </>
      )}

      {/* Email Field */}
      <TextField
        fullWidth
        label="כתובת אימייל"
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
        margin="normal"
        required
        autoComplete="email"
        disabled={isLoading}
        error={error.includes('אימייל')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          }
        }}
      />

      {/* Password Field */}
      <TextField
        fullWidth
        label="סיסמה"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange('password')}
        margin="normal"
        required
        autoComplete="current-password"
        disabled={isLoading}
        error={error.includes('סיסמה')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                disabled={isLoading}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          }
        }}
      />

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2, 
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%',
              textAlign: 'center'
            }
          }}
        >
          {error}
        </Alert>
      )}

      {/* Sign In Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading || !formData.email || !formData.password}
        sx={{
          mt: 3,
          mb: 2,
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1.1rem',
          fontWeight: 600,
          boxShadow: 2,
          '&:hover': {
            boxShadow: 4,
          },
          '&:disabled': {
            opacity: 0.6,
          }
        }}
      >
        {isLoading ? 'מתחבר...' : 'התחבר'}
      </Button>

      {/* Forgot Password Link */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={handleForgotPassword}
          disabled={isLoading}
          sx={{
            textDecoration: 'none',
            color: 'primary.main',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            '&:hover': {
              textDecoration: isLoading ? 'none' : 'underline',
            }
          }}
        >
          שכחת סיסמה?
        </Link>
      </Box>

      {/* Switch to Sign Up */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          אין לך חשבון?{' '}
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={onSwitchToSignUp}
            disabled={isLoading}
            sx={{
              fontWeight: 600,
              textDecoration: 'none',
              color: 'primary.main',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              '&:hover': {
                textDecoration: isLoading ? 'none' : 'underline',
              }
            }}
          >
            הרשמה
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignInForm;

