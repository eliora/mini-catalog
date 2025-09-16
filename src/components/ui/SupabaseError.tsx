/**
 * SupabaseError Component - Error Display for Supabase Operations
 * 
 * Displays user-friendly error messages for Supabase database operations.
 * Provides retry functionality and appropriate error styling.
 */

import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface SupabaseErrorProps {
  error: Error | string;
  onRetry?: () => void;
  title?: string;
  showRetry?: boolean;
  variant?: 'standard' | 'filled' | 'outlined';
  severity?: 'error' | 'warning' | 'info';
}

const SupabaseError: React.FC<SupabaseErrorProps> = ({
  error,
  onRetry,
  title = 'שגיאה בטעינת הנתונים',
  showRetry = true,
  variant = 'standard',
  severity = 'error'
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Box sx={{ my: 2 }}>
      <Alert 
        severity={severity} 
        variant={variant}
        action={
          showRetry && onRetry ? (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
            >
              נסה שוב
            </Button>
          ) : null
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {errorMessage}
      </Alert>
    </Box>
  );
};

export default SupabaseError;
