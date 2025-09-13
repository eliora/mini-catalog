/**
 * OrderItemsTable Component
 * 
 * Table displaying order items with edit capabilities for admin users.
 * Extracted from OrderDetails.js for better maintainability and reusability.
 * 
 * Features:
 * - Product listing with ref, name, size, quantity, price, total
 * - Edit mode for quantity and price changes
 * - Add and remove item functionality
 * - Responsive table design
 * 
 * @param {Array} items - Array of order items
 * @param {boolean} editMode - Whether in edit mode
 * @param {boolean} isAdmin - Whether user is admin
 * @param {Function} formatCurrency - Currency formatting function
 * @param {Function} onQuantityChange - Quantity change callback
 * @param {Function} onPriceChange - Price change callback
 * @param {Function} onRemoveItem - Remove item callback
 * @param {Function} onAddItem - Add item callback
 */

import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Stack,
  Box,
  TextField,
  Button
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const OrderItemsTable = ({
  items,
  editMode,
  isAdmin,
  formatCurrency,
  onQuantityChange,
  onPriceChange,
  onRemoveItem,
  onAddItem
}) => {
  return (
    <Paper elevation={3} sx={{ mb: 3 }}>
      {/* Table Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            פירוט מוצרים
          </Typography>
          {editMode && isAdmin && (
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
      </Box>

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
                      onClick={() => onQuantityChange(index, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 700 }}>
                      {item.quantity}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => onQuantityChange(index, 1)}
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
                    onChange={(e) => onPriceChange(index, e.target.value)}
                    sx={{ width: 100 }}
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  />
                ) : (
                  <Typography sx={{ fontWeight: 600 }}>
                    {formatCurrency(item.unitPrice)}
                  </Typography>
                )}
              </TableCell>
              
              {/* Total Price */}
              <TableCell align="right">
                <Typography sx={{ fontWeight: 700 }}>
                  {formatCurrency(item.unitPrice * item.quantity)}
                </Typography>
              </TableCell>
              
              {/* Actions */}
              {editMode && (
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => onRemoveItem(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default React.memo(OrderItemsTable);
