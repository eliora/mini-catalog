/**
 * ImportConfirmDialog Component - Import confirmation modal
 * 
 * Displays a confirmation dialog before proceeding with CSV import.
 * Warns users about data replacement and provides clear action options.
 * 
 * Features:
 * - Warning message about data replacement
 * - Clear confirmation/cancel actions
 * - Styled dialog with proper spacing
 * - Accessible button layout
 * 
 * Props:
 * - open: Dialog open state
 * - onClose: Dialog close handler
 * - onConfirm: Import confirmation handler
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button
} from '@mui/material';

const ImportConfirmDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>אישור ייבוא</DialogTitle>
      <DialogContent>
        <Typography>
          ⚠️ פעולה זו תמחק את כל המוצרים הקיימים ותייבא מחדש מקובץ ה-CSV.
          כל הנתונים הקיימים יוחלפו בנתונים מהקובץ.
          האם להמשיך?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          ביטול
        </Button>
        <Button onClick={onConfirm} variant="contained" color="warning">
          אישור ייבוא
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(ImportConfirmDialog);
