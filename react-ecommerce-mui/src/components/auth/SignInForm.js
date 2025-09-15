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
  Chip
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon
} from '@mui/icons-material';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

const SignInForm = ({ onSuccess, onSwitchToSignUp }) => {
  const { signIn, signInWithProvider, loading } = useSupabaseAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('נא למלא את כל השדות');
      return;
    }

    try {
      await signIn(formData.email, formData.password);
      onSuccess();
    } catch (err) {
      console.error('Sign in error:', err);
      
      // Handle specific Supabase errors
      if (err.message?.includes('Invalid login credentials')) {
        setError('אימייל או סיסמה שגויים');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('נא לאמת את האימייל שלך לפני ההתחברות');
      } else {
        setError(err.message || 'שגיאה בהתחברות');
      }
    }
  };

  const handleProviderSignIn = async (provider) => {
    try {
      await signInWithProvider(provider);
      // Note: Provider sign-in redirects, so onSuccess won't be called immediately
    } catch (err) {
      console.error(`${provider} sign in error:`, err);
      setError(`שגיאה בהתחברות עם ${provider === 'google' ? 'Google' : 'Facebook'}`);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Social Sign In */}
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
          המשך עם Google
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
            color: 'text.secondary'
          }} 
        />
        <Divider sx={{ flex: 1 }} />
      </Box>

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
        autoComplete="current-password"
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
        {loading ? 'מתחבר...' : 'התחבר'}
      </Button>

      {/* Forgot Password Link */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={() => {
            // TODO: Implement forgot password
            console.log('Forgot password clicked');
          }}
          sx={{
            textDecoration: 'none',
            color: 'primary.main',
            '&:hover': {
              textDecoration: 'underline',
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
            sx={{
              fontWeight: 600,
              textDecoration: 'none',
              color: 'primary.main',
              '&:hover': {
                textDecoration: 'underline',
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
