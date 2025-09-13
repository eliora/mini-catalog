/**
 * OrderItemsTable Component
 * 
 * Displays order items in a table format with editing capabilities.
 * Supports admin editing modes for quantities and prices.
 * 
 * Features:
 * - Item display with product info, quantities, prices
 * - Admin editing mode for quantities and prices  
 * - Add/remove item functionality
 * - Responsive table layout
 * - Edit/view mode toggling
 * 
 * @param {Array} items - Order items to display
 * @param {boolean} editMode - Whether table is in edit mode
 * @param {boolean} isAdmin - Whether user has admin privileges
 * @param {Function} onQuantityChange - Quantity change handler
 * @param {Function} onPriceChange - Price change handler
 * @param {Function} onRemoveItem - Remove item handler
 * @param {Function} onAddItem - Add item handler
 * @param {Function} formatCurrency - Currency formatting function
 */

import React from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  IconButton,
  TextField,
  Stack,
  Button
} from '@mui/material';
import {
  Remove as RemoveIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const OrderItemsTable = ({
  items = [],
  editMode = false,
  isAdmin = false,
  onQuantityChange,
  onPriceChange,
  onRemoveItem,
  onAddItem,
  formatCurrency
}) => {
  return (
    <>
      {/* Table Header with Add Button */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          פירוט מוצרים
        </Typography>
        {editMode && isAdmin && onAddItem && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddItem}
          >
            הוסף פריט
          </Button>
        )}
      </Stack>

      {/* Items Table */}
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>מק"ט</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>שם מוצר</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>גודל</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>כמות</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>מחיר יחידה</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>סה"כ</TableCell>
            {editMode && <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>פעולות</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index} sx={{ '&:nth-of-type(even)': { bgcolor: 'grey.50' } }}>
              {/* Product Reference */}
              <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                {item.ref}
              </TableCell>

              {/* Product Name */}
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.productName || item.productName2}
                </Typography>
              </TableCell>

              {/* Size */}
              <TableCell align="right">
                {item.size || '-'}
              </TableCell>

              {/* Quantity */}
              <TableCell align="right">
                {editMode ? (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton 
                      size="small" 
                      onClick={() => onQuantityChange?.(index, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 700 }}>
                      {item.quantity}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => onQuantityChange?.(index, 1)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Stack>
                ) : (
                  <Typography sx={{ fontWeight: 700, color: 'error.main', textAlign: 'center' }}>
                    {item.quantity}
                  </Typography>
                )}
              </TableCell>

              {/* Unit Price */}
              <TableCell align="right">
                {editMode && isAdmin ? (
                  <TextField
                    size="small"
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => onPriceChange?.(index, e.target.value)}
                    sx={{ width: 100 }}
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  />
                ) : (
                  <Typography sx={{ fontWeight: 600 }}>
                    {formatCurrency?.(item.unitPrice)}
                  </Typography>
                )}
              </TableCell>

              {/* Total Price */}
              <TableCell align="right">
                <Typography sx={{ fontWeight: 700 }}>
                  {formatCurrency?.(item.unitPrice * item.quantity)}
                </Typography>
              </TableCell>

              {/* Actions */}
              {editMode && (
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => onRemoveItem?.(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default OrderItemsTable;
