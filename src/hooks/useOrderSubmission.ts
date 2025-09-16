/**
 * useOrderSubmission Hook
 * 
 * Custom hook that handles order submission logic, validation, and state management.
 * Extracts all order submission complexity from OrderForm component.
 */

import { useState, useCallback } from 'react';
import { CartItem } from '@/types/cart';
import { CompanySettings } from '@/types/company';

interface OrderSummary {
  orderId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
}

interface OrderItem {
  ref: string;
  productName: string;
  productName2: string;
  size: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface UseOrderSubmissionResult {
  isSubmitting: boolean;
  orderSummary: OrderSummary | null;
  snackbar: SnackbarState;
  submitOrder: () => Promise<void>;
  resetOrderSummary: () => void;
  closeSnackbar: () => void;
}

// Client-side API function for creating orders
const createOrder = async (orderData: any): Promise<{ id: string }> => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create order: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to create order');
  }

  return data.data;
};

export const useOrderSubmission = (
  cart: CartItem[],
  customerName: string,
  subtotal: number,
  tax: number,
  total: number,
  companySettings?: CompanySettings,
  clearCart?: () => void
): UseOrderSubmissionResult => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

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
      const validatedItems: OrderItem[] = cart.map(item => ({
        ref: item.product_ref || item.ref || '',
        productName: item.product_name || item.productName || '',
        productName2: item.product_name_2 || item.productName2 || '',
        size: item.size || '',
        unitPrice: Number(item.unit_price) || 0,
        quantity: Number(item.quantity) || 1,
        totalPrice: Number(item.unit_price) * Number(item.quantity)
      }));

      const orderData = {
        customer_name: finalCustomerName,
        items: validatedItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total_amount: parseFloat(total.toFixed(2)), // Note: using total_amount to match schema
        tax_rate: companySettings?.tax_rate || 17,
        order_date: new Date().toISOString(),
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
        
        clearCart?.();
      } else {
        throw new Error('Failed to create order - no ID returned');
      }
    } catch (error) {
      console.error('❌ Order submission error:', error);
      
      let errorMessage = 'שגיאה בהגשת ההזמנה';
      
      if (error instanceof Error) {
        if (error.message?.includes('timeout')) {
          errorMessage = 'החיבור איטי מדי - אנא נסה שוב';
        } else if (error.message?.includes('network')) {
          errorMessage = 'בעיית רשת - בדוק את החיבור לאינטרנט';
        } else if (error.message) {
          errorMessage = `שגיאה: ${error.message}`;
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [cart, customerName, subtotal, tax, total, companySettings?.tax_rate, clearCart]);

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
