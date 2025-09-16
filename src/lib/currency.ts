/**
 * Currency Utility Functions
 * 
 * Currency formatting utilities for the application
 */

export const currency = (amount: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};
