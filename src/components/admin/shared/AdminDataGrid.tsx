/**
 * @file Admin DataGrid Component
 * @description Simple DataGrid wrapper for admin area
 * 
 * Features:
 * - Basic admin styling
 * - Full width container
 * - TypeScript support
 * 
 * Usage:
 * ```tsx
 * <AdminDataGrid
 *   rows={data}
 *   columns={columns}
 *   height={600}
 *   checkboxSelection
 *   pageSizeOptions={[10, 25, 50]}
 * />
 * ```
 */

'use client';

import React from 'react';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { Box, BoxProps } from '@mui/material';

interface AdminDataGridProps extends DataGridProps {
  containerProps?: BoxProps;
  height?: number | string;
  autoHeight?: boolean;
}

const AdminDataGrid: React.FC<AdminDataGridProps> = ({
  containerProps,
  height = 600,
  autoHeight = false,
  sx,
  ...dataGridProps
}) => {
  const defaultSx = {
    // Simple admin DataGrid styling
    '& .MuiDataGrid-root': {
      border: 'none',
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
      '& .MuiDataGrid-row': {
        cursor: 'default',
        '&:hover': {
          backgroundColor: '#f8f9fa',
        },
      },
      '& .MuiDataGrid-footerContainer': {
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
      },
    },
    // Merge with custom sx
    ...sx,
  };

  return (
    <Box
      sx={{
        height: autoHeight ? 'auto' : height,
        width: '100%',
        minHeight: autoHeight ? 'auto' : 400,
        ...containerProps?.sx,
      }}
      {...containerProps}
    >
      <DataGrid
        {...dataGridProps}
        sx={defaultSx}
        // Enable column resizing
        disableColumnResize={false}
        // Disable multirow selection
        disableMultipleRowSelection={true}
        // Ensure DataGrid takes full width
        slots={{
          ...dataGridProps.slots,
        }}
        slotProps={{
          ...dataGridProps.slotProps,
        }}
      />
    </Box>
  );
};

export default AdminDataGrid;