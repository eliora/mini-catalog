/**
 * CompanySettings Component (Refactored) - Company configuration management
 * 
 * Comprehensive company settings form for managing business information.
 * Refactored from 404 lines to ~100 lines by extracting specialized components.
 * 
 * Architecture:
 * - useCompanySettings: Data management and API operations
 * - CompanyInfoSection: Basic company info and logo
 * - ContactInfoSection: Contact details form
 * - InvoiceSettingsSection: Invoice and tax settings
 * - CompanyPreview: Live preview of settings
 * 
 * Features:
 * - Company information management
 * - Logo upload and preview
 * - Contact information forms
 * - Invoice settings configuration
 * - Live preview of changes
 * - Error handling and validation
 * 
 * Performance:
 * - React.memo optimization
 * - Extracted form sections
 * - Reduced bundle size through code splitting
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Alert,
  Snackbar,
  Stack
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Extracted hooks and components
import useCompanySettings from '../../../hooks/useCompanySettings';
import CompanyInfoSection from './company/CompanyInfoSection';
import ContactInfoSection from './company/ContactInfoSection';
import InvoiceSettingsSection from './company/InvoiceSettingsSection';
import CompanyPreview from './company/CompanyPreview';

const CompanySettings = () => {
  // ===== EXTRACTED DATA MANAGEMENT =====
  const {
    settings,
    loading,
    saving,
    snackbar,
    saveSettings,
    loadSettings,
    handleChange,
    handleLogoUpload,
    handleLogoDelete,
    closeSnackbar
  } = useCompanySettings();

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>טוען הגדרות...</Typography>
      </Box>
    );
  }

  // ===== RENDER =====
  return (
    <Box>
      {/* Main Settings Form */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            הגדרות החברה
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadSettings}
              disabled={saving}
            >
              רענן
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveSettings}
              disabled={saving}
              sx={{ minWidth: 120 }}
            >
              {saving ? 'שומר...' : 'שמור הגדרות'}
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          <CompanyInfoSection
            settings={settings}
            onChange={handleChange}
            onLogoUpload={handleLogoUpload}
            onLogoDelete={handleLogoDelete}
          />
          
          <ContactInfoSection
            settings={settings}
            onChange={handleChange}
          />
          
          <InvoiceSettingsSection
            settings={settings}
            onChange={handleChange}
          />
        </Grid>
      </Paper>

      {/* Preview Section */}
      <CompanyPreview settings={settings} />

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={closeSnackbar}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(CompanySettings);