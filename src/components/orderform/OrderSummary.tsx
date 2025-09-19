/**
 * Order Summary Component (OS Column)
 * Displays customer info, price breakdown, and submit button
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack
} from '@mui/material';
// Helper function to get cart length and total quantity
function getCartStats(cart: Array<{ quantity?: number }>): { length: number; totalQuantity: number } {
  return {
    length: cart.length,
    totalQuantity: cart.reduce((sum, item) => sum + (item.quantity || 0), 0)
  };
}
import { CompanySettings } from '../../types/company';

interface OrderSummaryProps {
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  cart: Array<{ quantity?: number }>; // Support both legacy and new cart formats
  subtotal: number;
  tax: number;
  total: number;
  formatCurrency: (amount: number) => string;
  companySettings: CompanySettings | null;
  isSubmitting: boolean;
  onSubmit: () => void;
  canViewPrices?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  customerName,
  onCustomerNameChange,
  cart,
  subtotal,
  tax,
  total,
  formatCurrency,
  companySettings,
  isSubmitting,
  onSubmit,
  canViewPrices: _canViewPrices = true // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  return (
    <>
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
                מע&quot;מ ({companySettings?.tax_rate ? (companySettings.tax_rate * 100).toFixed(0) : 18}%)
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
                סה&quot;כ לתשלום
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {formatCurrency(total)}
              </Typography>
            </Box>

            {/* Items Summary */}
            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', py: 1 }}>
              {(() => {
                const stats = getCartStats(cart);
                return `${stats.length} מוצרים • ${stats.totalQuantity} יחידות`;
              })()}
            </Typography>

            {/* Submit Button */}
            <Box
              component="button"
              disabled={cart.length === 0 || isSubmitting}
              onClick={onSubmit}
              sx={{
                width: '100%',
                mt: 2,
                py: 1.5,
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'primary.contrastText',
                backgroundColor: 'primary.main',
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  borderColor: 'primary.dark',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                },
                '&:disabled': {
                  backgroundColor: 'grey.300',
                  borderColor: 'grey.300',
                  color: 'text.disabled',
                  cursor: 'not-allowed',
                  boxShadow: 'none'
                }
              }}
            >
              {isSubmitting ? 'מעבד הזמנה...' : 'הגש הזמנה'}
            </Box>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default React.memo(OrderSummary);
