'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Container,
  Card,
  CardContent,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  Lock as LockIcon,
  Person as PersonIcon 
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

// Props interface
interface LoginProps {
  onLogin?: (success: boolean) => void;
  redirectTo?: string;
}

// Form data interface
interface LoginFormData {
  username: string;
  password: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, redirectTo = '/' }) => {
  const { signIn, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string>('');

  // Handle form field changes
  const handleChange = (field: keyof LoginFormData) => (
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
    if (!formData.username || !formData.password) {
      setError('נא למלא את כל השדות');
      return;
    }

    try {
      console.log('[FE] Login submit', formData);
      const result = await signIn(formData.username, formData.password);
      
      if (result.error) {
        handleLoginError(result.error);
      } else {
        console.log('[FE] Login success');
        onLogin?.(true);
        
        // Redirect to specified path
        if (typeof window !== 'undefined') {
          window.location.href = redirectTo;
        }
      }
    } catch (err) {
      console.warn('[FE] Login failed', err);
      setError('שגיאה בהתחברות');
    }
  };

  // Handle specific login errors
  const handleLoginError = (errorMessage: string) => {
    if (errorMessage.includes('Invalid login credentials')) {
      setError('שם משתמש או סיסמה שגויים');
    } else if (errorMessage.includes('Email not confirmed')) {
      setError('נא לאמת את האימייל שלך לפני ההתחברות');
    } else if (errorMessage.includes('Too many requests')) {
      setError('יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר');
    } else {
      setError(errorMessage || 'שגיאה בהתחברות');
    }
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        mt: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        justifyContent: 'center'
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 480,
          boxShadow: 4,
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LockIcon 
              sx={{ 
                fontSize: 48, 
                color: 'primary.main', 
                mb: 2,
                p: 1,
                borderRadius: '50%',
                backgroundColor: 'primary.50'
              }} 
            />
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                color: 'text.primary'
              }}
            >
              התחברות מנהל
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              הזן פרטי התחברות לגישה ללוח הניהול
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Username Field */}
            <TextField
              name="username"
              label="שם משתמש / אימייל"
              value={formData.username}
              onChange={handleChange('username')}
              required
              fullWidth
              margin="normal"
              autoComplete="username"
              disabled={isLoading}
              error={error.includes('משתמש') || error.includes('אימייל')}
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
            
            {/* Password Field */}
            <TextField
              name="password"
              label="סיסמה"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              required
              fullWidth
              margin="normal"
              autoComplete="current-password"
              disabled={isLoading}
              error={error.includes('סיסמה')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
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

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading || !formData.username || !formData.password}
              sx={{ 
                mt: 3,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
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
              {isLoading ? 'מתחבר...' : 'התחבר'}
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              לבעיות בהתחברות, פנה למנהל המערכת
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;

