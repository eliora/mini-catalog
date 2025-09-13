/**
 * PreviewSection Component - CSV data preview display
 * 
 * Shows a preview of parsed CSV data before import confirmation.
 * Displays first few rows in a formatted list for user verification.
 * 
 * Features:
 * - Formatted data preview
 * - Product information chips
 * - Import confirmation button
 * - Responsive layout
 * 
 * Props:
 * - preview: Array of preview data objects
 * - uploading: Upload state boolean
 * - onConfirmImport: Import confirmation handler
 */

import React from 'react';
import {
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box
} from '@mui/material';
import { CheckCircle as SuccessIcon } from '@mui/icons-material';

const PreviewSection = ({ preview, uploading, onConfirmImport }) => {
  if (!preview || preview.length === 0) return null;

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        תצוגה מקדימה
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        הנה דוגמה מהמוצרים שיובאו:
      </Typography>

      <List dense>
        {preview.map((item, index) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={item.ref} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.name}
                  </Typography>
                  {item.name2 && (
                    <Typography variant="body2" color="text.secondary">
                      ({item.name2})
                    </Typography>
                  )}
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  {item.size && (
                    <Chip 
                      label={`גודל: ${item.size}`} 
                      size="small" 
                      variant="outlined" 
                    />
                  )}
                  {item.brand && (
                    <Chip 
                      label={`מותג: ${item.brand}`} 
                      size="small" 
                      variant="outlined" 
                    />
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<SuccessIcon />}
          onClick={onConfirmImport}
          disabled={uploading}
          size="large"
          fullWidth
        >
          {uploading ? 'מייבא...' : 'ייבא מוצרים'}
        </Button>
      </Box>
    </Paper>
  );
};

export default React.memo(PreviewSection);
