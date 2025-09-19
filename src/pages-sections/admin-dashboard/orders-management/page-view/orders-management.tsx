'use client';

import React from 'react';
import { Card } from '@mui/material';

// Shared admin components
import { AdminDataTable, AdminPageLayout, AdminPageHeader } from '@/components/admin/shared';

// Hooks
import { useAdminResource } from '@/hooks/useAdminResource';
import { ordersTableColumns, Order } from '@/config/admin-tables/orders-config';

// Dialogs (will be created/integrated later)
// import OrderEditDialog from '@/components/admin/dialogs/OrderEditDialog';
// import OrderPrintDialog from '@/components/admin/dialogs/OrderPrintDialog';

const OrdersManagementView: React.FC = () => {
  // Use the universal admin resource hook
  const {
    data: orders,
    loading,
    error,
    pagination: _pagination, // eslint-disable-line @typescript-eslint/no-unused-vars
    stats: _stats, // eslint-disable-line @typescript-eslint/no-unused-vars
    fetchData: _fetchData, // eslint-disable-line @typescript-eslint/no-unused-vars
    deleteItem,
    refresh,
    clearError
  } = useAdminResource<Order>({
    resource: 'orders',
    endpoint: '/api/admin/orders',
    autoFetch: true
  });

  // Local state for dialogs and selections (TODO: Implement dialog functionality)
  // const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  // const [editDialogOpen, setEditDialogOpen] = useState(false);
  // const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(undefined);

  // Permissions (same pattern as client management)
  const canWrite = true;
  const canDelete = true;

  // Handlers for actions
  const handleAddOrder = () => {
    // TODO: Implement add order dialog
    console.log('Add order clicked');
  };

  const handleEditOrder = (order: Order) => {
    // TODO: Implement edit order dialog
    console.log('Edit order:', order.id);
  };

  const handleDeleteOrder = async (orderId: string) => {
    await deleteItem(orderId);
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    // TODO: Implement selection handling
    console.log('Selected orders:', selectedIds);
  };

  // Custom actions are handled via the AdminDataTable actions prop

  return (
    <AdminPageLayout title="ניהול הזמנות" loading={loading} error={error} onErrorDismiss={clearError}>
      <AdminPageHeader
        title="ניהול הזמנות"
        breadcrumbs={[{ label: 'ראשי', href: '/admin' }, { label: 'הזמנות', href: '/admin/orders-management' }]}
        onAdd={handleAddOrder}
        onRefresh={refresh}
        refreshing={loading}
        canAdd={canWrite}
      />

      {/* Optional: Display stats grid here */}
      {/* <AdminStatsGrid stats={stats} /> */}

      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <AdminDataTable<Order>
          data={orders}
          columns={ordersTableColumns}
          loading={loading}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
          onSelectionChange={handleSelectionChange}
          permissions={{ canEdit: canWrite, canDelete: canDelete }}
        />
      </Card>

      {/* Order Edit Dialog (TODO: Implement) */}
      {/* <OrderEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        order={selectedOrder}
        onSave={handleSaveOrder}
      /> */}

      {/* Order Print Dialog (TODO: Integrate existing print dialog) */}
      {/* <OrderPrintDialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        order={orderToPrint}
      /> */}
    </AdminPageLayout>
  );
};

export default OrdersManagementView;