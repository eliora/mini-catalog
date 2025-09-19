import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Typography, Chip, Box, Avatar } from '@mui/material';

// Product interface (matching the existing structure)
export interface Product {
  id: string;
  ref: string;
  hebrew_name?: string;
  english_name?: string;
  french_name?: string;
  product_line?: string;
  product_type?: string;
  type?: string;
  size?: string;
  qty: number;
  unit_price?: number;
  description?: string;
  description_he?: string;
  main_pic?: string;
  pics?: string[] | null;
  created_at: string;
  updated_at: string;
  // Computed fields from helper functions
  display_name?: string;
  formatted_price?: string;
  stock_status?: string;
  stock_status_color?: string;
  parsed_images?: { main?: string } | null;
}

// Helper to format currency
const formatCurrency = (amount: number | undefined) => {
  if (!amount) return '-';
  return `₪${amount}`;
};

// Helper to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('he-IL', { 
    day: '2-digit', 
    month: '2-digit', 
    year: '2-digit' 
  });
};

// Helper to get stock status color
const getStockStatusColor = (qty: number) => {
  if (qty === 0) return 'error.main';
  if (qty < 10) return 'warning.main';
  return 'success.main';
};

export const productsTableColumns: GridColDef<Product>[] = [
  // Product Name - Single Line with Avatar
  {
    field: 'display_name',
    headerName: 'שם מוצר',
    minWidth: 200,
    flex: 2,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar 
          src={params.row.main_pic || params.row.parsed_images?.main} 
          variant="rounded" 
          sx={{ width: 32, height: 32 }}
        >
          {(params.row.hebrew_name || params.row.english_name || params.row.ref)?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.row.hebrew_name || params.row.english_name || params.row.ref}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.ref}
          </Typography>
        </Box>
      </Box>
    ),
  },
  // Product Line - Single Line Chip
  {
    field: 'product_line',
    headerName: 'קו מוצרים',
    minWidth: 120,
    flex: 1,
    renderCell: (params) => (
      params.value ? (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          color="primary"
        />
      ) : (
        <Typography variant="body2" color="text.secondary">-</Typography>
      )
    ),
  },
  // Product Type - Single Line
  {
    field: 'product_type',
    headerName: 'סוג',
    minWidth: 100,
    flex: 0.8,
    renderCell: (params) => (
      <Typography variant="body2">
        {params.value || '-'}
      </Typography>
    ),
  },
  // Price - Single Line Only
  {
    field: 'unit_price',
    headerName: 'מחיר',
    minWidth: 80,
    flex: 0.8,
    renderCell: (params) => (
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {formatCurrency(params.value)}
      </Typography>
    ),
  },
  // Stock - Single Line with Color Based on Status
  {
    field: 'qty',
    headerName: 'מלאי',
    minWidth: 80,
    flex: 0.7,
    renderCell: (params) => {
      const color = getStockStatusColor(params.value as number);

      return (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600,
            color: color
          }}
        >
          {params.value}
        </Typography>
      );
    },
  },
  // Size - Single Line
  {
    field: 'size',
    headerName: 'גודל',
    minWidth: 70,
    flex: 0.6,
    renderCell: (params) => (
      <Typography variant="body2">
        {params.value || '-'}
      </Typography>
    ),
  },
  // Created Date - Single Line Short Format
  {
    field: 'created_at',
    headerName: 'נוצר',
    minWidth: 90,
    flex: 0.7,
    renderCell: (params) => (
      <Typography variant="body2">
        {formatDate(params.value as string)}
      </Typography>
    ),
  },
];
