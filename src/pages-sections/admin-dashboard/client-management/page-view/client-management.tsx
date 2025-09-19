'use client';

import React from 'react';
import { Card } from '@mui/material';

// Shared admin components
import { AdminDataTable, AdminPageLayout, AdminPageHeader } from '@/components/admin/shared';

// Hooks
import { useAdminResource } from '@/hooks/useAdminResource';
import { clientsTableColumns, Client } from '@/config/admin-tables/clients-config';

// Dialogs (will be created/integrated later)
// import ClientEditDialog from '@/components/admin/dialogs/ClientEditDialog';
// import ClientBulkActionsDialog from '@/components/admin/dialogs/ClientBulkActionsDialog';

const ClientManagementView: React.FC = () => {
  // Use the universal admin resource hook
  const {
    data: clients,
    loading,
    error,
    pagination: _pagination, // eslint-disable-line @typescript-eslint/no-unused-vars
    stats: _stats, // eslint-disable-line @typescript-eslint/no-unused-vars
    fetchData: _fetchData, // eslint-disable-line @typescript-eslint/no-unused-vars
    updateItem: _updateItem, // eslint-disable-line @typescript-eslint/no-unused-vars
    deleteItem,
    refresh,
    clearError
  } = useAdminResource<Client>({
    resource: 'clients',
    endpoint: '/api/admin/client-management', // Using the existing working endpoint
    autoFetch: true
  });

  // Local state for dialogs and selections (TODO: Implement dialog functionality)
  // const [selectedClients, setSelectedClients] = useState<string[]>([]);
  // const [editDialogOpen, setEditDialogOpen] = useState(false);
  // const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);

  // Permissions (same pattern as client management)
  const canWrite = true;
  const canDelete = true;

  // Handlers for actions
  const handleAddClient = () => {
    // TODO: Implement add client dialog
    console.log('Add client clicked');
  };

  const handleEditClient = (client: Client) => {
    // TODO: Implement edit client dialog
    console.log('Edit client:', client.id);
  };

  const handleDeleteClient = async (clientId: string) => {
    await deleteItem(clientId);
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    // TODO: Implement selection handling
    console.log('Selected clients:', selectedIds);
  };

  return (
    <AdminPageLayout title="ניהול לקוחות" loading={loading} error={error} onErrorDismiss={clearError}>
      <AdminPageHeader
        title="ניהול לקוחות"
        breadcrumbs={[{ label: 'ראשי', href: '/admin' }, { label: 'לקוחות', href: '/admin/client-management' }]}
        onAdd={handleAddClient}
        onRefresh={refresh}
        refreshing={loading}
        canAdd={canWrite}
      />

      {/* Optional: Display stats grid here */}
      {/* <AdminStatsGrid stats={stats} /> */}

      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <AdminDataTable<Client>
          data={clients}
          columns={clientsTableColumns}
          loading={loading}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
          onSelectionChange={handleSelectionChange}
          permissions={{ canEdit: canWrite, canDelete: canDelete }}
        />
      </Card>

      {/* Client Edit Dialog (TODO: Implement) */}
      {/* <ClientEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        client={selectedClient}
        onSave={handleSaveClient}
      /> */}

      {/* Client Bulk Actions Dialog (TODO: Implement) */}
      {/* <ClientBulkActionsDialog
        open={bulkActionsDialogOpen}
        onClose={() => setBulkActionsDialogOpen(false)}
        selectedClients={selectedClients}
        onActionComplete={handleBulkActionComplete}
      /> */}
    </AdminPageLayout>
  );
};

export default ClientManagementView;