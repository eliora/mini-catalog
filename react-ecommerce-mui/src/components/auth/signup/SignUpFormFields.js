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
 * 
 * @param {Object} formData - Form data object
 * @param {Function} handleChange - Form change handler
 * @param {boolean} showPassword - Password visibility state
 * @param {Function} setShowPassword - Password visibility setter
 * @param {boolean} showConfirmPassword - Confirm password visibility state
 * @param {Function} setShowConfirmPassword - Confirm password visibility setter
 */

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

const SignUpFormFields = ({
  formData,
  handleChange,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword
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
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          }
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
        autoComplete="new-password"
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
        error={formData.confirmPassword && formData.password !== formData.confirmPassword}
        helperText={
          formData.confirmPassword && formData.password !== formData.confirmPassword
            ? 'הסיסמאות אינן תואמות'
            : ''
        }
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
    </>
  );
};

export default React.memo(SignUpFormFields);
