/**
 * FileUploadSection Component - CSV file upload interface
 * 
 * Handles file selection and displays upload progress with file preview.
 * Provides user feedback for file validation and processing.
 * 
 * Features:
 * - File input with drag-and-drop styling
 * - Progress bar during processing
 * - File validation feedback
 * - Upload state management
 * 
 * Props:
 * - file: Selected file object
 * - uploading: Upload state boolean
 * - progress: Progress percentage (0-100)
 * - onFileSelect: File selection handler
 */

import React from 'react';
import {
  Paper,
  Typography,
  Button,
  LinearProgress,
  Box
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

const FileUploadSection = ({ file, uploading, progress, onFileSelect }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        ייבוא מוצרים מקובץ CSV
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        העלה קובץ CSV עם פרטי המוצרים. הקובץ חייב לכלול עמודות: ref no, product name
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<UploadIcon />}
          disabled={uploading}
          fullWidth
          sx={{
            py: 2,
            borderStyle: 'dashed',
            borderWidth: 2,
            '&:hover': {
              borderStyle: 'dashed',
              borderWidth: 2
            }
          }}
        >
          {file ? file.name : 'בחר קובץ CSV'}
          <input
            type="file"
            hidden
            accept=".csv"
            onChange={onFileSelect}
          />
        </Button>

        {uploading && (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              מייבא נתונים... {Math.round(progress)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default React.memo(FileUploadSection);
