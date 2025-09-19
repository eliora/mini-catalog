/**
 * @file Orders Table Configuration
 * @description DataGrid column configuration for orders management
 * Based on the existing orders data structure
 */

import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Chip, Avatar } from '@mui/material';
import { ShoppingCart as OrderIcon } from '@mui/icons-material';

// Order interface based on the current structure
export interface Order {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items_count: number;
  created_at: string;
  updated_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
  // From API transformation
  formattedTotal?: string;
  statusLabel?: string;
  formattedDate?: string;
}

// Status color mapping
const getStatusColor = (status: string) => {
  const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'primary',
    shipped: 'secondary',
    delivered: 'success',
    cancelled: 'error'
  };
  return colors[status] || 'default';
};

// Status labels in Hebrew
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'ממתין',
    confirmed: 'אושר',
    processing: 'מעובד',
    shipped: 'נשלח',
    delivered: 'נמסר',
    cancelled: 'בוטל'
  };
  return labels[status] || status;
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS'
  }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Orders table columns configuration
export const ordersTableColumns: GridColDef[] = [
  // Order ID with icon
  {
    field: 'id',
    headerName: 'מספר הזמנה',
    minWidth: 160,
    flex: 1,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          <OrderIcon fontSize="small" />
        </Avatar>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          #{params.value.substring(0, 8).toUpperCase()}
        </Typography>
      </Box>
    ),
  },
  
  // Customer name
  {
    field: 'customer_name',
    headerName: 'לקוח',
    minWidth: 150,
    flex: 1.2,
    renderCell: (params) => (
      <Typography variant="body2">
        {params.value || 'לקוח אנונימי'}
      </Typography>
    ),
  },
  
  // Customer phone
  {
    field: 'customer_phone',
    headerName: 'טלפון',
    minWidth: 120,
    flex: 1,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary">
        {params.value || '-'}
      </Typography>
    ),
  },
  
  // Customer email
  {
    field: 'customer_email',
    headerName: 'אימייל',
    minWidth: 180,
    flex: 1.2,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary">
        {params.value || '-'}
      </Typography>
    ),
  },
  
  // Total amount
  {
    field: 'total_amount',
    headerName: 'סה"כ',
    minWidth: 100,
    flex: 0.8,
    renderCell: (params) => (
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {formatCurrency(params.value)}
      </Typography>
    ),
  },
  
  // Status
  {
    field: 'status',
    headerName: 'סטטוס',
    minWidth: 100,
    flex: 0.8,
    renderCell: (params) => (
      <Chip
        label={getStatusLabel(params.value)}
        size="small"
        color={getStatusColor(params.value)}
        variant="filled"
      />
    ),
  },
  
  // Created date
  {
    field: 'created_at',
    headerName: 'תאריך יצירה',
    minWidth: 140,
    flex: 1,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary">
        {formatDate(params.value)}
      </Typography>
    ),
  },
];

// Available filters for orders
export const ordersFilters = {
  status: {
    label: 'סטטוס',
    options: [
      { value: 'all', label: 'הכל' },
      { value: 'pending', label: 'ממתין' },
      { value: 'confirmed', label: 'אושר' },
      { value: 'processing', label: 'מעובד' },
      { value: 'shipped', label: 'נשלח' },
      { value: 'delivered', label: 'נמסר' },
      { value: 'cancelled', label: 'בוטל' },
    ]
  },
  dateRange: {
    label: 'טווח תאריכים',
    type: 'dateRange'
  }
};

// Bulk actions for orders
export const ordersBulkActions = [
  {
    label: 'שנה סטטוס',
    action: 'changeStatus'
  },
  {
    label: 'ייצא להדפסה',
    action: 'print'
  },
  {
    label: 'מחק הזמנות',
    action: 'delete',
    dangerous: true
  }
];
