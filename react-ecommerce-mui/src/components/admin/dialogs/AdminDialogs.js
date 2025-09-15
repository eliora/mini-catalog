/**
 * AdminDialogs Component - Centralized dialog management
 * 
 * Manages all admin dashboard dialogs including product forms and order details.
 * Extracted from main Admin component for better separation of concerns.
 * 
 * Features:
 * - Product form dialog (add/edit)
 * - Order details dialog
 * - Consistent dialog styling and behavior
 * - Error handling integration
 * 
 * Props:
 * - Dialog states and handlers
 * - Data for forms and displays
 */

import React from 'react';
import { Dialog, DialogContent, Snackbar, Alert } from '@mui/material';

// Dialog components
import ProductForm from '../forms/ProductForm';
import OrderDetails from '../orders/OrderDetails';

const AdminDialogs = ({
  // Product dialog
  productDialog,
  editingProduct,
  loading,
  onCloseProductDialog,
  onSaveProduct,
  
  // Order dialog
  orderDialog,
  selectedOrder,
  onCloseOrderDialog,
  onUpdateOrder,
  onReviveOrder,
  
  // Snackbar
  snackbar,
  onCloseSnackbar
}) => {
  return (
    <>
      {/* Product Form Dialog */}
      <ProductForm
        product={editingProduct}
        open={productDialog}
        onClose={onCloseProductDialog}
        onSave={onSaveProduct}
        loading={loading}
      />

      {/* Enhanced Order Details Dialog */}
      <Dialog 
        open={orderDialog} 
        onClose={onCloseOrderDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedOrder && (
            <OrderDetails
              order={selectedOrder}
              onClose={onCloseOrderDialog}
              onUpdate={onUpdateOrder}
              isAdmin={true}
              onReviveOrder={onReviveOrder}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={onCloseSnackbar}
      >
        <Alert severity={snackbar.severity} onClose={onCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(AdminDialogs);
