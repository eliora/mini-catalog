/**
 * InvoiceSettingsSection Component - Invoice and order settings
 * 
 * Form section for managing invoice-related settings including
 * footer text, tax rate, and other order-related configurations.
 * 
 * Features:
 * - Multi-line invoice footer
 * - Tax rate configuration
 * - Order-related settings
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

const InvoiceSettingsSection = ({ settings, onChange }) => {
  return (
    <>
      {/* Invoice Settings */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
          הגדרות הזמנות
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="כותרת תחתונה להזמנה"
          value={settings.invoiceFooter}
          onChange={onChange('invoiceFooter')}
          placeholder="תודה על ההזמנה! ליצירת קשר: info@company.com"
          helperText="טקסט שיופיע בתחתית כל הזמנה מודפסת"
          sx={{ }}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="שיעור מע״מ (%)"
          type="number"
          value={settings.taxRate}
          onChange={onChange('taxRate')}
          placeholder="17"
          helperText="שיעור המע״מ בהזמנות (אחוזים)"
          inputProps={{ min: 0, max: 100, step: 0.1 }}
          sx={{ }}
        />
      </Grid>
    </>
  );
};

export default React.memo(InvoiceSettingsSection);
