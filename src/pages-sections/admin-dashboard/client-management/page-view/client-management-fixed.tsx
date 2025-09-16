/**
 * Client Management View Component - FIXED VERSION
 * 
 * Main view component for client management with data table and CRUD operations.
 * Uses correct database schema and integrates with constants.
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
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import ClientDataTable from '@/components/admin/data-tables/ClientDataTable';
import ClientEditDialog from '@/components/admin/dialogs/ClientEditDialog';
import PageWrapper from '../../page-wrapper';
import { USERS_TABLE, USERS_HELPERS } from '@/constants/users-schema';

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

interface ApiResponse {
  clients: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: {
    available_roles: string[];
    available_user_roles: string[];
    available_statuses: string[];
  };
}

const ClientManagementView: React.FC = () => {
  // For now, allow access to all authenticated users
  // TODO: Implement proper permission system
  const hasPermission = (permission: string) => true;
  
  const [clients, setClients] = useState<Client[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [availableFilters, setAvailableFilters] = useState<any>({});
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

  const fetchClients = async (page = 1, limit = 10, filters: any = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role }),
        ...(filters.user_role && { user_role: filters.user_role }),
        ...(filters.status && { status: filters.status })
      });

      const response = await fetch(`/api/admin/client-management?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch clients');
      }

      const data: ApiResponse = await response.json();
      
      setClients(data.clients);
      setPagination(data.pagination);
      
      if (data.filters) {
        setAvailableFilters(data.filters);
      }

    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load clients. Please try again.');
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

    if (!confirm('האם אתה בטוח שברצונך למחוק את הלקוח? הפעולה תהפוך את הלקוח ללא פעיל.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/client-management?id=${clientId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete client');
      }

      // Refresh clients list
      await fetchClients(pagination.page, pagination.limit);
    } catch (err) {
      console.error('Error deleting client:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete client. Please try again.');
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

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${selectedClient ? 'update' : 'create'} client`);
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
    
    if (action === 'activate' || action === 'deactivate') {
      const newStatus = action === 'activate' ? 'active' : 'inactive';
      
      for (const clientId of clientIds) {
        try {
          await fetch('/api/admin/client-management', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: clientId, status: newStatus })
          });
        } catch (err) {
          console.error(`Failed to ${action} client ${clientId}:`, err);
        }
      }
      
      // Refresh list
      await fetchClients(pagination.page, pagination.limit);
    }
  };

  const handleExport = () => {
    console.log('Exporting clients...');
    // TODO: Implement export functionality using client data
    const csvContent = [
      // CSV header using correct field names
      ['ID', 'Email', 'Full Name', 'Role', 'User Role', 'Business Name', 'Phone', 'Status', 'Created At'].join(','),
      // CSV data
      ...clients.map(client => [
        client.id,
        client.email,
        client.full_name,
        client.role,
        client.user_role,
        client.business_name || '',
        client.phone_number || '',
        client.status,
        client.created_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clients.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusChip = (status: string) => {
    const colors = {
      active: 'success',
      inactive: 'default',
      suspended: 'error'
    } as const;

    const labels = {
      active: 'פעיל',
      inactive: 'לא פעיל',
      suspended: 'מושעה'
    };

    return (
      <Chip 
        label={labels[status as keyof typeof labels] || status}
        color={colors[status as keyof typeof colors] || 'default'}
        size="small"
      />
    );
  };

  const getRoleChip = (role: string, user_role: string) => {
    if (role === 'admin') {
      return <Chip label="מנהל" color="error" size="small" />;
    }
    
    const roleLabels = {
      standard: 'רגיל',
      verified_members: 'חבר מאומת',
      customer: 'לקוח',
      admin: 'מנהל'
    };

    return (
      <Chip 
        label={roleLabels[user_role as keyof typeof roleLabels] || user_role}
        color="primary" 
        variant="outlined"
        size="small"
      />
    );
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

      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6">{pagination.total}</Typography>
            <Typography variant="body2" color="text.secondary">סך הכל לקוחות</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6">
              {clients.filter(c => c.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">לקוחות פעילים</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6">
              {clients.filter(c => c.user_role === 'verified_members').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">חברים מאומתים</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6">
              {clients.filter(c => c.role === 'admin').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">מנהלים</Typography>
          </CardContent>
        </Card>
      </Box>

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
          availableFilters={availableFilters}
          onFilter={(filters) => fetchClients(1, pagination.limit, filters)}
          getStatusChip={getStatusChip}
          getRoleChip={getRoleChip}
        />
      </Card>

      {/* Edit Dialog */}
      <ClientEditDialog
        client={selectedClient}
        userRoles={userRoles}
        availableFilters={availableFilters}
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
