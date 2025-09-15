/**
 * ImportResults Component - Import completion status display
 * 
 * Shows the results of CSV import operation including success statistics
 * and any important information about the imported data.
 * 
 * Features:
 * - Success message with statistics
 * - Import summary information
 * - Styled alert component
 * - Clear result display
 * 
 * Props:
 * - results: Import results object with total/imported counts
 */

import React from 'react';
import {
  Alert,
  Typography
} from '@mui/material';

const ImportResults = ({ results }) => {
  if (!results) return null;

  return (
    <Alert severity="success" sx={{ mb: 2 }}>
      <Typography variant="body1">
        ✅ ייבוא הושלם בהצלחה!
      </Typography>
      <Typography variant="body2">
        סה"כ מוצרים בקובץ: {results.total}
      </Typography>
      <Typography variant="body2">
        מוצרים מיובאים: {results.imported}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        🔄 כל המוצרים הקיימים הוחלפו בנתונים מהקובץ
      </Typography>
    </Alert>
  );
};

export default React.memo(ImportResults);
