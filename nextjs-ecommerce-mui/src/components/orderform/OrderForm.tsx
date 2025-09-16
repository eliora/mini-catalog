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

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Alert, Snackbar } from '@mui/material';
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

// API functions
import { getProducts } from '../../api/products';

// Types
import { Product } from '../../types/product';
import { CartItem } from '../../types/cart';

// Legacy cart item interface for backward compatibility
interface LegacyCartItem {
  ref: string;
  productName: string;
  productName2?: string;
  size?: string;
  unitPrice: number;
  quantity: number;
}

const OrderForm: React.FC = () => {
  // === HYDRATION STATE ===
  const [hasMounted, setHasMounted] = useState(false);

  // === CONTEXT HOOKS ===
  const { cart, removeFromCart, updateQuantity, clearCart, addToCart, updateItemPrice } = useCart();
  const { settings: companySettings } = useCompany();
  const { isAdmin, user } = useAuth();
  
  // Check if user can view prices (authenticated users)
  const canViewPrices = !!user;
  const printRef = useRef<HTMLDivElement>(null);

  // === LOCAL STATE ===
  const [customerName, setCustomerName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [addItemDialog, setAddItemDialog] = useState(false);

  // === HYDRATION EFFECT ===
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // === CUSTOM HOOKS ===
  const { subtotal, tax, total, formatCurrency } = useOrderCalculations(cart.items, companySettings || undefined);
  
  const {
    isSubmitting,
    orderSummary,
    snackbar,
    submitOrder,
    resetOrderSummary,
    closeSnackbar
  } = useOrderSubmission(cart.items, customerName, subtotal, tax, total, companySettings || undefined, clearCart);

  // === HANDLERS ===
  // Load prices automatically (but not when in edit mode)
  usePriceLoader(cart.items, updateItemPrice, editMode);

  // === EFFECTS ===
  // Load products for admin features
  useEffect(() => {
    if (isAdmin() && (editMode || addItemDialog)) {
      loadProducts();
    }
  }, [editMode, addItemDialog]);

  const loadProducts = async () => {
    try {
      const productsResponse = await getProducts();
      setProducts(productsResponse.products || []);
      console.log('📦 Products loaded for admin:', productsResponse.products?.length || 0);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handlePriceChange = (itemRef: string, newPrice: number) => {
    updateItemPrice(itemRef, newPrice);
  };

  const handleAddCustomItem = (customItem: LegacyCartItem) => {
    // Convert LegacyCartItem to minimal Product format for addToCart
    const productForCart: Product = {
      id: customItem.ref || '',
      ref: customItem.ref || '',
      product_name: customItem.productName,
      product_name_2: customItem.productName2,
      size: customItem.size,
      // Required Product fields with minimal values
      active_ingredients: null,
      created_at: new Date().toISOString(),
      description: null,
      main_pic: null,
      pics: null,
      product_type: null,
      qty: null,
      updated_at: new Date().toISOString(),
      usage_instructions: null
    };
    
    addToCart(productForCart, customItem.quantity);
  };

  const handleSubmitOrder = () => {
    submitOrder();
    setCustomerName(''); // Clear customer name after submission
  };

  // === RENDER CONDITIONS ===
  
  // Prevent hydration mismatch by waiting for client mount
  if (!hasMounted) {
    return (
      <Box sx={{ maxWidth: '1400px', mx: 'auto', p: { xs: 2, md: 3 } }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          טוען...
        </Box>
      </Box>
    );
  }
  
  // Empty cart
  if (cart.items.length === 0 && !orderSummary) {
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
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 3,
          width: '100%'
        }}
      >
        
        {/* Items Column */}
        <Box sx={{ flex: { xs: '1', lg: '2' } }}>
          <CartItemsTable
            cart={cart.items}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            onPriceChange={handlePriceChange}
            isAdmin={isAdmin()}
            editMode={editMode}
            onToggleEditMode={() => setEditMode(!editMode)}
            onAddCustomItem={handleAddCustomItem}
          />
        </Box>

        {/* Order Summary Column */}
        <Box sx={{ flex: { xs: '1', lg: '1' } }}>
          <OrderSummary
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          cart={cart.items}
          subtotal={canViewPrices ? subtotal : 0}
          tax={canViewPrices ? tax : 0}
          total={canViewPrices ? total : 0}
          formatCurrency={formatCurrency}
          companySettings={companySettings}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitOrder}
          canViewPrices={canViewPrices}
          />
        </Box>
      </Box>

      {/* Admin Dialog */}
      {isAdmin() && (
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
