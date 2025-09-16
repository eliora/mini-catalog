/**
 * ErrorBoundary Component - TypeScript Error Boundary for Next.js
 * 
 * Catches JavaScript errors anywhere in the child component tree and displays
 * a fallback UI instead of crashing the entire application.
 * 
 * Features:
 * - TypeScript support with proper error types
 * - Next.js compatible error handling
 * - Development error details
 * - User-friendly error messages in Hebrew
 * - Retry functionality
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // In production, you might want to send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, { extra: errorInfo });
    }
  }

  handleReset = (): void => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleGoHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" color="error" gutterBottom>
              שגיאה בטעינת האפליקציה
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              אירעה שגיאה בעת טעינת האפליקציה. אנא נסה לרענן את הדף או חזור לעמוד הבית.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                onClick={this.handleReload}
                startIcon={<RefreshIcon />}
                color="primary"
              >
                רענן דף
              </Button>
              <Button 
                variant="outlined" 
                onClick={this.handleReset}
                color="primary"
              >
                נסה שוב
              </Button>
              <Button 
                variant="text" 
                onClick={this.handleGoHome}
                startIcon={<HomeIcon />}
                color="primary"
              >
                עמוד הבית
              </Button>
            </Box>
            
            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ 
                mt: 4, 
                textAlign: 'left', 
                backgroundColor: 'grey.100', 
                p: 2, 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.300'
              }}>
                <Typography variant="h6" color="error" gutterBottom>
                  שגיאה טכנית (מצב פיתוח בלבד):
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.875rem', 
                    mb: 2,
                    color: 'error.main',
                    backgroundColor: 'background.paper',
                    p: 1,
                    borderRadius: 0.5,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {this.state.error.toString()}
                </Typography>
                
                {this.state.errorInfo?.componentStack && (
                  <>
                    <Typography variant="subtitle2" color="text.primary" gutterBottom>
                      Component Stack:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.75rem',
                        whiteSpace: 'pre-wrap',
                        backgroundColor: 'background.paper',
                        p: 1,
                        borderRadius: 0.5,
                        maxHeight: 300,
                        overflow: 'auto',
                        color: 'text.secondary'
                      }}
                    >
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  </>
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
