/**
 * @file Admin Page Layout Component
 * @description Standard layout wrapper for all admin management pages
 * Provides consistent structure and styling
 */

'use client';

import React from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';

interface AdminPageLayoutProps {
  children: React.ReactNode;
  title: string;
  loading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
}

const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({
  children,
  title: _title, // eslint-disable-line @typescript-eslint/no-unused-vars
  loading = false,
  error = null,
  onErrorDismiss
}) => {
  // Show loading spinner for initial load
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Title - Hidden for now, handled by individual pages */}
      
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={onErrorDismiss}
        >
          {error}
        </Alert>
      )}
      
      {/* Main Content */}
      {children}
    </Box>
  );
};

export default AdminPageLayout;
