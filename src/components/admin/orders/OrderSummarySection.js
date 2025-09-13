/**
 * OrderSummarySection Component
 * 
 * Displays order financial summary with subtotal, tax, and total calculations.
 * Extracted from OrderDetails.js for better maintainability and reusability.
 * 
 * Features:
 * - Subtotal calculation from all items
 * - Tax calculation based on company settings
 * - Total amount with proper formatting
 * - Responsive design with clear visual hierarchy
 * 
 * @param {number} subtotal - Order subtotal amount
 * @param {number} tax - Tax amount
 * @param {number} total - Total order amount
 * @param {number} taxRate - Tax rate percentage
 * @param {Function} formatCurrency - Currency formatting function
 */

import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Stack
} from '@mui/material';

const OrderSummarySection = ({
  subtotal,
  tax,
  total,
  taxRate,
  formatCurrency
}) => {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Grid container justifyContent="flex-end">
        <Grid item xs={12} md={4}>
          <Box sx={{ 
            border: '1px solid', 
            borderColor: 'primary.main', 
            borderRadius: 1, 
            overflow: 'hidden' 
          }}>
            {/* Summary Header */}
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                סיכום הזמנה
              </Typography>
            </Box>
            
            {/* Summary Details */}
            <Stack spacing={0}>
              {/* Subtotal */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'grey.50' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>סכום ביניים:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatCurrency(subtotal)}
                </Typography>
              </Box>
              
              {/* Tax */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'warning.light' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>מע"מ ({taxRate}%):</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatCurrency(tax)}
                </Typography>
              </Box>
              
              {/* Total */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>סה"כ לתשלום:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {formatCurrency(total)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(OrderSummarySection);
