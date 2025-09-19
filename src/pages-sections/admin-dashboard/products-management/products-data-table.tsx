/**
 * @file Product Data Table (DataGrid Version)
 * @description Renders a professional data grid for displaying and managing products.
 * Built with @mui/x-data-grid.
 */
'use client';
import React from 'react';
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Chip, Typography } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import AdminDataGrid from '@/components/admin/shared/AdminDataGrid';

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
    // Product Ref
    {
      field: 'ref',
      headerName: 'מק"ט',
      flex: 1,
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
      flex: 1,
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
      flex: 1,
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
    // Price - Single Line Only
    {
      field: 'unit_price',
      headerName: 'מחיר',
      flex: 1,
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
      flex: 1,
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
      flex: 1,
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
      flex: 1,
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
      flex: 0.5,
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
    <AdminDataGrid
      rows={products}
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

export default ProductDataTable;
