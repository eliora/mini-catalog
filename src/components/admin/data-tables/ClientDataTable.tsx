/**
 * @file Client Data Table (DataGrid Version)
 * @description Renders a professional data grid for displaying and managing clients,
 * featuring sorting, pagination, selection, and custom cell rendering.
 * Built with @mui/x-data-grid.
 */
'use client';
import React from 'react';
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Box, Chip, Typography, Avatar } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Person as PersonIcon, Business as BusinessIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import AdminDataGrid from '@/components/admin/shared/AdminDataGrid';

// Complete Client interface matching database schema
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
  last_login?: string;
  display_name?: string;
  formatted_address?: string;
  is_admin?: boolean;
  is_verified?: boolean;
  is_active?: boolean;
}

interface ClientDataTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
  // ... other props like pagination, loading state etc. will be handled by DataGrid
}

const ClientDataTable: React.FC<ClientDataTableProps> = ({ clients, onEdit, onDelete }) => {
  const columns: GridColDef[] = [
    // Client Name with Avatar - Single Line
    {
      field: 'full_name',
      headerName: 'שם מלא',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {params.row.business_name ? <BusinessIcon /> : <PersonIcon />}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value || params.row.email?.split('@')[0] || 'ללא שם'}
          </Typography>
        </Box>
      ),
    },
    // Email - Single Line
    {
      field: 'email',
      headerName: 'אימייל',
      flex: 1,
    },
    // Business Name - Single Line
    {
      field: 'business_name',
      headerName: 'עסק',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 'פרטי'}
        </Typography>
      ),
    },
    // Phone - Single Line
    {
      field: 'phone_number',
      headerName: 'טלפון',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" dir="ltr">
          {params.value || '-'}
        </Typography>
      ),
    },
    // Address - Single Line with Tooltip
    {
      field: 'formatted_address',
      headerName: 'כתובת',
      flex: 1,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={params.value || 'לא הוזנה כתובת'}
        >
          {params.value || 'לא הוזנה כתובת'}
        </Typography>
      ),
    },
    // Role - Single Line Chip
    {
      field: 'user_role',
      headerName: 'תפקיד',
      flex: 1,
      renderCell: (params) => {
        const roleLabels: { [key: string]: string } = {
          standard: 'רגיל',
          verified_members: 'מאומת',
          customer: 'לקוח',
          admin: 'מנהל',
        };
        const roleColors: { [key: string]: 'error' | 'primary' | 'secondary' | 'default' } = {
          admin: 'error',
          verified_members: 'primary',
          customer: 'secondary',
          standard: 'default',
        };
        return (
          <Chip
            label={roleLabels[params.value] || params.value}
            color={roleColors[params.value] || 'default'}
            variant={params.value === 'admin' ? 'filled' : 'outlined'}
            size="small"
          />
        );
      },
    },
    // Status - Single Line Chip
    {
      field: 'status',
      headerName: 'סטטוס',
      flex: 1,
      renderCell: (params) => {
        const statusConfig: { [key: string]: { label: string; color: 'success' | 'default' | 'error' } } = {
          active: { label: 'פעיל', color: 'success' },
          inactive: { label: 'לא פעיל', color: 'default' },
          suspended: { label: 'מושעה', color: 'error' },
        };
        const config = statusConfig[params.value] || { label: params.value, color: 'default' };
        return <Chip label={config.label} color={config.color} size="small" />;
      },
    },
    // Created Date - Single Line Only
    {
      field: 'created_at',
      headerName: 'נוצר',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.value), 'dd/MM/yy')}
        </Typography>
      ),
    },
    // Actions Column
    {
      field: 'actions',
      type: 'actions',
      headerName: 'פעולות',
      flex: 0.5,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="עריכה"
          onClick={() => onEdit(params.row as Client)}
          showInMenu
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="מחיקה"
          onClick={() => onDelete(params.id as string)}
          showInMenu
        />,
      ],
    },
  ];

  return (
    <AdminDataGrid
      rows={clients}
      columns={columns}
      height={600}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 10 },
        },
      }}
      pageSizeOptions={[10, 25, 50]}
      checkboxSelection
      disableRowSelectionOnClick
      autoHeight={false}
      rowHeight={52}
    />
  );
};

export default ClientDataTable;
