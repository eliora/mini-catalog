/**
 * @file Client Data Table (DataGrid Version)
 * @description Renders a professional data grid for displaying and managing clients,
 * featuring sorting, pagination, selection, and custom cell rendering.
 * Built with @mui/x-data-grid.
 */
'use client';
import React from 'react';
import { DataGrid, GridColDef, GridValueGetterParams, GridActionsCellItem } from '@mui/x-data-grid';
import { Box, Chip, Typography, Tooltip, Avatar } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Person as PersonIcon, Business as BusinessIcon } from '@mui/icons-material';
import { format } from 'date-fns';

// Complete Client interface matching database schema
interface Client {
  id: string;
  email: string;
  full_name: string;
  user_role: 'standard' | 'verified_members' | 'customer' | 'admin';
  business_name?: string;
  phone_number?: string;
  address?: any;
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
      minWidth: 180,
      flex: 1.5,
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
      minWidth: 200,
      flex: 1.5,
    },
    // Business Name - Single Line
    {
      field: 'business_name',
      headerName: 'עסק',
      minWidth: 120,
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
      minWidth: 120,
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
      minWidth: 150,
      flex: 1.3,
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
      minWidth: 110,
      flex: 0.8,
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
      minWidth: 90,
      flex: 0.7,
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
      minWidth: 100,
      flex: 0.8,
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
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="עריכה"
          onClick={() => onEdit(params.row as Client)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="מחיקה"
          onClick={() => onDelete(params.id as string)}
          showInMenu
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={clients}
        columns={columns}
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
        headerHeight={48}
        sx={{
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#fafafa',
            borderBottom: '2px solid #e0e0e0',
            fontSize: '0.875rem',
            fontWeight: 600,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f5f5f5',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
          },
        }}
      />
    </Box>
  );
};

export default ClientDataTable;
