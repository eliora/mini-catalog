/**
 * ProductRow Component
 * 
 * Table row component for displaying product information in admin product management.
 * Provides a clean, tabular view of product data with edit and delete actions.
 * 
 * Features:
 * - Product reference (ID) display
 * - Product name and description
 * - Price formatting with currency symbol
 * - Edit and delete action buttons
 * - Hover effects for better UX
 * 
 * @param {Object} product - Product data object
 * @param {string} product.ref - Product reference/ID
 * @param {string} product.productName - Product name
 * @param {string} product.short_description_he - Hebrew short description
 * @param {string} product.line - Product line (fallback for description)
 * @param {number} product.unitPrice - Product unit price
 * @param {Function} onEdit - Edit product callback
 * @param {Function} onDelete - Delete product callback (receives product.ref)
 */

import React from 'react';
import { TableRow, TableCell, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const ProductRow = ({ product, onEdit, onDelete }) => {
  return (
    <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
      {/* Product Reference */}
      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
        {product.ref}
      </TableCell>
      
      {/* Product Name */}
      <TableCell sx={{ fontWeight: 600 }}>
        {product.productName}
      </TableCell>
      
      {/* Category/Description */}
      <TableCell>
        {product.short_description_he || product.line || '-'}
      </TableCell>
      
      {/* Price */}
      <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>
        ${Number(product.unitPrice || 0).toFixed(2)}
      </TableCell>
      
      {/* Actions */}
      <TableCell>
        <IconButton 
          onClick={() => onEdit(product)}
          color="primary"
          size="small"
          sx={{ mr: 1 }}
        >
          <EditIcon />
        </IconButton>
        <IconButton 
          onClick={() => onDelete(product.ref)}
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default React.memo(ProductRow);
