/**
 * @file Universal Admin Data Table Component
 * @description Reusable DataGrid component for all admin management modules
 * Based on the client management DataGrid pattern with consistent styling
 */

'use client';

import React from 'react';
import { Box } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridActionsCellItemProps,
  GridRowParams,
  GridRowSelectionModel
} from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface AdminDataTableProps<T = { id: string }> {
  // Data and configuration
  data: T[];
  columns: GridColDef[];
  loading?: boolean;
  
  // Actions
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  customActions?: Array<{
    icon: React.ReactElement;
    label: string;
    onClick: (item: T) => void;
    showInMenu?: boolean;
  }>;
  
  // Permissions
  permissions?: {
    canEdit?: boolean;
    canDelete?: boolean;
  };
  
  // Table configuration
  pageSize?: number;
  pageSizeOptions?: number[];
  checkboxSelection?: boolean;
  disableRowSelectionOnClick?: boolean;
  height?: number;
  autoHeight?: boolean;
}

const AdminDataTable = <T extends { id: string }>({
  data,
  columns: baseColumns,
  loading = false,
  onEdit,
  onDelete,
  onSelectionChange,
  customActions = [],
  permissions = { canEdit: true, canDelete: true },
  pageSize = 10,
  pageSizeOptions = [10, 25, 50],
  checkboxSelection = true,
  disableRowSelectionOnClick = true,
  height = 600,
  autoHeight = false
}: AdminDataTableProps<T>) => {
  
  // Add actions column if needed
  const columns: GridColDef[] = React.useMemo(() => {
    const hasActions = onEdit || onDelete || customActions.length > 0;
    
    if (!hasActions) {
      return baseColumns;
    }

    const actionsColumn: GridColDef = {
      field: 'actions',
      type: 'actions',
      headerName: 'פעולות',
      width: 80,
      getActions: (params: GridRowParams) => {
        const actions: React.ReactElement<GridActionsCellItemProps>[] = [];
        
        // Edit action
        if (onEdit && permissions.canEdit) {
          actions.push(
            <GridActionsCellItem
              key="edit"
              icon={<EditIcon />}
              label="עריכה"
              onClick={() => onEdit(params.row as T)}
              showInMenu
            />
          );
        }
        
        // Delete action
        if (onDelete && permissions.canDelete) {
          actions.push(
            <GridActionsCellItem
              key="delete"
              icon={<DeleteIcon />}
              label="מחיקה"
              onClick={() => onDelete(params.id as string)}
              showInMenu
            />
          );
        }
        
        // Custom actions
        customActions.forEach((action, index) => {
          actions.push(
            <GridActionsCellItem
              key={`custom-${index}`}
              icon={action.icon}
              label={action.label}
              onClick={() => action.onClick(params.row as T)}
              showInMenu={action.showInMenu}
            />
          );
        });
        
        return actions;
      },
    };

    return [...baseColumns, actionsColumn];
  }, [baseColumns, onEdit, onDelete, customActions, permissions]);

  const handleSelectionModelChange = (selectionModel: GridRowSelectionModel) => {
    if (onSelectionChange) {
      onSelectionChange(selectionModel as unknown as string[]);
    }
  };

  return (
    <Box sx={{ height: autoHeight ? 'auto' : height, width: '100%' }}>
      <DataGrid
        rows={data}
        columns={columns}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize },
          },
        }}
        pageSizeOptions={pageSizeOptions}
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        autoHeight={autoHeight}
        rowHeight={52}
        onRowSelectionModelChange={handleSelectionModelChange}
        sx={{
          // Consistent styling based on ClientDataTable
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
          // Remove hover effects as per user preference
          '& .MuiDataGrid-row': {
            cursor: 'default',
          },
        }}
      />
    </Box>
  );
};

export default AdminDataTable;
