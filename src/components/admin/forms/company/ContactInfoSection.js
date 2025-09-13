/**
 * ContactInfoSection Component - Contact information form
 * 
 * Form section for managing company contact information including
 * address, phone, and email details.
 * 
 * Features:
 * - Multi-line address field
 * - Phone number input
 * - Email input with validation
 * - Responsive grid layout
 * 
 * Props:
 * - settings: Company settings object
 * - onChange: Field change handler
 */

import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Divider
} from '@mui/material';

const ContactInfoSection = ({ settings, onChange }) => {
  return (
    <>
      {/* Contact Information */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
          פרטי יצירת קשר
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="כתובת החברה"
          value={settings.companyAddress}
          onChange={onChange('companyAddress')}
          placeholder="רחוב XXX, עיר, מיקוד"
          helperText="כתובת מלאה של החברה (אופציונלי)"
          sx={{ }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="טלפון"
          value={settings.companyPhone}
          onChange={onChange('companyPhone')}
          placeholder="03-1234567"
          helperText="מספר טלפון ליצירת קשר"
          sx={{ }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="אימייל"
          type="email"
          value={settings.companyEmail}
          onChange={onChange('companyEmail')}
          placeholder="info@company.com"
          helperText="כתובת אימייל ליצירת קשר"
          sx={{ }}
        />
      </Grid>
    </>
  );
};

export default React.memo(ContactInfoSection);
