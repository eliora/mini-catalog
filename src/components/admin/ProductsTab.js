import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, saveProduct, deleteProduct as apiDeleteProduct } from '../../api/products';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon
} from '@mui/icons-material';
import ProductRow from './data/ProductRow';
import StyledButton from '../ui/StyledButton';

const ProductsTab = ({ onSnackbar }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      onSnackbar?.('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductDialog(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductDialog(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      await saveProduct(productData);
      onSnackbar?.('Product saved successfully', 'success');
      loadProducts();
      setProductDialog(false);
    } catch (error) {
      console.error('Error saving product:', error);
      onSnackbar?.('Error saving product', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await apiDeleteProduct(productId);
      onSnackbar?.('Product deleted successfully', 'success');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      onSnackbar?.('Error deleting product', 'error');
    }
  };

  const sortedProducts = useMemo(() => 
    [...products].sort((a, b) => (a.ref || '').localeCompare(b.ref || '')), 
    [products]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Products ({products.length})
        </Typography>
        <StyledButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
        >
          Add Product
        </StyledButton>
      </Box>

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ref</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProducts.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Product Dialog - TODO: Extract to separate component */}
      {productDialog && (
        <Dialog open={productDialog} onClose={() => setProductDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingProduct ? 'Edit Product' : 'Add Product'}
          </DialogTitle>
          <DialogContent>
            {/* TODO: Create ProductForm component */}
            <Alert severity="info">Product form component needs to be implemented</Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProductDialog(false)}>Cancel</Button>
            <StyledButton variant="contained" onClick={() => setProductDialog(false)}>
              Save
            </StyledButton>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ProductsTab;
