import React from 'react';
import { TableRow, TableCell, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const ProductRow = ({ product, onEdit, onDelete }) => {
  return (
    <TableRow>
      <TableCell sx={{ textAlign: 'right' }}>{product.ref}</TableCell>
      <TableCell sx={{ textAlign: 'right' }}>{product.productName}</TableCell>
      <TableCell sx={{ textAlign: 'right' }}>{product.line}</TableCell>
      <TableCell sx={{ textAlign: 'right' }}>${product.unitPrice}</TableCell>
      <TableCell sx={{ textAlign: 'right' }}>
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
