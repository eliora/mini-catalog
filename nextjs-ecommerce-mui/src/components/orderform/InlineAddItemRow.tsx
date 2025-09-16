/**
 * InlineAddItemRow Component
 * 
 * Inline form row for adding custom items directly in the cart table.
 * Allows admin to add items with custom name, price, and quantity without popup.
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Stack,
  TextField,
  IconButton,
  Chip
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
// Legacy cart item interface for backward compatibility
interface LegacyCartItem {
  ref: string;
  productName: string;
  productName2?: string;
  size?: string;
  unitPrice: number;
  quantity: number;
}

interface InlineAddItemRowProps {
  onAddItem: (item: LegacyCartItem) => void;
  isVisible: boolean;
}

interface ItemData {
  ref: string;
  productName: string;
  unitPrice: string;
  quantity: number;
}

const InlineAddItemRow: React.FC<InlineAddItemRowProps> = ({ onAddItem, isVisible }) => {
  const [itemData, setItemData] = useState<ItemData>({
    ref: '',
    productName: '',
    unitPrice: '',
    quantity: 1
  });

  const handleAddItem = () => {
    if (!itemData.productName.trim()) return;

    const customItem: LegacyCartItem = {
      ref: itemData.ref.trim() || `CUSTOM-${Date.now()}`,
      productName: itemData.productName.trim(),
      productName2: '',
      size: '',
      unitPrice: Number(itemData.unitPrice) || 0,
      quantity: Number(itemData.quantity) || 1
    };

    onAddItem(customItem);
    
    // Reset form
    setItemData({
      ref: '',
      productName: '',
      unitPrice: '',
      quantity: 1
    });
  };

  const handleCancel = () => {
    setItemData({
      ref: '',
      productName: '',
      unitPrice: '',
      quantity: 1
    });
  };

  if (!isVisible) return null;

  return (
    <Box
      sx={{
        p: 1,
        border: '1px solid',
        borderColor: 'primary.main',
        borderRadius: '0 0 4px 4px',
        bgcolor: 'primary.50',
        borderTop: '2px dashed',
        borderTopColor: 'primary.main'
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ minHeight: 48 }}>
        {/* Product Ref */}
        <Box sx={{ minWidth: 80 }}>
          <TextField
            size="small"
            placeholder="מק״ט"
            value={itemData.ref}
            onChange={(e) => setItemData(prev => ({ ...prev, ref: e.target.value }))}
            sx={{ 
              width: '100%',
              '& .MuiOutlinedInput-root': { height: 32 }
            }}
          />
        </Box>

        {/* Product Name */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TextField
            size="small"
            placeholder="שם המוצר *"
            value={itemData.productName}
            onChange={(e) => setItemData(prev => ({ ...prev, productName: e.target.value }))}
            required
            sx={{ 
              width: '100%',
              '& .MuiOutlinedInput-root': { height: 32 }
            }}
          />
        </Box>

        {/* Unit Price */}
        <Box sx={{ minWidth: 60, textAlign: 'center', ml: 1 }}>
          <TextField
            size="small"
            type="number"
            placeholder="מחיר"
            value={itemData.unitPrice}
            onChange={(e) => setItemData(prev => ({ ...prev, unitPrice: e.target.value }))}
            InputProps={{ 
              inputProps: { min: 0, step: 0.01 },
              sx: { fontSize: '0.8rem' }
            }}
            sx={{ 
              width: 80,
              '& .MuiOutlinedInput-root': { height: 32 }
            }}
          />
        </Box>

        {/* Quantity */}
        <Box sx={{ minWidth: 100 }}>
          <TextField
            size="small"
            type="number"
            value={itemData.quantity}
            onChange={(e) => setItemData(prev => ({ ...prev, quantity: Number(e.target.value) || 1 }))}
            InputProps={{ 
              inputProps: { min: 1, max: 99 },
              sx: { fontSize: '0.8rem' }
            }}
            sx={{ 
              width: '100%',
              '& .MuiOutlinedInput-root': { height: 32 }
            }}
          />
        </Box>

        {/* Total Price Preview */}
        <Box sx={{ minWidth: 70, textAlign: 'right' }}>
          <Chip 
            label={`₪${((Number(itemData.unitPrice) || 0) * (Number(itemData.quantity) || 1)).toFixed(2)}`}
            variant="outlined"
            size="small"
            sx={{ 
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ minWidth: 64 }}>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              onClick={handleAddItem}
              size="small"
              color="success"
              disabled={!itemData.productName.trim()}
              title="הוסף פריט"
            >
              <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleCancel}
              size="small"
              color="error"
              title="ביטול"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default React.memo(InlineAddItemRow);