/**
 * CartItemsTable Component
 * 
 * Displays cart items in a table format with header and admin controls.
 * Handles the layout and rendering of cart items with quantity controls.
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import UnifiedCartItem from '../common/UnifiedCartItem';
import InlineAddItemRow from './InlineAddItemRow';
import { CartItem } from '../../types/cart';

// Legacy cart item interface for backward compatibility
interface LegacyCartItem {
  ref: string;
  productName: string;
  productName2?: string;
  size?: string;
  unitPrice: number;
  quantity: number;
}

interface CartItemsTableProps {
  cart: CartItem[];
  updateQuantity: (ref: string, quantity: number) => void;
  removeFromCart: (ref: string) => void;
  onPriceChange?: (itemRef: string, newPrice: number) => void;
  isAdmin: boolean;
  editMode: boolean;
  onToggleEditMode: () => void;
  onAddCustomItem: (customItem: LegacyCartItem) => void;
}

const CartItemsTable: React.FC<CartItemsTableProps> = ({
  cart,
  updateQuantity,
  removeFromCart,
  onPriceChange,
  isAdmin,
  editMode,
  onToggleEditMode,
  onAddCustomItem
}) => {
  const [showAddRow, setShowAddRow] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        פריטים בעגלה
      </Typography>
      
      {/* Table Header */}
      <Box
        sx={{
          p: 1,
          bgcolor: 'grey.50',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '4px 4px 0 0',
          mb: 0
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minHeight: 48 }}>
          {/* Product Ref - Match UnifiedCartItem */}
          <Box sx={{ minWidth: isMobile ? 20 : 80 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              מק&quot;ט
            </Typography>
          </Box>

          {/* Product Info - Match UnifiedCartItem */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              מוצר
            </Typography>
          </Box>

          {/* Unit Price - Hidden on Mobile, Clickable for Admin on Desktop */}
          {!isMobile && (
            <Box sx={{ minWidth: 60, textAlign: 'center' }}>
              {isAdmin ? (
                <Box
                  onClick={onToggleEditMode}
                  sx={{
                    cursor: 'pointer',
                    p: 0.5,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    '&:hover': {
                      bgcolor: 'primary.50'
                    }
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, color: editMode ? 'primary.main' : 'text.secondary' }}>
                    מחיר יחידה
                  </Typography>
                  {editMode ? <SaveIcon sx={{ fontSize: 12 }} /> : <EditIcon sx={{ fontSize: 12 }} />}
                </Box>
              ) : (
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  מחיר יחידה
                </Typography>
              )}
            </Box>
          )}

          {/* Quantity Controls - Match UnifiedCartItem */}
          <Box sx={{ minWidth: 100, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              כמות
            </Typography>
          </Box>

          {/* Total Price - Hidden on Mobile */}
          {!isMobile && (
            <Box sx={{ minWidth: 70, textAlign: 'right' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                סה&quot;כ
              </Typography>
            </Box>
          )}

          {/* Remove Button - Match UnifiedCartItem */}
          <Box sx={{ minWidth: 32, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              מחק
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Items List */}
      <Stack spacing={0}>
        {cart.map((item, index) => (
          <Box
            key={item.product_id || item.ref || index}
            sx={{
              '& > div': {
                borderRadius: 0,
                borderTop: index === 0 ? 'none' : '1px solid',
                borderTopColor: 'divider'
              },
              '&:last-child > div': {
                borderRadius: '0 0 4px 4px'
              }
            }}
          >
            <UnifiedCartItem
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              onPriceChange={onPriceChange}
              isAdmin={isAdmin}
              editMode={editMode}
              variant="compact"
            />
          </Box>
        ))}
        
        {/* Inline Add Item Row */}
        {isAdmin && (
          <InlineAddItemRow
            isVisible={showAddRow}
            onAddItem={(customItem) => {
              onAddCustomItem(customItem);
              setShowAddRow(false);
            }}
          />
        )}

        {/* Add Item Button at Bottom */}
        {isAdmin && !showAddRow && (
          <Box
            sx={{
              p: 1,
              border: '1px dashed',
              borderColor: 'primary.main',
              borderRadius: '0 0 4px 4px',
              bgcolor: 'primary.50',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <IconButton
              onClick={() => setShowAddRow(true)}
              color="primary"
              size="small"
              sx={{
                '&:hover': {
                  bgcolor: 'primary.100'
                }
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        )}
      </Stack>
    </>
  );
};

export default React.memo(CartItemsTable);
