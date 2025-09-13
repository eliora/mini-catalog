/**
 * useOrderCalculations Hook
 * 
 * Custom hook that handles order total calculations (subtotal, tax, total).
 * Memoizes calculations for performance.
 * 
 * @param {Array} cart - Cart items
 * @param {Object} companySettings - Company settings containing tax rate
 */

import { useMemo, useCallback } from 'react';

export const useOrderCalculations = (cart, companySettings) => {
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }, [cart]);

  const tax = useMemo(() => {
    const taxRate = (companySettings?.taxRate || 17) / 100;
    return subtotal * taxRate;
  }, [subtotal, companySettings?.taxRate]);

  const total = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  const formatCurrency = useCallback((amount) => {
    return `₪${Number(amount || 0).toFixed(2)}`;
  }, []);

  return {
    subtotal,
    tax,
    total,
    formatCurrency
  };
};
