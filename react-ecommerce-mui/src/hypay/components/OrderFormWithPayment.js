/**
 * OrderFormWithPayment Component
 * 
 * Enhanced version of OrderForm that integrates Hypay payment processing.
 * Maintains the same interface as the original OrderForm while adding payment capabilities.
 * 
 * This component can be used as a drop-in replacement for the original OrderForm
 * when payment processing is required.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Box, Grid, Alert, Snackbar, Switch, FormControlLabel } from '@mui/material';
import { getProducts } from '../../api/products';
import { useCart } from '../../context/CartContext';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/AuthContext';

// Existing components
import EmptyCartView from '../../components/orderform/EmptyCartView';
import OrderSuccessView from '../../components/orderform/OrderSuccessView';
import CartItemsTable from '../../components/orderform/CartItemsTable';
import OrderSummary from '../../components/orderform/OrderSummary';
import AdminAddItemDialog from '../../components/orderform/AdminAddItemDialog';

// Payment components
import PaymentDialog from './PaymentDialog';

// Enhanced hooks
import { useOrderSubmissionWithPayment } from '../hooks/useOrderSubmissionWithPayment';
import { useOrderCalculations } from '../../hooks/useOrderCalculations';
import { usePriceLoader } from '../../hooks/usePriceLoader';

// Styles
import '../../styles/print.css';

const OrderFormWithPayment = ({ 
  requirePaymentByDefault = false,
  allowPaymentToggle = true 
}) => {
  // === CONTEXT HOOKS ===
  const { cart, removeFromCart, updateQuantity, clearCart, addToCart, updateItemPrice } = useCart();
  const { settings: companySettings } = useCompany();
  const { isAdmin, user } = useAuth();
  
  // Check if user can view prices (authenticated users)
  const canViewPrices = !!user;
  const printRef = useRef(null);

  // === LOCAL STATE ===
  const [customerName, setCustomerName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [products, setProducts] = useState([]);
  const [addItemDialog, setAddItemDialog] = useState(false);
  const [requirePayment, setRequirePayment] = useState(
    requirePaymentByDefault || companySettings?.requirePaymentOnSubmit || false
  );

  // === CUSTOM HOOKS ===
  const { subtotal, tax, total, formatCurrency } = useOrderCalculations(cart, companySettings);
  
  // Enhanced order submission with payment
  const {
    isSubmitting,
    isProcessingPayment,
    orderSummary,
    snackbar,
    currentOrder,
    paymentRequired,
    paymentDialog,
    paymentSession,
    paymentStatus,
    paymentError,
    submitOrder,
    handlePaymentSuccess,
    handlePaymentError,
    cancelPayment,
    resetOrderSummary,
    closeSnackbar,
    setPaymentDialog
  } = useOrderSubmissionWithPayment(
    cart, 
    customerName, 
    subtotal, 
    tax, 
    total, 
    companySettings, 
    clearCart,
    { requirePayment }
  );

  // Load prices automatically (but not when in edit mode)
  usePriceLoader(cart, updateItemPrice, editMode);

  // === EFFECTS ===
  // Load products for admin features
  useEffect(() => {
    if (isAdmin && (editMode || addItemDialog)) {
      loadProducts();
    }
  }, [isAdmin, editMode, addItemDialog]);

  // Update requirePayment when company settings change
  useEffect(() => {
    if (!allowPaymentToggle && companySettings?.requirePaymentOnSubmit !== undefined) {
      setRequirePayment(companySettings.requirePaymentOnSubmit);
    }
  }, [companySettings?.requirePaymentOnSubmit, allowPaymentToggle]);

  // === HANDLERS ===
  const loadProducts = async () => {
    try {
      const productsData = await getProducts();
      setProducts(productsData);
      console.log('📦 Products loaded for admin:', productsData?.length || 0);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handlePriceChange = (itemRef, newPrice) => {
    updateItemPrice(itemRef, Number(newPrice) || 0);
  };

  const handleAddCustomItem = (customItem) => {
    addToCart(customItem, customItem.quantity);
  };

  const handleSubmitOrder = () => {
    submitOrder({
      requirePayment,
      paymentMethod: 'credit_card' // Default, can be made configurable
    });
    setCustomerName(''); // Clear customer name after submission
  };

  const handlePaymentDialogClose = () => {
    setPaymentDialog(false);
  };

  // === RENDER CONDITIONS ===
  
  // Empty cart
  if (cart.length === 0 && !orderSummary) {
    return <EmptyCartView />;
  }

  // Order success
  if (orderSummary) {
    return (
      <OrderSuccessView
        ref={printRef}
        orderSummary={orderSummary}
        formatCurrency={formatCurrency}
        onNewOrder={resetOrderSummary}
      />
    );
  }

  // === MAIN FORM ===
  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Grid container spacing={3} sx={{ mx: 0, width: '100%' }}>
        
        {/* Items Column */}
        <Grid item xs={12} lg={8}>
          <CartItemsTable
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            onPriceChange={handlePriceChange}
            isAdmin={isAdmin}
            editMode={editMode}
            onToggleEditMode={() => setEditMode(!editMode)}
            onAddCustomItem={handleAddCustomItem}
          />
        </Grid>

        {/* Order Summary Column */}
        <Grid item xs={12} lg={4}>
          <OrderSummary
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            cart={cart}
            subtotal={canViewPrices ? subtotal : 0}
            tax={canViewPrices ? tax : 0}
            total={canViewPrices ? total : 0}
            formatCurrency={formatCurrency}
            companySettings={companySettings}
            isSubmitting={isSubmitting || isProcessingPayment}
            onSubmit={handleSubmitOrder}
            canViewPrices={canViewPrices}
            // Enhanced props for payment
            requirePayment={requirePayment}
            paymentStatus={paymentStatus}
          >
            {/* Payment Toggle Control */}
            {allowPaymentToggle && canViewPrices && (
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={requirePayment}
                      onChange={(e) => setRequirePayment(e.target.checked)}
                      disabled={isSubmitting || isProcessingPayment}
                    />
                  }
                  label="דרוש תשלום מיידי"
                />
              </Box>
            )}
          </OrderSummary>
        </Grid>
      </Grid>

      {/* Admin Dialog */}
      {isAdmin && (
        <AdminAddItemDialog
          open={addItemDialog}
          onClose={() => setAddItemDialog(false)}
          products={products}
          onAddItem={handleAddCustomItem}
        />
      )}

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialog}
        onClose={handlePaymentDialogClose}
        orderData={currentOrder}
        companySettings={companySettings}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        onCancel={cancelPayment}
      />

      {/* Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
      >
        <Alert 
          onClose={closeSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Payment Processing Overlay */}
      {isProcessingPayment && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Alert severity="info" sx={{ minWidth: 300 }}>
            מעבד תשלום... אנא אל תסגור את החלון
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default OrderFormWithPayment;
