/**
 * OrderForm Component (Refactored)
 * 
 * Main order management interface - now dramatically simplified by extracting:
 * - UI components: EmptyCartView, OrderSuccessView, CartItemsTable
 * - Business logic: useOrderSubmission, usePriceLoader, useOrderCalculations
 * - Dead code removed (revive order functionality)
 * 
 * This component now focuses only on:
 * - State management and coordination
 * - Admin features (edit mode, custom items)
 * - Layout and component composition
 */

import React, { useState, useRef, useEffect } from 'react';
import { Box, Grid, Alert, Snackbar } from '@mui/material';
import { getProducts } from '../../api/products';
import { useCart } from '../../context/CartContext';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/AuthContext';

// Extracted components
import EmptyCartView from './EmptyCartView';
import OrderSuccessView from './OrderSuccessView';
import CartItemsTable from './CartItemsTable';
import OrderSummary from './OrderSummary';
import AdminAddItemDialog from './AdminAddItemDialog';

// Extracted hooks
import { useOrderSubmission } from '../../hooks/useOrderSubmission';
import { usePriceLoader } from '../../hooks/usePriceLoader';
import { useOrderCalculations } from '../../hooks/useOrderCalculations';

// Styles
import '../../styles/print.css';

const OrderForm = () => {
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

  // === CUSTOM HOOKS ===
  const { subtotal, tax, total, formatCurrency } = useOrderCalculations(cart, companySettings);
  
  const {
    isSubmitting,
    orderSummary,
    snackbar,
    submitOrder,
    resetOrderSummary,
    closeSnackbar
  } = useOrderSubmission(cart, customerName, subtotal, tax, total, companySettings, clearCart);

  // Load prices automatically (but not when in edit mode)
  usePriceLoader(cart, updateItemPrice, editMode);

  // === EFFECTS ===
  // Load products for admin features
  useEffect(() => {
    if (isAdmin && (editMode || addItemDialog)) {
      loadProducts();
    }
  }, [isAdmin, editMode, addItemDialog]);

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
    submitOrder();
    setCustomerName(''); // Clear customer name after submission
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
        <OrderSummary
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          cart={cart}
          subtotal={canViewPrices ? subtotal : 0}
          tax={canViewPrices ? tax : 0}
          total={canViewPrices ? total : 0}
          formatCurrency={formatCurrency}
          companySettings={companySettings}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitOrder}
          canViewPrices={canViewPrices}
        />
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
    </Box>
  );
};

export default OrderForm;
