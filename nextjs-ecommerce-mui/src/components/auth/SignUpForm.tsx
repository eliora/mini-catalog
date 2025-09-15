/**
 * SignUpForm Component - User registration form
 * 
 * Comprehensive user registration form with validation and social login options.
 * Refactored with TypeScript and enhanced features.
 * 
 * Architecture:
 * - SocialLoginButtons: Google and Facebook authentication
 * - SignUpFormFields: Form input fields with validation
 * - PasswordStrengthIndicator: Password strength visualization
 * - signUpValidation: Validation utilities and functions
 * 
 * Features:
 * - Email/password registration
 * - Social login (Google, Facebook)
 * - Real-time form validation
 * - Password strength indicator
 * - Terms and conditions acceptance
 * - Success/error messaging
 * - Loading states
 * - TypeScript support
 * - Accessibility enhancements
 * 
 * Performance:
 * - React.memo optimization
 * - Extracted validation utilities
 * - Modular component architecture
 * - Efficient state management
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Divider,
  Link,
  Chip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

// Extracted components
import SocialLoginButtons from './signup/SocialLoginButtons';
import SignUpFormFields from './signup/SignUpFormFields';
import PasswordStrengthIndicator from './signup/PasswordStrengthIndicator';

// Validation utilities
import { validateSignUpForm, SignUpFormData } from './signup/signUpValidation';

// Props interface
interface SignUpFormProps {
  onSuccess: () => void;
  onSwitchToSignIn: () => void;
  showSocialLogin?: boolean;
  redirectTo?: string;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ 
  onSuccess, 
  onSwitchToSignIn,
  showSocialLogin = true,
  redirectTo
}) => {
  const { signUp, isLoading } = useAuth();
  
  // ===== FORM STATE =====
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    acceptTerms: false
  });
  
  // ===== UI STATE =====
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignUpFormData, string>>>({});

  // ===== EVENT HANDLERS =====

  /**
   * Handles form field changes with proper typing
   */
  const handleChange = useCallback((field: keyof SignUpFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'acceptTerms' ? event.target.checked : event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear messages and field errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [error, success, fieldErrors]);

  /**
   * Handles form submission with comprehensive validation
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Clear previous errors
    setError('');
    setSuccess('');
    setFieldErrors({});
    
    // Validate form
    const validation = validateSignUpForm(formData);
    if (!validation.isValid) {
      setError(validation.error || 'שגיאה בתקינות הנתונים');
      return;
    }

    try {
      const result = await signUp(formData.email, formData.password, {
        first_name: formData.fullName.split(' ')[0] || '',
        last_name: formData.fullName.split(' ').slice(1).join(' ') || '',
      });

      if (result.error) {
        setError(getErrorMessage(result.error));
      } else {
        setSuccess('הרשמה בוצעה בהצלחה! נא לבדוק את האימייל לאימות החשבון.');
        
        // Clear form data
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          acceptTerms: false
        });

        // Redirect after success
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('שגיאה בהרשמה. נסה שוב.');
    }
  };

  /**
   * Handles social login with proper error handling
   */
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setError('');
      setSuccess('');
      
      // Redirect to social auth endpoint
      const redirectUrl = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : '';
      window.location.href = `/auth/${provider}${redirectUrl}`;
    } catch (err) {
      console.error(`${provider} sign in error:`, err);
      setError(`שגיאה בהתחברות עם ${provider === 'google' ? 'Google' : 'Facebook'}`);
    }
  };

  /**
   * Converts error messages to Hebrew with specific handling
   */
  const getErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
      return 'כתובת האימייל כבר רשומה במערכת';
    }
    if (errorMessage.includes('invalid email') || errorMessage.includes('Invalid email')) {
      return 'כתובת אימייל לא תקינה';
    }
    if (errorMessage.includes('weak password') || errorMessage.includes('Password')) {
      return 'הסיסמה חלשה מדי - נא להשתמש לפחות ב-6 תווים';
    }
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
      return 'יותר מדי ניסיונות הרשמה. נסה שוב מאוחר יותר';
    }
    return 'שגיאה בהרשמה. נסה שוב.';
  };

  // ===== RENDER =====
  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        width: '100%',
        maxWidth: '100%'
      }}
    >
      {/* Header */}
      <Typography 
        variant="h4" 
        gutterBottom 
        align="center" 
        sx={{ 
          fontWeight: 700, 
          mb: 1,
          color: 'text.primary'
        }}
      >
        הרשמה
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        align="center" 
        sx={{ mb: 3 }}
      >
        צור חשבון חדש כדי להתחיל לקנות
      </Typography>

      {/* Error/Success Messages */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert 
          severity="success" 
          icon={<CheckCircleIcon />}
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          {success}
        </Alert>
      )}

      {/* Social Login Buttons */}
      {showSocialLogin && (
        <>
          <SocialLoginButtons 
            onSocialLogin={handleSocialLogin} 
            loading={isLoading}
            disabled={!!success}
          />

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

      {/* Form Fields */}
      <SignUpFormFields
        formData={formData}
        handleChange={handleChange}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        errors={fieldErrors}
        disabled={isLoading || !!success}
      />

      {/* Password Strength Indicator */}
      {formData.password && (
        <PasswordStrengthIndicator 
          password={formData.password}
          showLabel={true}
        />
      )}

      {/* Terms and Conditions */}
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.acceptTerms}
            onChange={handleChange('acceptTerms')}
            color="primary"
            disabled={isLoading || !!success}
            size="small"
          />
        }
        label={
          <Typography variant="body2" color="text.secondary">
            אני מסכים/ה ל
            <Link 
              href="/terms" 
              sx={{ 
                mx: 0.5,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              תנאי השימוש
            </Link>
            ול
            <Link 
              href="/privacy" 
              sx={{ 
                mx: 0.5,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              מדיניות הפרטיות
            </Link>
          </Typography>
        }
        sx={{ 
          mt: 2, 
          mb: 3,
          alignItems: 'flex-start',
          '& .MuiCheckbox-root': {
            pt: 0,
            mt: -0.5
          }
        }}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={
          isLoading || 
          !!success ||
          !formData.email || 
          !formData.password || 
          !formData.confirmPassword ||
          !formData.fullName ||
          !formData.acceptTerms
        }
        sx={{
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 600,
          borderRadius: 2,
          textTransform: 'none',
          mb: 2,
          boxShadow: 2,
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-1px)',
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
      >
        {isLoading ? 'מבצע הרשמה...' : success ? 'הרשמה הושלמה!' : 'הרשמה'}
      </Button>

      {/* Switch to Sign In */}
      <Typography variant="body2" align="center" color="text.secondary">
        יש לך כבר חשבון?{' '}
        <Link
          component="button"
          type="button"
          onClick={onSwitchToSignIn}
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
          התחבר כאן
        </Link>
      </Typography>
    </Box>
  );
};

export default React.memo(SignUpForm);
