import React from 'react';
import { TableRow, TableCell, IconButton } from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';

const OrderRow = ({ order, onView, formatDate }) => {
  return (
    <TableRow>
      <TableCell sx={{ textAlign: 'right' }}>{order.id}</TableCell>
      <TableCell sx={{ textAlign: 'right' }}>{order.customerName}</TableCell>
      <TableCell sx={{ textAlign: 'right' }}>${order.total}</TableCell>
      <TableCell sx={{ textAlign: 'right' }}>{formatDate(order.created_at)}</TableCell>
      <TableCell sx={{ textAlign: 'right' }}>
        <IconButton onClick={() => onView(order)}>
          <ViewIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default React.memo(OrderRow);
