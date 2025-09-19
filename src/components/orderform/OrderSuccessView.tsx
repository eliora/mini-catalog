/**
 * OrderSuccessView Component
 * 
 * Displays order confirmation after successful submission.
 * Shows order details, items table, and action buttons (new order, print).
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Divider,
  Button
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import OrderPrintTemplate from '../print/OrderPrintTemplate';
import { usePrint } from '@/hooks/usePrint';

// Utility function to format order number
const formatOrderNumber = (orderId: string): string => {
  // Extract first 8 characters and make them uppercase for a cleaner look
  const shortId = orderId.substring(0, 8).toUpperCase();
  return `#${shortId}`;
};
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

const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({ 
  orderSummary, 
  formatCurrency, 
  onNewOrder 
}) => {
  // Use the new print hook
  const { printRef, handlePrint } = usePrint({
    documentTitle: `הזמנה ${formatOrderNumber(orderSummary.orderId)}`
  });
  // Convert legacy items to CartItem format for CartItemsTable
  const cartItems = orderSummary.items.map(item => ({
    product_ref: item.ref,
    ref: item.ref,
    product_name: item.productName,
    productName: item.productName,
    product_name_2: item.productName2,
    productName2: item.productName2,
    size: item.size,
    unit_price: item.unitPrice,
    quantity: item.quantity,
    // Add required fields for CartItem type
    id: item.ref,
    product_id: item.ref,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', p: { xs: 2, md: 3 } }}>
      {/* Print Template - Hidden on screen, visible when printing */}
      <div style={{ display: 'none' }}>
        <OrderPrintTemplate
          ref={printRef}
          orderId={orderSummary.orderId}
          customerName={orderSummary.customerName}
          orderDate={new Date().toLocaleDateString('he-IL')}
          items={cartItems.map(item => ({
            ref: item.ref,
            product_name: item.product_name,
            product_name_2: item.product_name_2,
            size: item.size,
            unit_price: item.unit_price,
            quantity: item.quantity
          }))}
          subtotal={orderSummary.subtotal}
          tax={orderSummary.tax}
          total={orderSummary.total}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Success Header - Visible on screen, hidden in print */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: 4,
          p: 3,
          borderRadius: 2,
          bgcolor: 'success.50',
          border: '1px solid',
          borderColor: 'success.200'
        }}
      >
        <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'success.dark' }}>
          הזמנה הוגשה בהצלחה!
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          מספר הזמנה: {formatOrderNumber(orderSummary.orderId)}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          לקוח: {orderSummary.customerName} | תאריך: {new Date().toLocaleDateString('he-IL')}
        </Typography>
      </Box>

      {/* Two Column Layout - Same as OrderForm */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 3,
          width: '100%'
        }}
      >
        
        {/* Items Column - Same as OrderForm */}
        <Box sx={{ flex: { xs: '1', lg: '2' } }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            פריטים שהוזמנו
          </Typography>
          
          {/* Reuse CartItemsTable styling but make it read-only */}
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
              overflow: 'hidden'
            }}
          >
            {/* Table Header */}
            <Box
              sx={{
                p: 1,
                bgcolor: 'grey.50',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minHeight: 48 }}>
                <Box sx={{ minWidth: 80 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    מק&quot;ט
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    מוצר
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 60, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    מחיר יחידה
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 60, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    כמות
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 80, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    סה&quot;כ
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Items List */}
            {cartItems.map((item, index) => (
              <Box
                key={index}
                sx={{
                  p: 1,
                  borderBottom: index < cartItems.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'grey.50' }
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minHeight: 48 }}>
                  {/* Product Ref */}
                  <Box sx={{ minWidth: 80 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                      {item.ref}
                    </Typography>
                  </Box>

                  {/* Product Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#2B3445' }}>
                      {item.product_name}
                    </Typography>
                    {item.product_name_2 && (
                      <Typography variant="body2" sx={{ color: '#7D879C' }}>
                        {item.product_name_2}
                      </Typography>
                    )}
                    {item.size && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        גודל: {item.size}
                      </Typography>
                    )}
                  </Box>

                  {/* Unit Price */}
                  <Box sx={{ minWidth: 60, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatCurrency(item.unit_price)}
                    </Typography>
                  </Box>

                  {/* Quantity */}
                  <Box sx={{ minWidth: 60, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.quantity}
                    </Typography>
                  </Box>

                  {/* Total */}
                  <Box sx={{ minWidth: 80, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(item.unit_price * item.quantity)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Order Summary Column - Same as OrderForm */}
        <Box sx={{ flex: { xs: '1', lg: '1' } }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            סיכום הזמנה
          </Typography>
          
          {/* Reuse OrderSummary component styling */}
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
            {/* Order Info Section */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                פרטי הזמנה
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                מספר הזמנה: {formatOrderNumber(orderSummary.orderId)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                לקוח: {orderSummary.customerName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                תאריך: {new Date().toLocaleDateString('he-IL')}
              </Typography>
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
                    {formatCurrency(orderSummary.subtotal)}
                  </Typography>
                </Box>
                
                {/* Tax */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    מע&quot;מ
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatCurrency(orderSummary.tax)}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                {/* Total */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    סה&quot;כ
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {formatCurrency(orderSummary.total)}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={1}>
                <Button
                  onClick={onNewOrder}
                  variant="outlined"
                  fullWidth
                  sx={{ 
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
                  onClick={handlePrint}
                  startIcon={<PrintIcon />}
                  variant="contained"
                  fullWidth
                  sx={{ 
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  }}
                >
                  הדפס הזמנה
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(OrderSuccessView);