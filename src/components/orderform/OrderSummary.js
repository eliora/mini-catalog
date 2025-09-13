import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Grid
} from '@mui/material';
import StyledButton from '../ui/StyledButton';

/**
 * Order Summary Component (OS Column)
 * Displays customer info, price breakdown, and submit button
 */
const OrderSummary = ({
  customerName,
  onCustomerNameChange,
  cart,
  subtotal,
  tax,
  total,
  formatCurrency,
  companySettings,
  isSubmitting,
  onSubmit
}) => {
  return (
    <Grid item xs={12} lg={4}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        סיכום הזמנה
      </Typography>
      
      <Box
        sx={{
          position: { lg: 'sticky' },
          top: { lg: 20 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        {/* Customer Name Section */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
            פרטי לקוח
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="הזן שם לקוח (אופציונלי)"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.875rem'
              }
            }}
          />
        </Box>

        {/* Order Summary Section */}
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
            פירוט מחיר
          </Typography>
          
          <Stack spacing={1}>
            {/* Subtotal */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                סכום ביניים
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatCurrency(subtotal)}
              </Typography>
            </Box>

            {/* Tax */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                מע"מ ({companySettings?.taxRate || 17}%)
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatCurrency(tax)}
              </Typography>
            </Box>

            {/* Divider */}
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', my: 1 }} />

            {/* Total */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                סה"כ לתשלום
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {formatCurrency(total)}
              </Typography>
            </Box>

            {/* Items Summary */}
            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', py: 1 }}>
              {cart.length} מוצרים • {cart.reduce((sum, item) => sum + item.quantity, 0)} יחידות
            </Typography>

            {/* Submit Button */}
            <StyledButton
              fullWidth
              disabled={cart.length === 0 || isSubmitting}
              onClick={onSubmit}
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              {isSubmitting ? 'מעבד הזמנה...' : 'הגש הזמנה'}
            </StyledButton>
          </Stack>
        </Box>
      </Box>
    </Grid>
  );
};

export default React.memo(OrderSummary);
