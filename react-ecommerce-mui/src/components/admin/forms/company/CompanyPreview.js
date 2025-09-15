/**
 * CompanyPreview Component - Live preview of company settings
 * 
 * Displays a live preview of how company information will appear
 * in printed orders and other public-facing materials.
 * 
 * Features:
 * - Live preview of company details
 * - Styled like actual order printouts
 * - Conditional rendering of optional fields
 * 
 * Props:
 * - settings: Company settings object
 */

import React from 'react';
import {
  Paper,
  Typography
} from '@mui/material';

const CompanyPreview = ({ settings }) => {
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
        תצוגה מקדימה
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        כך יופיעו הפרטים בהזמנות מודפסות:
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          {settings.companyName || 'שם החברה'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {settings.companyDescription || 'תיאור החברה'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {settings.companyTagline || 'סלוגן החברה'}
        </Typography>
        {settings.companyAddress && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            כתובת: {settings.companyAddress}
          </Typography>
        )}
        {(settings.companyPhone || settings.companyEmail) && (
          <Typography variant="caption" display="block">
            {settings.companyPhone && `טל: ${settings.companyPhone}`}
            {settings.companyPhone && settings.companyEmail && ' | '}
            {settings.companyEmail && `מייל: ${settings.companyEmail}`}
          </Typography>
        )}
      </Paper>
    </Paper>
  );
};

export default React.memo(CompanyPreview);
