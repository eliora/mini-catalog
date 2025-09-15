/**
 * OrderRow Component
 * 
 * Table row component for displaying order information in admin order management.
 * Shows comprehensive order details with action buttons for admin operations.
 * 
 * Features:
 * - Date and time display with localized formatting
 * - Order ID with formatted reference number
 * - Customer information with item count
 * - Total amount with currency formatting
 * - Status indicators with color coding
 * - Action buttons (view, edit, revive) for admin users
 * - Hover effects for better user experience
 * 
 * @param {Object} order - Order data object
 * @param {Function} onView - View order details callback
 * @param {Function} onEdit - Edit order callback
 * @param {Function} onRevive - Revive order callback
 * @param {Function} formatDate - Date formatting function
 * @param {boolean} isAdmin - Whether current user has admin privileges
 */

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
  // ===== UTILITY FUNCTIONS =====
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

  // ===== RENDER =====
  return (
    <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
      {/* Date and Time Column */}
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {formatDate(order.created_at)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(order.created_at).toLocaleTimeString('he-IL', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Typography>
      </TableCell>
      
      {/* Order ID Column */}
      <TableCell>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          #{order.id}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date().getFullYear()}-{String(order.id).padStart(4, '0')}
        </Typography>
      </TableCell>
      
      {/* Customer Information Column */}
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {order.customerName || order.customer_name || 'אורח'}
        </Typography>
        <Chip 
          label={`${getItemsCount(order)} פריטים`} 
          size="small" 
          variant="outlined" 
          sx={{ mt: 0.5, fontSize: '0.75rem' }}
        />
      </TableCell>
      
      {/* Total Amount Column */}
      <TableCell>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
          {formatCurrency(order.total)}
        </Typography>
      </TableCell>
      
      {/* Status Column */}
      <TableCell>
        <Chip 
          label="הוגשה" 
          size="small" 
          color="success" 
          sx={{ fontWeight: 600 }}
        />
      </TableCell>
      
      {/* Actions Column */}
      <TableCell>
        <Stack direction="row" spacing={1}>
          {/* View Button */}
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
          
          {/* Admin-only Actions */}
          {isAdmin && (
            <>
              {/* Edit Button */}
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
              
              {/* Revive Button */}
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
