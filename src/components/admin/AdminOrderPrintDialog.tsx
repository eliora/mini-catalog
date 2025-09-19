/**
 * AdminOrderPrintDialog Component
 * 
 * Dialog component for admins to print orders from the admin panel.
 * Uses the reusable OrderPrintView component.
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import OrderPrintTemplate from '../print/OrderPrintTemplate';
import { usePrint } from '@/hooks/usePrint';

interface AdminOrderPrintDialogProps {
  open: boolean;
  onClose: () => void;
  order: {
    id: string;
    customer_name: string;
    created_at: string;
    items: Array<{
      ref: string;
      product_name: string;
      product_name_2?: string;
      size?: string;
      unit_price: number;
      quantity: number;
    }>;
    subtotal: number;
    tax: number;
    total_amount: number;
  };
  formatCurrency: (amount: number) => string;
}

const AdminOrderPrintDialog: React.FC<AdminOrderPrintDialogProps> = ({
  open,
  onClose,
  order,
  formatCurrency
}) => {
  const formatOrderNumber = (orderId: string): string => {
    return `#${orderId.substring(0, 8).toUpperCase()}`;
  };

  const { printRef, handlePrint } = usePrint({
    documentTitle: `הזמנה ${formatOrderNumber(order?.id || '')}`
  });

  return (
    <>
      {/* Print Component - Hidden on screen, visible in print */}
      <div style={{ display: 'none' }}>
        <OrderPrintTemplate
          ref={printRef}
          orderId={order.id}
          customerName={order.customer_name}
          orderDate={new Date(order.created_at).toLocaleDateString('he-IL')}
          items={order.items.map(item => ({
            ref: item.ref || '',
            product_name: item.product_name || '',
            product_name_2: item.product_name_2 || '',
            size: item.size || '',
            unit_price: item.unit_price || 0,
            quantity: item.quantity || 1
          }))}
          subtotal={order.total_amount / (1 + 0.17)}
          tax={order.total_amount - (order.total_amount / (1 + 0.17))}
          total={order.total_amount}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Dialog - Visible on screen, hidden in print */}
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            '@media print': {
              display: 'none !important'
            }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">הדפס הזמנה #{order.id.substring(0, 8).toUpperCase()}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              לקוח: {order.customer_name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              תאריך הזמנה: {new Date(order.created_at).toLocaleDateString('he-IL')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              סה&quot;כ הזמנה: {formatCurrency(order.total_amount)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              לחץ על &quot;הדפס&quot; כדי להדפיס את ההזמנה בפורמט מקצועי.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined">
            ביטול
          </Button>
          <Button
            onClick={handlePrint}
            variant="contained"
            startIcon={<PrintIcon />}
            sx={{ backgroundColor: 'primary.main' }}
          >
            הדפס הזמנה
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminOrderPrintDialog;
