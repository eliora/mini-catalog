import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Typography, Chip, Box, Avatar } from '@mui/material';
import { Person as PersonIcon, Business as BusinessIcon } from '@mui/icons-material';
import { format } from 'date-fns';

// Client interface (matching the existing structure)
export interface Client {
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

// Helper to format date
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd/MM/yy');
};

// Helper to get role configuration
const getRoleConfig = (role: string) => {
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
  
  return {
    label: roleLabels[role] || role,
    color: roleColors[role] || 'default',
    variant: role === 'admin' ? 'filled' as const : 'outlined' as const
  };
};

// Helper to get status configuration
const getStatusConfig = (status: string) => {
  const statusConfig: { [key: string]: { label: string; color: 'success' | 'default' | 'error' } } = {
    active: { label: 'פעיל', color: 'success' },
    inactive: { label: 'לא פעיל', color: 'default' },
    suspended: { label: 'מושעה', color: 'error' },
  };
  
  return statusConfig[status] || { label: status, color: 'default' };
};

export const clientsTableColumns: GridColDef<Client>[] = [
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
      const config = getRoleConfig(params.value as string);
      return (
        <Chip
          label={config.label}
          color={config.color}
          variant={config.variant}
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
      const config = getStatusConfig(params.value as string);
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
        {formatDate(params.value as string)}
      </Typography>
    ),
  },
];
