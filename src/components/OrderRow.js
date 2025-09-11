import React from 'react';
import { 
  TableRow, 
  TableCell, 
  IconButton, 
  Typography, 
  Chip, 
  Stack
} from '@mui/material';
import { 
  Visibility as ViewIcon,
  Edit as EditIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';

const OrderRow = ({ order, onView, onEdit, onRevive, formatDate, isAdmin = false }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getItemsCount = (order) => {
    try {
      const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
      return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    } catch {
      return 0;
    }
  };

  return (
    <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
      {/* Date/Time - Now First Column */}
      <TableCell sx={{ }}>
        <Typography variant="body2">
          {formatDate(order.created_at)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(order.created_at).toLocaleTimeString('he-IL', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Typography>
      </TableCell>
      
      {/* Order Number - Now Second Column */}
      <TableCell sx={{ }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          #{order.id}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date().getFullYear()}-{String(order.id).padStart(4, '0')}
        </Typography>
      </TableCell>
      
      {/* Customer - Now Third Column */}
      <TableCell sx={{ }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {order.customerName || order.customer_name || 'אורח'}
        </Typography>
        <Chip 
          label={`${getItemsCount(order)} פריטים`} 
          size="small" 
          variant="outlined" 
          sx={{ mt: 0.5 }}
        />
      </TableCell>
      
      {/* Amount - Now Fourth Column */}
      <TableCell sx={{ }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
          {formatCurrency(order.total)}
        </Typography>
      </TableCell>
      
      {/* Status - Now Fifth Column */}
      <TableCell sx={{ }}>
        <Chip 
          label="הוגשה" 
          size="small" 
          color="success" 
          sx={{ fontWeight: 600 }}
        />
      </TableCell>
      
      {/* Actions - Now Sixth Column */}
      <TableCell sx={{ }}>
        <Stack direction="row" spacing={1}>
          <IconButton 
            size="small" 
            onClick={() => onView(order)}
            color="primary"
            sx={{ 
              border: '1px solid', 
              borderColor: 'primary.main',
              '&:hover': { bgcolor: 'primary.light' }
            }}
          >
            <ViewIcon />
          </IconButton>
          
          {isAdmin && (
            <>
              <IconButton 
                size="small" 
                onClick={() => onEdit && onEdit(order)}
                color="secondary"
                sx={{ 
                  border: '1px solid', 
                  borderColor: 'secondary.main',
                  '&:hover': { bgcolor: 'secondary.light' }
                }}
              >
                <EditIcon />
              </IconButton>
              
              <IconButton 
                size="small" 
                onClick={() => onRevive && onRevive(order)}
                color="warning"
                sx={{ 
                  border: '1px solid', 
                  borderColor: 'warning.main',
                  '&:hover': { bgcolor: 'warning.light' }
                }}
              >
                <RestoreIcon />
              </IconButton>
            </>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default React.memo(OrderRow);
