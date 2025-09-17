/**
 * @file Product Data Table (DataGrid Version)
 * @description Renders a professional data grid for displaying and managing products.
 * Built with @mui/x-data-grid.
 */
'use client';
import React from 'react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Box, Chip, Typography, Avatar } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Product {
  id: string;
  ref: string;
  name: string;
  name_en?: string;
  description?: string;
  category: string;
  price: number;
  cost_price?: number;
  stock: number;
  low_stock_threshold?: number;
  status: 'active' | 'draft' | 'out_of_stock' | 'discontinued';
  images?: string[];
  created_at: string;
  updated_at: string;
}

interface ProductDataTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  // Future props for server-side operations can be added here
}

const ProductDataTable: React.FC<ProductDataTableProps> = ({ products, onEdit, onDelete }) => {
  const columns: GridColDef[] = [
    // Product Name - Single Line with Avatar
    {
      field: 'name',
      headerName: 'שם מוצר',
      minWidth: 200,
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={params.row.images?.[0]} variant="rounded" sx={{ width: 32, height: 32 }}>
            {params.row.name?.charAt(0)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    // Product Ref - Single Line
    {
      field: 'ref',
      headerName: 'מק"ט',
      minWidth: 100,
      flex: 0.8,
    },
    // Category - Single Line Chip
    {
      field: 'category',
      headerName: 'קטגוריה',
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    // Price - Single Line Only
    {
      field: 'price',
      headerName: 'מחיר',
      minWidth: 80,
      flex: 0.8,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ₪{params.value}
        </Typography>
      ),
    },
    // Stock - Single Line with Color
    {
      field: 'stock',
      headerName: 'מלאי',
      minWidth: 80,
      flex: 0.7,
      renderCell: (params) => {
        const isLowStock = params.value <= (params.row.low_stock_threshold || 0);
        const isOutOfStock = params.value === 0;
        return (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: isOutOfStock ? 'error.main' : isLowStock ? 'warning.main' : 'text.primary'
            }}
          >
            {params.value}
          </Typography>
        );
      },
    },
    // Status - Single Line Chip
    {
      field: 'status',
      headerName: 'סטטוס',
      minWidth: 100,
      flex: 0.9,
      renderCell: (params) => {
        const statusConfig: { [key: string]: { label: string; color: any } } = {
          active: { label: 'פעיל', color: 'success' },
          draft: { label: 'טיוטה', color: 'warning' },
          out_of_stock: { label: 'אזל', color: 'error' },
          discontinued: { label: 'הופסק', color: 'default' },
        };
        const config = statusConfig[params.value] || { label: params.value, color: 'default' };
        return <Chip label={config.label} color={config.color} size="small" />;
      },
    },
    // Created Date - Single Line Short Format
    {
      field: 'created_at',
      headerName: 'נוצר',
      minWidth: 90,
      flex: 0.7,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString('he-IL', { 
            day: '2-digit', 
            month: '2-digit', 
            year: '2-digit' 
          })}
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
          onClick={() => onEdit(params.row as Product)}
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
        rows={products}
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

export default ProductDataTable;
