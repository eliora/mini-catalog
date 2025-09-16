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
import { USERS_TABLE, USERS_HELPERS } from '@/constants/users-schema.js';

// Interface matching the actual database schema
interface Client {
  id: string;
  email: string;
  role: 'user' | 'admin';
  full_name: string;        // Changed from 'name' to 'full_name'
  user_role: 'standard' | 'verified_members' | 'customer' | 'admin';  // Single enum, not array
  business_name?: string;
  phone_number?: string;
  address?: any;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login?: string;
  // Helper fields added by API
  display_name?: string;
  formatted_address?: string;
  is_admin?: boolean;
  is_verified?: boolean;
  is_active?: boolean;
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
      // Convert constants to UserRole format for compatibility
      const constantRoles: UserRole[] = [
        {
          id: '1',
          name: USERS_TABLE.enums.USER_ROLES.STANDARD,
          permissions: ['order.create', 'profile.edit'],
          description: 'לקוח רגיל'
        },
        {
          id: '2',
          name: USERS_TABLE.enums.USER_ROLES.VERIFIED_MEMBERS,
          permissions: ['order.create', 'profile.edit', 'pricing.premium'],
          description: 'חבר מאומת עם תמחור מיוחד'
        },
        {
          id: '3',
          name: USERS_TABLE.enums.USER_ROLES.CUSTOMER,
          permissions: ['order.create', 'profile.edit', 'customer.features'],
          description: 'לקוח עם תכונות מורחבות'
        },
        {
          id: '4',
          name: USERS_TABLE.enums.USER_ROLES.ADMIN,
          permissions: ['*'],
          description: 'מנהל מערכת עם גישה מלאה'
        }
      ];
      
      setUserRoles(constantRoles);
    } catch (err) {
      console.error('Error setting up user roles:', err);
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
      const response = await fetch(`/api/admin/client-management?id=${clientId}`, {
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
      const url = '/api/admin/client-management';
      const method = selectedClient ? 'PUT' : 'POST';

      // Prepare data with correct field names
      const requestData = {
        ...(selectedClient && { id: selectedClient.id }),
        email: clientData.email,
        full_name: clientData.full_name || clientData.name,  // Handle both field names
        role: clientData.role || 'user',
        user_role: clientData.user_role || 'standard',
        business_name: clientData.business_name,
        phone_number: clientData.phone_number,
        address: clientData.address,
        status: clientData.status || 'active'
      };

      console.log('Request data:', requestData);
      console.log('Phone number in request:', requestData.phone_number);
      console.log('Request method:', method);
      console.log('Request URL:', url);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        let errorData;
        let responseText;
        try {
          responseText = await response.text();
          console.log('Raw response text:', responseText);
          
          if (responseText) {
            errorData = JSON.parse(responseText);
          } else {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
          console.error('Response text was:', responseText);
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${responseText || 'No response body'}`);
        }
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `Failed to ${selectedClient ? 'update' : 'create'} client`);
      }

      // Parse successful response
      const result = await response.json();
      console.log('Success response:', result);
      console.log('Phone number in response:', result.client?.phone_number);

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
