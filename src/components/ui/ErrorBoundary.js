import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" color="error" gutterBottom>
              שגיאה בטעינת האפליקציה
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              אירעה שגיאה בעת טעינת האפליקציה. אנא נסה לרענן את הדף.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ mr: 2 }}
            >
              רענן דף
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            >
              נסה שוב
            </Button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mt: 3, textAlign: 'left', backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" color="error">
                  Error Details (Development Only):
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', mt: 1 }}>
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo.componentStack && (
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', mt: 1, whiteSpace: 'pre-wrap' }}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
