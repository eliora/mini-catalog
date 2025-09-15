/**
 * OrderDetails Component - Main Order Management Interface
 * 
 * Comprehensive order details view with editing capabilities for admin users.
 * Displays order information, customer details, item list, and financial summary.
 * 
 * Features:
 * - Order header with customer and order information
 * - Editable items table with quantity and price controls
 * - Financial summary with tax calculations
 * - Add item functionality for admin users
 * - Print and export capabilities
 * - Order revival functionality
 * 
 * Architecture:
 * - Uses extracted components for better maintainability
 * - Centralized state management for edit operations
 * - Error handling with user feedback
 * - Responsive design for mobile and desktop
 * 
 * @param {Object} order - Order data object
 * @param {Function} onClose - Close dialog callback
 * @param {Function} onUpdate - Order update callback
 * @param {boolean} isAdmin - Whether current user is admin
 * @param {Function} onReviveOrder - Order revival callback
 */

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { updateOrder } from '../../../api/orders';
import { getProducts } from '../../../api/products';
import { useCompany } from '../../../context/CompanyContext';

// Extracted components
import OrderDetailsHeader from './OrderDetailsHeader';
import OrderItemsTable from './OrderItemsTable';
import OrderSummarySection from './OrderSummarySection';
import AdminAddItemDialog from '../../orderform/AdminAddItemDialog';

const OrderDetails = ({ 
  order, 
  onClose, 
  onUpdate, 
  isAdmin = false,
  onReviveOrder
}) => {
  const { settings: companySettings } = useCompany();
  
  // ===== EDIT STATE =====
  const [editMode, setEditMode] = useState(false);
  const [editableOrder, setEditableOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // ===== PRODUCTS STATE =====
  const [products, setProducts] = useState([]);
  
  // ===== ADD ITEM DIALOG STATE =====
  const [addItemDialog, setAddItemDialog] = useState(false);

  // ===== INITIALIZATION EFFECTS =====
  useEffect(() => {
    if (order) {
      const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
      setEditableOrder({
        ...order,
        customerName: order.customerName || order.customer_name || '',
        items: items
      });
    }
  }, [order]);

  useEffect(() => {
    if (isAdmin && editMode) {
      loadProducts();
    }
  }, [isAdmin, editMode]);

  // ===== UTILITY FUNCTIONS =====
  const loadProducts = async () => {
    try {
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const calculateTotal = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.unitPrice || 0) * Number(item.quantity || 0)), 0);
    const taxRate = (companySettings?.taxRate || 17) / 100;
    const tax = subtotal * taxRate;
    return { subtotal, tax, total: subtotal + tax };
  };

  // ===== EDIT HANDLERS =====
  const handleEdit = () => {
    console.log('Edit button clicked, setting edit mode to true');
    setEditMode(true);
  };

  const handleSave = async () => {
    if (!editableOrder) return;

    try {
      setSaving(true);
      const { total } = calculateTotal(editableOrder.items);
      
      const updatedOrder = await updateOrder(editableOrder.id, {
        customerName: editableOrder.customerName,
        items: editableOrder.items,
        total: total
      });

      setEditMode(false);
      onUpdate(updatedOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('שגיאה בשמירת ההזמנה');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
    setEditableOrder({
      ...order,
      customerName: order.customerName || order.customer_name || '',
      items: items
    });
    setEditMode(false);
  };

  const handleRevive = () => {
    if (onReviveOrder) {
      onReviveOrder(editableOrder);
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCustomerNameChange = (newName) => {
    setEditableOrder(prev => ({ ...prev, customerName: newName }));
  };

  // ===== ITEM MANAGEMENT HANDLERS =====
  const handleQuantityChange = (index, delta) => {
    setEditableOrder(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        quantity: Math.max(1, Number(newItems[index].quantity || 0) + delta)
      };
      return { ...prev, items: newItems };
    });
  };

  const handlePriceChange = (index, newPrice) => {
    setEditableOrder(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        unitPrice: Number(newPrice) || 0
      };
      return { ...prev, items: newItems };
    });
  };

  const handleRemoveItem = (index) => {
    setEditableOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // ===== ADD ITEM HANDLERS =====
  const handleShowAddDialog = () => {
    setAddItemDialog(true);
  };

  const handleAddItem = (customItem) => {
    const newItem = {
      ref: customItem.ref,
      productName: customItem.productName,
      productName2: customItem.productName2,
      size: customItem.size,
      unitPrice: Number(customItem.unitPrice) || 0,
      quantity: Number(customItem.quantity) || 1
    };

    setEditableOrder(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setAddItemDialog(false);
  };

  // ===== EARLY RETURN =====
  if (!editableOrder) return null;

  // ===== COMPUTED VALUES =====
  const { subtotal, tax, total } = calculateTotal(editableOrder.items);
  const taxRate = companySettings?.taxRate || 17;

  // ===== RENDER =====
  return (
    <Box>
      {/* Order Header with Actions and Info */}
      <OrderDetailsHeader
        order={editableOrder}
        editMode={editMode}
        isAdmin={isAdmin}
        saving={saving}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onRevive={handleRevive}
        onPrint={handlePrint}
        onCustomerNameChange={handleCustomerNameChange}
      />

      {/* Items Table */}
      <OrderItemsTable
        items={editableOrder.items}
        editMode={editMode}
        isAdmin={isAdmin}
        formatCurrency={formatCurrency}
        onQuantityChange={handleQuantityChange}
        onPriceChange={handlePriceChange}
        onRemoveItem={handleRemoveItem}
        onAddItem={handleShowAddDialog}
      />

      {/* Order Summary */}
      <OrderSummarySection
        subtotal={subtotal}
        tax={tax}
        total={total}
        taxRate={taxRate}
        formatCurrency={formatCurrency}
      />

      {/* Add Item Dialog */}
      <AdminAddItemDialog
        open={addItemDialog}
        onClose={() => setAddItemDialog(false)}
        products={products}
        onAddItem={handleAddItem}
      />
    </Box>
  );
};

export default OrderDetails;
