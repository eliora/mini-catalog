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
  parsed_images?: string[] | null;
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
      field: 'display_name',
      headerName: 'שם מוצר',
      minWidth: 200,
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={params.row.main_pic || params.row.parsed_images?.main} variant="rounded" sx={{ width: 32, height: 32 }}>
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
          {params.value ? `₪${params.value}` : '-'}
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
        const stockStatus = params.row.stock_status;
        let color = 'text.primary';
        
        if (stockStatus === 'out_of_stock') color = 'error.main';
        else if (stockStatus === 'low_stock') color = 'warning.main';
        else if (stockStatus === 'in_stock') color = 'success.main';

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
          key="edit"
          icon={<EditIcon />}
          label="עריכה"
          onClick={() => onEdit(params.row as Product)}
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
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
          },
        }}
      />
    </Box>
  );
};

export default ProductDataTable;
