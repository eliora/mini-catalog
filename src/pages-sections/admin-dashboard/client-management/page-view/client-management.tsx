/**
 * @file Client Management View
 * @description The primary UI component for the client management page.
 * It composes the header, stats, and data table components, and orchestrates
 * the user interactions by leveraging the `useClientManagement` hook.
 */
'use client';
import React, { useState, useMemo } from 'react';
import { Box, Card, Alert, CircularProgress } from '@mui/material';

import { useClientManagement } from '@/hooks/useClientManagement';
import ClientDataTable from '@/components/admin/data-tables/ClientDataTable';
import ClientEditDialog from '@/components/admin/dialogs/ClientEditDialog';

// Define proper interfaces
interface Client {
  id: string;
  email: string;
  full_name: string;
  user_role: 'standard' | 'verified_members' | 'customer' | 'admin';
  business_name?: string;
  phone_number?: string;
  address?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

interface ClientData {
  email: string;
  full_name: string;
  user_role: 'standard' | 'verified_members' | 'customer' | 'admin';
  business_name?: string;
  phone_number?: string;
  address?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  password?: string;
}
import PageWrapper from '../../page-wrapper';
import ClientManagementHeader from '@/components/admin/client-management/ClientManagementHeader';
import ClientStatsGrid from '@/components/admin/client-management/ClientStatsGrid';

const ClientManagementView: React.FC = () => {
  // --- Hooks ---
  const {
    clients,
    userRoles,
    availableFilters,
    loading,
    error,
    pagination,
    fetchClients,
    handleSaveClient,
    handleDeleteClient,
  } = useClientManagement();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);

  // --- Memos for Performance ---
  const stats = useMemo(() => ({
    totalClients: pagination.total,
    activeClients: clients.filter(c => c.status === 'active').length,
    verifiedMembers: clients.filter(c => c.user_role === 'verified_members').length,
    adminUsers: clients.filter(c => c.user_role === 'admin').length,
  }), [clients, pagination.total]);

  // --- Permissions (Placeholder) ---
  const canRead = true;
  const canWrite = true;
  const canDelete = true;

  // --- Handlers ---
  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditDialogOpen(true);
  };

  const handleAddClient = () => {
    setSelectedClient(undefined);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedClient(undefined);
  };
  
  const handleDialogSave = async (clientData: ClientData) => {
    try {
      await handleSaveClient(clientData as unknown as Record<string, unknown>, selectedClient);
      handleDialogClose();
    } catch (err) {
      console.error('Error saving client:', err);
      // Re-throw to be handled by the dialog's internal error state
      throw err;
    }
  };
  
  // --- Render Logic ---
  if (!canRead) {
    return (
      <Card><Alert severity="error">אין לך הרשאה לצפות בניהול לקוחות.</Alert></Card>
    );
  }

  if (loading && clients.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageWrapper title="ניהול לקוחות">
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <ClientManagementHeader
        canWrite={canWrite}
        onAddClient={handleAddClient}
        onExport={() => console.log('Exporting...')}
        onImport={() => console.log('Importing...')}
      />

      <ClientStatsGrid {...stats} />

      <Card>
        <ClientDataTable
          clients={clients}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
          // getStatusChip and getRoleChip can be moved inside ClientDataTable or passed as props
        />
      </Card>

      <ClientEditDialog
        client={selectedClient}
        userRoles={userRoles}
        open={editDialogOpen}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
      />
    </PageWrapper>
  );
};

export default ClientManagementView;
