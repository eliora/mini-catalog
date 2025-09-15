/**
 * SignUpFormFields Component - Registration form input fields
 * 
 * Collection of form fields for user registration including validation.
 * Handles name, email, password, and password confirmation inputs.
 * 
 * Features:
 * - Full name input with validation
 * - Email input with format validation
 * - Password input with visibility toggle
 * - Password confirmation with matching validation
 * - Icon adornments for better UX
 * - Real-time validation feedback
 * - Consistent styling across fields
 * - Accessibility support
 * - TypeScript interfaces
 */

'use client';

import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { SignUpFormData } from './signUpValidation';

// Props interface
interface SignUpFormFieldsProps {
  formData: SignUpFormData;
  handleChange: (field: keyof SignUpFormData) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  errors?: Partial<Record<keyof SignUpFormData, string>>;
  disabled?: boolean;
}

const SignUpFormFields: React.FC<SignUpFormFieldsProps> = ({
  formData,
  handleChange,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  errors = {},
  disabled = false
}) => {
  return (
    <>
      {/* Full Name Field */}
      <TextField
        fullWidth
        label="שם מלא"
        value={formData.fullName}
        onChange={handleChange('fullName')}
        margin="normal"
        required
        autoComplete="name"
        disabled={disabled}
        error={!!errors.fullName}
        helperText={errors.fullName}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon color={errors.fullName ? 'error' : 'action'} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              }
            }
          }
        }}
        inputProps={{
          'aria-label': 'שם מלא',
          maxLength: 100
        }}
      />

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
        disabled={disabled}
        error={!!errors.email}
        helperText={errors.email}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color={errors.email ? 'error' : 'action'} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              }
            }
          }
        }}
        inputProps={{
          'aria-label': 'כתובת אימייל',
          maxLength: 254
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
        autoComplete="new-password"
        disabled={disabled}
        error={!!errors.password}
        helperText={errors.password}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color={errors.password ? 'error' : 'action'} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                disabled={disabled}
                size="small"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              }
            }
          }
        }}
        inputProps={{
          'aria-label': 'סיסמה',
          maxLength: 128
        }}
      />

      {/* Confirm Password Field */}
      <TextField
        fullWidth
        label="אישור סיסמה"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        margin="normal"
        required
        autoComplete="new-password"
        disabled={disabled}
        error={!!errors.confirmPassword || Boolean(
          formData.confirmPassword && 
          formData.password !== formData.confirmPassword
        )}
        helperText={
          errors.confirmPassword || (
            formData.confirmPassword && formData.password !== formData.confirmPassword
              ? 'הסיסמאות אינן תואמות'
              : ''
          )
        }
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color={
                errors.confirmPassword || (
                  formData.confirmPassword && 
                  formData.password !== formData.confirmPassword
                ) ? 'error' : 'action'
              } />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showConfirmPassword ? 'הסתר אישור סיסמה' : 'הצג אישור סיסמה'}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
                disabled={disabled}
                size="small"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              }
            }
          }
        }}
        inputProps={{
          'aria-label': 'אישור סיסמה',
          maxLength: 128
        }}
      />
    </>
  );
};

export default React.memo(SignUpFormFields);
