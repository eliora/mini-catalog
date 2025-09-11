import React from 'react';
import { TableRow, TableCell, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const ProductRow = ({ product, onEdit, onDelete }) => {
  return (
    <TableRow>
      <TableCell>{product.ref}</TableCell>
      <TableCell>{product.productName}</TableCell>
      <TableCell>{product.short_description_he || product.line}</TableCell>
      <TableCell>${product.unitPrice}</TableCell>
      <TableCell>
        <IconButton onClick={() => onEdit(product)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => onDelete(product.ref)}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default React.memo(ProductRow);
