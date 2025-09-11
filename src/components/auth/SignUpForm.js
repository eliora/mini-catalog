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
  FormControlLabel,
  Checkbox,
  LinearProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

const SignUpForm = ({ onSuccess, onSwitchToSignIn }) => {
  const { signUp, signInWithProvider, loading } = useSupabaseAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field) => (event) => {
    const value = field === 'acceptTerms' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(''); // Clear error when user starts typing
    if (success) setSuccess(''); // Clear success when user starts typing
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
      setError('נא למלא את כל השדות');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('כתובת אימייל לא תקינה');
      return false;
    }

    if (formData.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return false;
    }

    if (!formData.acceptTerms) {
      setError('נא לאשר את תנאי השימוש');
      return false;
    }

    return true;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: 'error' };
    
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;

    if (strength <= 25) return { strength, label: 'חלשה', color: 'error' };
    if (strength <= 50) return { strength, label: 'בינונית', color: 'warning' };
    if (strength <= 75) return { strength, label: 'חזקה', color: 'info' };
    return { strength, label: 'מצוינת', color: 'success' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        user_role: 'standard' // Default role
      });
      
      setSuccess('נשלח אימייל אימות. נא לבדוק את תיבת הדואר שלך.');
      
      // Don't close dialog immediately, let user see success message
      setTimeout(() => {
        onSuccess();
      }, 3000);
      
    } catch (err) {
      console.error('Sign up error:', err);
      
      // Handle specific Supabase errors
      if (err.message?.includes('User already registered')) {
        setError('המשתמש כבר רשום במערכת');
      } else if (err.message?.includes('Password should be at least 6 characters')) {
        setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      } else {
        setError(err.message || 'שגיאה בהרשמה');
      }
    }
  };

  const handleProviderSignIn = async (provider) => {
    try {
      await signInWithProvider(provider);
      // Note: Provider sign-in redirects, so onSuccess won't be called immediately
    } catch (err) {
      console.error(`${provider} sign up error:`, err);
      setError(`שגיאה בהרשמה עם ${provider === 'google' ? 'Google' : 'Facebook'}`);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Success Message */}
      {success && (
        <Alert 
          severity="success" 
          icon={<CheckCircleIcon />}
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%',
              textAlign: 'center'
            }
          }}
        >
          {success}
        </Alert>
      )}

      {/* Social Sign Up */}
      {!success && (
        <>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<GoogleIcon />}
              onClick={() => handleProviderSignIn('google')}
              disabled={loading}
              sx={{
                borderColor: 'grey.300',
                color: 'text.primary',
                textTransform: 'none',
                fontSize: '1rem',
                py: 1.5,
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50'
                }
              }}
            >
              הרשמה עם Google
            </Button>

            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<FacebookIcon />}
              onClick={() => handleProviderSignIn('facebook')}
              disabled={loading}
              sx={{
                borderColor: 'grey.300',
                color: 'text.primary',
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

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
            <Divider sx={{ flex: 1 }} />
            <Chip 
              label="או" 
              size="small" 
              sx={{ 
                mx: 2, 
                backgroundColor: 'background.paper',
                color: 'text.secondary'
              }} 
            />
            <Divider sx={{ flex: 1 }} />
          </Box>

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

          {/* Password Strength Indicator */}
          {formData.password && (
            <Box sx={{ mt: 1, mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  חוזק הסיסמה
                </Typography>
                <Typography variant="caption" color={`${passwordStrength.color}.main`}>
                  {passwordStrength.label}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={passwordStrength.strength}
                color={passwordStrength.color}
                sx={{
                  height: 4,
                  borderRadius: 2,
                }}
              />
            </Box>
          )}

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

          {/* Terms and Conditions */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.acceptTerms}
                onChange={handleChange('acceptTerms')}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                אני מסכים/ה ל
                <Link href="#" sx={{ mx: 0.5 }}>
                  תנאי השימוש
                </Link>
                ול
                <Link href="#" sx={{ mx: 0.5 }}>
                  מדיניות הפרטיות
                </Link>
              </Typography>
            }
            sx={{ mt: 2, alignItems: 'flex-start' }}
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

          {/* Sign Up Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
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
              }
            }}
          >
            {loading ? 'נרשם...' : 'הרשמה'}
          </Button>

          {/* Switch to Sign In */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              יש לך כבר חשבון?{' '}
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={onSwitchToSignIn}
                sx={{
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: 'primary.main',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                התחברות
              </Link>
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SignUpForm;
