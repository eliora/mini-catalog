/**
 * AdminProductsTable Component
 * 
 * Displays products in a table format with admin controls for editing and deletion.
 * Extracted from Admin.js to improve maintainability and reusability.
 * 
 * Features:
 * - Product listing with ref, name, category, and price
 * - Edit and delete actions for each product
 * - Loading and empty states
 * - Add new product button
 * 
 * @param {Array} products - Array of product objects
 * @param {boolean} loading - Loading state indicator
 * @param {Function} onAddProduct - Callback for adding new product
 * @param {Function} onEditProduct - Callback for editing product
 * @param {Function} onDeleteProduct - Callback for deleting product
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon
} from '@mui/icons-material';
import ProductRow from './ProductRow';
import StyledButton from '../../ui/StyledButton';

const AdminProductsTable = ({
  products,
  loading,
  onAddProduct,
  onEditProduct,
  onDeleteProduct
}) => {
  return (
    <Box>
      {/* Header with Add Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          ניהול מוצרים
        </Typography>
        <StyledButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddProduct}
        >
          הוסף מוצר
        </StyledButton>
      </Box>

      {/* Products Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>קוד מוצר</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>שם מוצר</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>קטגוריה</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>מחיר</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    אין מוצרים במערכת
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <ProductRow
                  key={product.ref}
                  product={product}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default React.memo(AdminProductsTable);
