import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Container,
  Card,
  CardContent
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import { useAuth } from '../context/AuthContext';

const Login = ({ onLogin }) => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formContext = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const handleSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      console.log('[FE] Login submit', data);
      const result = await login(data.username, data.password);
      console.log('[FE] Login success', result);
      onLogin(true);
    } catch (err) {
      console.warn('[FE] Login failed', err);
      setError(err.message || 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              התחברות מנהל
            </Typography>
            <Typography variant="body1" color="text.secondary">
              הזן פרטי התחברות לגישה ללוח הניהול
            </Typography>
          </Box>

          <FormContainer
            formContext={formContext}
            onSuccess={handleSubmit}
          >
            <TextFieldElement
              name="username"
              label="שם משתמש"
              required
              fullWidth
              margin="normal"
              dir="rtl"
            />
            
            <TextFieldElement
              name="password"
              label="סיסמה"
              type="password"
              required
              fullWidth
              margin="normal"
              dir="rtl"
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'מתחבר...' : 'התחבר'}
            </Button>
          </FormContainer>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              פרטי התחברות ברירת מחדל: admin / qprffo
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
