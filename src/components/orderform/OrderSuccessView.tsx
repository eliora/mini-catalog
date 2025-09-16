/**
 * OrderSuccessView Component
 * 
 * Displays order confirmation after successful submission.
 * Shows order details, items table, and action buttons (new order, print).
 */

'use client';

import React, { forwardRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Button
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Print as PrintIcon
} from '@mui/icons-material';
// Legacy cart item interface for backward compatibility  
interface LegacyCartItem {
  ref: string;
  productName: string;
  productName2?: string;
  size?: string;
  unitPrice: number;
  quantity: number;
}

interface OrderSummary {
  orderId: string;
  customerName: string;
  items: LegacyCartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

interface OrderSuccessViewProps {
  orderSummary: OrderSummary;
  formatCurrency: (amount: number) => string;
  onNewOrder: () => void;
}

const OrderSuccessView = forwardRef<HTMLDivElement, OrderSuccessViewProps>(({ 
  orderSummary, 
  formatCurrency, 
  onNewOrder 
}, ref) => {
  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', p: 3 }}>
      <Paper 
        ref={ref}
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'success.dark' }}>
            הזמנה הוגשה בהצלחה!
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            מספר הזמנה: #{orderSummary.orderId}
          </Typography>
        </Box>

        {/* Order Details */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              פרטי ההזמנה
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: '#7D879C', mb: 0.5 }}>לקוח:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  {orderSummary.customerName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: '#7D879C', mb: 0.5 }}>תאריך:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  {new Date().toLocaleDateString('he-IL')}
                </Typography>
              </Grid>
            </Grid>

            {/* Order Items Table */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3, mb: 2 }}>
              פריטים שהוזמנו
            </Typography>
            
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#2B3445' }}>מוצר</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#2B3445' }}>גודל</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#2B3445' }}>מחיר יחידה</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#2B3445' }}>כמות</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#2B3445' }}>סה"כ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderSummary.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#2B3445' }}>
                          {item.productName}
                        </Typography>
                        {item.productName2 && (
                          <Typography variant="body2" sx={{ color: '#7D879C' }}>
                            {item.productName2}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{item.size || '-'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{formatCurrency(item.unitPrice)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{item.quantity}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency((item.unitPrice || 0) * (item.quantity || 0))}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Order Summary */}
            <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid #E3E9EF' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography variant="body2" sx={{ color: '#7D879C' }}>
                    תודה על ההזמנה! נציגנו יצור איתך קשר בקרוב.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">סכום ביניים:</Typography>
                      <Typography variant="body2">{formatCurrency(orderSummary.subtotal)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">מע"מ:</Typography>
                      <Typography variant="body2">{formatCurrency(orderSummary.tax)}</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>סה"כ:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {formatCurrency(orderSummary.total)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            onClick={onNewOrder}
            variant="outlined"
            sx={{ 
              minWidth: 150,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: 'primary.50'
              }
            }}
          >
            הזמנה חדשה
          </Button>
          <Button
            onClick={() => window.print()}
            startIcon={<PrintIcon />}
            variant="contained"
            sx={{ 
              minWidth: 150,
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }}
          >
            הדפס הזמנה
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
});

OrderSuccessView.displayName = 'OrderSuccessView';

export default React.memo(OrderSuccessView);