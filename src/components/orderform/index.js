/**
 * OrderForm Components Barrel Export
 * 
 * Centralized exports for all orderform components.
 * Cleaned up to remove duplicates and unused components.
 */

// Main components
export { default as OrderForm } from './OrderForm';
export { default as OrderSummary } from './OrderSummary';
export { default as CartItemsTable } from './CartItemsTable';

// View components
export { default as EmptyCartView } from './EmptyCartView';
export { default as OrderSuccessView } from './OrderSuccessView';

// Admin components
export { default as AdminAddItemDialog } from './AdminAddItemDialog';
export { default as InlineAddItemRow } from './InlineAddItemRow';

// Utility components (used by OrderDetails)
export { default as OrderSummarySection } from './OrderSummarySection';
export { default as OrderDetailsHeader } from './OrderDetailsHeader';
export { default as OrderItemsTable } from './OrderItemsTable';
export { default as OrderDetails } from './OrderDetails';
