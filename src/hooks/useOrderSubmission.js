/**
 * useOrderSubmission Hook
 * 
 * Custom hook that handles order submission logic, validation, and state management.
 * Extracts all order submission complexity from OrderForm component.
 * 
 * @param {Array} cart - Cart items
 * @param {string} customerName - Customer name
 * @param {number} subtotal - Order subtotal
 * @param {number} tax - Tax amount
 * @param {number} total - Total amount
 * @param {Object} companySettings - Company settings (tax rate, etc.)
 * @param {Function} clearCart - Function to clear the cart
 */

import { useState, useCallback } from 'react';
import { createOrder } from '../api/orders';

export const useOrderSubmission = (
  cart,
  customerName,
  subtotal,
  tax,
  total,
  companySettings,
  clearCart
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const submitOrder = useCallback(async () => {
    if (cart.length === 0) {
      setSnackbar({
        open: true,
        message: 'לא ניתן להגיש הזמנה ריקה',
        severity: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const finalCustomerName = customerName.trim() || 'לקוח אנונימי';
      
      // Prepare order items with validation
      const validatedItems = cart.map(item => ({
        ref: item.ref || '',
        productName: item.productName || '',
        productName2: item.productName2 || '',
        size: item.size || '',
        unitPrice: Number(item.unitPrice) || 0,
        quantity: Number(item.quantity) || 1,
        totalPrice: Number(item.unitPrice) * Number(item.quantity)
      }));

      const orderData = {
        customerName: finalCustomerName,
        items: validatedItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        taxRate: companySettings?.taxRate || 17,
        orderDate: new Date().toISOString(),
        status: 'pending'
      };

      console.log('🚀 Submitting order:', orderData);
      
      const result = await createOrder(orderData);
      
      if (result && result.id) {
        console.log('✅ Order created successfully:', result);
        
        setSnackbar({
          open: true,
          message: `ההזמנה מספר #${result.id} הוגשה בהצלחה!`,
          severity: 'success'
        });
        
        // Capture a snapshot for the summary page
        setOrderSummary({ 
          orderId: result.id,
          customerName: finalCustomerName,
          items: validatedItems,
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          total: parseFloat(total.toFixed(2))
        });
        
        clearCart();
      } else {
        throw new Error('Failed to create order - no ID returned');
      }
    } catch (error) {
      console.error('❌ Order submission error:', error);
      
      let errorMessage = 'שגיאה בהגשת ההזמנה';
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'החיבור איטי מדי - אנא נסה שוב';
      } else if (error.message?.includes('network')) {
        errorMessage = 'בעיית רשת - בדוק את החיבור לאינטרנט';
      } else if (error.message) {
        errorMessage = `שגיאה: ${error.message}`;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [cart, customerName, subtotal, tax, total, companySettings?.taxRate, clearCart]);

  const resetOrderSummary = useCallback(() => {
    setOrderSummary(null);
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return {
    isSubmitting,
    orderSummary,
    snackbar,
    submitOrder,
    resetOrderSummary,
    closeSnackbar
  };
};
