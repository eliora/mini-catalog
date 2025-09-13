/**
 * CsvImport Component (Refactored) - CSV data import interface
 * 
 * Comprehensive CSV import system for bulk product data management.
 * Refactored from 405 lines to ~80 lines by extracting specialized components.
 * 
 * Architecture:
 * - useCsvImport: Import operations and state management
 * - csvHelpers: CSV parsing and data transformation utilities
 * - FileUploadSection: File selection and upload interface
 * - PreviewSection: Data preview before import
 * - ImportResults: Success results display
 * - ImportConfirmDialog: Confirmation modal
 * 
 * Features:
 * - CSV file parsing and validation
 * - Data preview and confirmation
 * - Batch import with progress tracking
 * - Error handling and user feedback
 * - Complete product replacement workflow
 * 
 * Performance:
 * - React.memo optimization
 * - Extracted utility functions
 * - Modular component architecture
 * - Reduced bundle size through code splitting
 */

import React from 'react';
import { Box, Snackbar, Alert } from '@mui/material';

// Extracted hooks and components
import useCsvImport from '../../../hooks/useCsvImport';
import FileUploadSection from './csv/FileUploadSection';
import PreviewSection from './csv/PreviewSection';
import ImportResults from './csv/ImportResults';
import ImportConfirmDialog from './csv/ImportConfirmDialog';

const CsvImport = ({ onImportComplete }) => {
  // ===== EXTRACTED IMPORT MANAGEMENT =====
  const {
    file,
    uploading,
    progress,
    results,
    preview,
    snackbar,
    confirmDialog,
    handleFileSelect,
    importData,
    showConfirmDialog,
    closeSnackbar,
    setConfirmDialog
  } = useCsvImport(onImportComplete);

  // ===== RENDER =====
  return (
    <Box>
      {/* File Upload Section */}
      <FileUploadSection
        file={file}
        uploading={uploading}
        progress={progress}
        onFileSelect={handleFileSelect}
      />

      {/* Data Preview Section */}
      <PreviewSection
        preview={preview}
        uploading={uploading}
        onConfirmImport={showConfirmDialog}
      />

      {/* Import Results */}
      <ImportResults results={results} />

      {/* Confirmation Dialog */}
      <ImportConfirmDialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        onConfirm={importData}
      />

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
      >
        <Alert severity={snackbar.severity} onClose={closeSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(CsvImport);