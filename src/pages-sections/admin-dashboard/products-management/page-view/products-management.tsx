'use client';

import React from 'react';
import { Card } from '@mui/material';

// Shared admin components
import { AdminDataTable, AdminPageLayout, AdminPageHeader } from '@/components/admin/shared';

// Hooks
import { useAdminResource } from '@/hooks/useAdminResource';
import { productsTableColumns, Product } from '@/config/admin-tables/products-config';

// Dialogs (will be created/integrated later)
// import ProductEditDialog from '@/components/admin/dialogs/ProductEditDialog';
// import ProductBulkActionsDialog from '@/components/admin/dialogs/ProductBulkActionsDialog';

const ProductsManagementView: React.FC = () => {
  // Use the universal admin resource hook
  const {
    data: products,
    loading,
    error,
    pagination: _pagination, // eslint-disable-line @typescript-eslint/no-unused-vars
    stats: _stats, // eslint-disable-line @typescript-eslint/no-unused-vars
    fetchData: _fetchData, // eslint-disable-line @typescript-eslint/no-unused-vars
    updateItem: _updateItem, // eslint-disable-line @typescript-eslint/no-unused-vars
    deleteItem,
    refresh,
    clearError
  } = useAdminResource<Product>({
    resource: 'products',
    endpoint: '/api/admin/products', // This endpoint needs to be created
    autoFetch: true
  });

  // Local state for dialogs and selections (TODO: Implement dialog functionality)
  // const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  // const [editDialogOpen, setEditDialogOpen] = useState(false);
  // const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  // Permissions (same pattern as client management)
  const canWrite = true;
  const canDelete = true;

  // Handlers for actions
  const handleAddProduct = () => {
    // TODO: Implement add product dialog
    console.log('Add product clicked');
  };

  const handleEditProduct = (product: Product) => {
    // TODO: Implement edit product dialog
    console.log('Edit product:', product.id);
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteItem(productId);
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    // TODO: Implement selection handling
    console.log('Selected products:', selectedIds);
  };

  return (
    <AdminPageLayout title="ניהול מוצרים" loading={loading} error={error} onErrorDismiss={clearError}>
      <AdminPageHeader
        title="ניהול מוצרים"
        breadcrumbs={[{ label: 'ראשי', href: '/admin' }, { label: 'מוצרים', href: '/admin/products-management' }]}
        onAdd={handleAddProduct}
        onRefresh={refresh}
        refreshing={loading}
        canAdd={canWrite}
      />

      {/* Optional: Display stats grid here */}
      {/* <AdminStatsGrid stats={stats} /> */}

      <Card sx={{ borderRadius: 1, boxShadow: 1 }}>
        <AdminDataTable<Product>
          data={products}
          columns={productsTableColumns}
          loading={loading}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onSelectionChange={handleSelectionChange}
          permissions={{ canEdit: canWrite, canDelete: canDelete }}
          pageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </Card>

      {/* Product Edit Dialog (TODO: Implement) */}
      {/* <ProductEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        product={selectedProduct}
        onSave={handleSaveProduct}
      /> */}

      {/* Product Bulk Actions Dialog (TODO: Implement) */}
      {/* <ProductBulkActionsDialog
        open={bulkActionsDialogOpen}
        onClose={() => setBulkActionsDialogOpen(false)}
        selectedProducts={selectedProducts}
        onActionComplete={handleBulkActionComplete}
      /> */}
    </AdminPageLayout>
  );
};

export default ProductsManagementView;