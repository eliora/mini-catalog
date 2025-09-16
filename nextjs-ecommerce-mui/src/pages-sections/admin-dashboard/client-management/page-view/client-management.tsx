/**
 * Client Management View Component
 * 
 * Main view component for client management with data table and CRUD operations.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import ClientDataTable from '@/components/admin/data-tables/ClientDataTable';
import ClientEditDialog from '@/components/admin/dialogs/ClientEditDialog';
import PageWrapper from '../../page-wrapper';

interface Client {
  id: string;
  email: string;
  name: string;
  business_name?: string;
  phone_number?: string;
  address?: any;
  user_roles: any[];
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

const ClientManagementView: React.FC = () => {
  // For now, allow access to all authenticated users
  // TODO: Implement proper permission system
  const hasPermission = (permission: string) => true;
  const [clients, setClients] = useState<Client[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Check permissions
  const canRead = hasPermission('admin.clients.read');
  const canWrite = hasPermission('admin.clients.write');
  const canDelete = hasPermission('admin.clients.delete');

  const fetchClients = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/client-management?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      const data = await response.json();
      setClients(data.clients);
      setPagination(data.pagination);

    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    try {
      // Mock user roles for now
      const mockRoles: UserRole[] = [
        {
          id: '1',
          name: 'customer',
          permissions: ['order.create', 'profile.edit'],
          description: 'לקוח רגיל'
        },
        {
          id: '2',
          name: 'premium_customer',
          permissions: ['order.create', 'profile.edit', 'pricing.premium'],
          description: 'לקוח פרימיום עם תמחור מיוחד'
        },
        {
          id: '3',
          name: 'admin',
          permissions: ['*'],
          description: 'מנהל מערכת עם גישה מלאה'
        }
      ];
      
      setUserRoles(mockRoles);
    } catch (err) {
      console.error('Error fetching user roles:', err);
    }
  };

  useEffect(() => {
    if (canRead) {
      fetchClients();
      fetchUserRoles();
    }
  }, [canRead]);

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditDialogOpen(true);
  };

  const handleAddClient = () => {
    setSelectedClient(undefined);
    setEditDialogOpen(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!canDelete) return;

    try {
      const response = await fetch(`/api/admin/client-management/${clientId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      // Refresh clients list
      await fetchClients(pagination.page, pagination.limit);
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Failed to delete client. Please try again.');
    }
  };

  const handleSaveClient = async (clientData: any) => {
    try {
      const url = selectedClient 
        ? `/api/admin/client-management/${selectedClient.id}`
        : '/api/admin/client-management';
      
      const method = selectedClient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${selectedClient ? 'update' : 'create'} client`);
      }

      setEditDialogOpen(false);
      setSelectedClient(undefined);
      
      // Refresh clients list
      await fetchClients(pagination.page, pagination.limit);
      
    } catch (err) {
      console.error('Error saving client:', err);
      throw err; // Re-throw to be handled by the dialog
    }
  };

  const handleBulkAction = async (action: string, clientIds: string[]) => {
    console.log('Bulk action:', action, 'for clients:', clientIds);
    // Implement bulk actions
  };

  const handleExport = () => {
    console.log('Exporting clients...');
    // Implement export functionality
  };

  if (!canRead) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            אין לך הרשאה לצפות בניהול לקוחות.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageWrapper title="ניהול לקוחות">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => console.log('Import clients')}
          >
            ייבוא
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            ייצוא
          </Button>
          
          {canWrite && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClient}
            >
              הוסף לקוח
            </Button>
          )}
        </Box>
      </Box>

      {/* Data Table */}
      <Card>
        <ClientDataTable
          clients={clients}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
          onBulkAction={handleBulkAction}
          canEdit={canWrite}
          canDelete={canDelete}
          pagination={pagination}
          onPageChange={(page) => fetchClients(page, pagination.limit)}
        />
      </Card>

      {/* Edit Dialog */}
      <ClientEditDialog
        client={selectedClient}
        userRoles={userRoles}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedClient(undefined);
        }}
        onSave={handleSaveClient}
      />
    </PageWrapper>
  );
};

export default ClientManagementView;
