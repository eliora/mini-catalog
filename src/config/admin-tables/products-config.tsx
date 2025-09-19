import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Typography, Chip } from '@mui/material';
import { Product } from '@/types/product';

// Re-export Product type for convenience
export type { Product };

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
  // Product Ref
  {
    field: 'ref',
    headerName: 'מק"ט',
    minWidth: 100,
    width: 120,
    renderCell: (params) => (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {params.value || '-'}
      </Typography>
    ),
  },
  // Hebrew Name
  {
    field: 'hebrew_name',
    headerName: 'שם עברי',
    minWidth: 150,
    width: 200,
    renderCell: (params) => (
      <Typography variant="body2">
        {params.value || '-'}
      </Typography>
    ),
  },
  // English Name
  {
    field: 'english_name',
    headerName: 'שם אנגלי',
    minWidth: 150,
    width: 200,
    renderCell: (params) => (
      <Typography variant="body2">
        {params.value || '-'}
      </Typography>
    ),
  },
  // Product Line - Single Line Chip
  {
    field: 'product_line',
    headerName: 'קו מוצרים',
    minWidth: 120,
    width: 150,
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
  // Price - Single Line Only
  {
    field: 'unit_price',
    headerName: 'מחיר',
    minWidth: 80,
    width: 100,
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
    width: 90,
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
    width: 80,
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
    width: 110,
    renderCell: (params) => (
      <Typography variant="body2">
        {formatDate(params.value as string)}
      </Typography>
    ),
  },
];
