/**
 * AdminAddItemDialog Component
 * 
 * Dialog for admin users to add custom items to orders with custom pricing.
 * Allows selection from product catalog and price/quantity override.
 * 
 * Features:
 * - Product selection dropdown from catalog
 * - Custom price override (optional)
 * - Custom quantity selection
 * - Form validation
 * - Add to cart functionality
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Button
} from '@mui/material';
import { Product } from '../../types/product';

// Legacy cart item interface for backward compatibility
interface LegacyCartItem {
  ref: string;
  productName: string;
  productName2?: string;
  size?: string;
  unitPrice: number;
  quantity: number;
}

interface AdminAddItemDialogProps {
  open: boolean;
  onClose: () => void;
  products?: Product[];
  onAddItem: (item: LegacyCartItem) => void;
}

const AdminAddItemDialog: React.FC<AdminAddItemDialogProps> = ({
  open,
  onClose,
  products = [],
  onAddItem
}) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customQuantity, setCustomQuantity] = useState(1);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedProduct('');
      setCustomPrice('');
      setCustomQuantity(1);
    }
  }, [open]);

  /**
   * Handle adding item to cart
   */
  const handleAddItem = () => {
    if (!selectedProduct || !Array.isArray(products)) return;

    const product = products.find(p => p.ref === selectedProduct);
    if (!product) return;

    const customItem: LegacyCartItem = {
      ref: product.ref,
      productName: product.name_he || product.productName || '',
      productName2: product.name_en || product.productName2 || '',
      size: product.size || '',
      unitPrice: Number(customPrice) || Number(product.unit_price) || 0,
      quantity: Number(customQuantity) || 1
    };

    onAddItem(customItem);
    onClose();
  };

  /**
   * Get selected product for price display
   */
  const selectedProductData = Array.isArray(products) 
    ? products.find(p => p.ref === selectedProduct)
    : null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>הוסף פריט מותאם אישית</DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 2 }}>
          {/* Product Selection */}
          <FormControl fullWidth>
            <InputLabel>בחר מוצר</InputLabel>
            <Select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              label="בחר מוצר"
            >
              {Array.isArray(products) && products.map((product) => (
                <MenuItem key={product.ref} value={product.ref}>
                  #{product.ref} - {product.name_he || product.productName}
                  {product.size && ` (${product.size})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Original Price Display */}
          {selectedProductData && (
            <TextField
              label="מחיר מקורי"
              value={`₪${Number(selectedProductData.unit_price || 0).toFixed(2)}`}
              disabled
              size="small"
              helperText="המחיר המקורי של המוצר במערכת"
            />
          )}

          {/* Custom Price Override */}
          <TextField
            label="מחיר מותאם אישית (אופציונלי)"
            type="number"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            helperText="השאר ריק לשימוש במחיר המקורי"
          />

          {/* Quantity */}
          <TextField
            label="כמות"
            type="number"
            value={customQuantity}
            onChange={(e) => setCustomQuantity(Number(e.target.value) || 1)}
            InputProps={{ inputProps: { min: 1, max: 99 } }}
          />

          {/* Price Preview */}
          {selectedProduct && (
            <TextField
              label="סה״כ מחיר"
              value={`₪${(
                (Number(customPrice) || Number(selectedProductData?.unit_price) || 0) * 
                (Number(customQuantity) || 1)
              ).toFixed(2)}`}
              disabled
              size="small"
            />
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button 
          variant="outlined" 
          onClick={onClose}
          sx={{
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'primary.50'
            }
          }}
        >
          ביטול
        </Button>
        <Button 
          variant="contained" 
          onClick={handleAddItem} 
          disabled={!selectedProduct}
          sx={{
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }}
        >
          הוסף לעגלה
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminAddItemDialog;
