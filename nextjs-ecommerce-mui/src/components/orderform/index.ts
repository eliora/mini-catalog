/**
 * OrderForm Components Barrel Export
 * 
 * Centralized exports for all orderform components.
 * TypeScript version with proper type exports.
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

// Note: These components were moved to src/components/admin/orders/
// - OrderDetails (admin order management interface)
// - OrderDetailsHeader (admin order header with edit controls)  
// - OrderItemsTable (admin order items table)
// - OrderSummarySection (admin order financial summary)