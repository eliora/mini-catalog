/**
 * useOrderCalculations Hook
 * 
 * Custom hook that handles order total calculations (subtotal, tax, total).
 * Memoizes calculations for performance.
 */

import { useMemo, useCallback } from 'react';
import { CartItem } from '@/types/cart';
import { CompanySettings } from '@/types/company';

interface UseOrderCalculationsResult {
  subtotal: number;
  tax: number;
  total: number;
  formatCurrency: (amount: number) => string;
}

export const useOrderCalculations = (
  cart: CartItem[], 
  companySettings?: CompanySettings
): UseOrderCalculationsResult => {
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  }, [cart]);

  const tax = useMemo(() => {
    const taxRate = (companySettings?.tax_rate || 17) / 100;
    return subtotal * taxRate;
  }, [subtotal, companySettings?.tax_rate]);

  const total = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  const formatCurrency = useCallback((amount: number) => {
    return `₪${Number(amount || 0).toFixed(2)}`;
  }, []);

  return {
    subtotal,
    tax,
    total,
    formatCurrency
  };
};
