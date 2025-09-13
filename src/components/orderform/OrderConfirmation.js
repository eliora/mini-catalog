import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Fade
} from '@mui/material';
import { 
  CheckCircle as CheckIcon 
} from '@mui/icons-material';

/**
 * Order Confirmation Display Component
 * Shows order summary after successful submission
 */
const OrderConfirmation = ({ orderSummary, formatCurrency }) => {
  if (!orderSummary) return null;

  return (
    <Fade in timeout={800}>
      <Box>
        {/* Success Header */}
        <Card
          elevation={8}
          sx={{
            borderRadius: 3,
            background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
            color: 'white',
            mb: 3
          }}
        >
          <CardHeader
            avatar={<CheckIcon sx={{ fontSize: 40 }} />}
            title={
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                ההזמנה התקבלה בהצלחה!
              </Typography>
            }
            subheader={
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mt: 1 }}>
                מספר הזמנה: #{orderSummary.orderId}
              </Typography>
            }
          />
        </Card>

        {/* Order Details */}
        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                פרטי ההזמנה
              </Typography>
            }
            subheader={`הוזמן על ידי: ${orderSummary.customerName}`}
          />
          <CardContent>
            {/* Order Items Table */}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>מק"ט</TableCell>
                  <TableCell>שם המוצר</TableCell>
                  <TableCell align="center">גודל</TableCell>
                  <TableCell align="center">מחיר יחידה</TableCell>
                  <TableCell align="center">כמות</TableCell>
                  <TableCell align="center">סה"כ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderSummary.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.ref}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.productName}
                      </Typography>
                      {item.productName2 && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {item.productName2}
                        </Typography>
                      )}
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
                        {formatCurrency(item.totalPrice)}
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
      </Box>
    </Fade>
  );
};

export default OrderConfirmation;
