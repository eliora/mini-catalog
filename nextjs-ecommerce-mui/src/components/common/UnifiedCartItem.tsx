'use client';

/**
 * UnifiedCartItem Component
 * 
 * Unified cart item component combining the best of OrderCartItem and CartItem.
 * Optimized for performance and minimal code while maintaining full functionality.
 * 
 * Features:
 * - Compact design with responsive behavior
 * - Quantity editing with QuantityInput component
 * - Admin price editing when in admin mode
 * - Product information display (ref, name, size)
 * - Remove item functionality
 * - Two layout variants: 'compact' (order form) and 'detailed' (cart view)
 */

import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  TextField,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Delete as DeleteIcon
} from '@mui/icons-material';
import QuantityInput from './QuantityInput';
import { useAuth } from '@/context/AuthContext';
import { CartItem } from '@/types/cart';

interface UnifiedCartItemProps {
  item: CartItem;
  onUpdateQuantity: (ref: string, quantity: number) => void;
  onRemove: (ref: string) => void;
  onPriceChange?: (ref: string, price: string) => void;
  isAdmin?: boolean;
  editMode?: boolean;
  variant?: 'compact' | 'detailed';
}

const UnifiedCartItem: React.FC<UnifiedCartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onPriceChange,
  isAdmin = false,
  editMode = false,
  variant = 'compact'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  // Check if user can view prices (authenticated users)
  const canViewPrices = !!user;

  const handleQuantityChange = useCallback((value: string) => {
    const newQuantity = parseInt(value, 10) || 0;
    if (newQuantity <= 0) {
      onRemove(item.product_ref || item.ref || '');
    } else {
      onUpdateQuantity(item.product_ref || item.ref || '', newQuantity);
    }
  }, [item.product_ref, item.ref, onUpdateQuantity, onRemove]);

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onPriceChange && onPriceChange(item.product_ref || item.ref || '', e.target.value);
  }, [item.product_ref, item.ref, onPriceChange]);

  // Get item reference
  const itemRef = item.product_ref || item.ref || '';
  const itemName = item.productName || item.product_name || '';
  const itemName2 = item.productName2 || item.product_name_2 || '';
  const itemSize = item.size || '';
  const itemPrice = item.unit_price || item.unitPrice || 0;
  const itemQuantity = item.quantity || 0;

  // Compact variant (used in order form)
  if (variant === 'compact') {
    return (
      <Box
        sx={{
          p: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minHeight: 48 }}>
          {/* Product Ref */}
          <Box sx={{ minWidth: 80 }}>
            <Chip 
              label={itemRef}
              variant="outlined"
              size="small"
              color="primary"
              sx={{ 
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 24
              }}
            />
          </Box>

          {/* Product Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '0.875rem',
                lineHeight: 1.1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {itemName}
              {itemName2 && ` • ${itemName2}`}
            </Typography>
            {itemSize && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {itemSize}
              </Typography>
            )}
          </Box>

          {/* Unit Price */}
          <Box sx={{ minWidth: 60, textAlign: 'center', ml: 1 }}>
            {canViewPrices ? (
              editMode && isAdmin ? (
                <TextField
                  size="small"
                  type="number"
                  value={itemPrice}
                  onChange={handlePriceChange}
                  InputProps={{ 
                    inputProps: { min: 0, step: 0.01 },
                    sx: { fontSize: '0.8rem' }
                  }}
                  sx={{ 
                    width: 80,
                    '& .MuiOutlinedInput-root': { height: 32 }
                  }}
                />
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    fontSize: '0.8rem'
                  }}
                >
                  ₪{itemPrice.toFixed(2)}
                </Typography>
              )
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                התחבר לצפייה
              </Typography>
            )}
          </Box>

          {/* Quantity Controls */}
          <Box sx={{ minWidth: 100 }}>
            <QuantityInput
              value={itemQuantity}
              onChange={handleQuantityChange}
              size="small"
              min={0}
            />
          </Box>

          {/* Total Price */}
          <Box sx={{ minWidth: 70, textAlign: 'right' }}>
            {canViewPrices ? (
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 600,
                  color: 'primary.main',
                  fontSize: '0.9rem'
                }}
              >
                ₪{(itemPrice * itemQuantity).toFixed(2)}
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                התחבר לצפייה
              </Typography>
            )}
          </Box>

          {/* Remove Button */}
          <Box sx={{ minWidth: 32 }}>
            <IconButton
              onClick={() => onRemove(itemRef)}
              size="small"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Stack>
      </Box>
    );
  }

  // Detailed variant (used in cart view) - responsive layout
  return (
    <Box
      sx={{
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
        minHeight: isMobile ? 56 : 48,
        cursor: 'default',
        overflow: 'hidden',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 1,
        },
      }}
    >
      {isMobile ? (
        // Mobile layout
        <Box sx={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto auto',
            alignItems: 'center',
            gap: 1,
            mb: 0.5,
            overflow: 'hidden',
            minWidth: 0,
          }}>
            <Typography variant="caption" color="primary" sx={{ fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {itemRef}
            </Typography>
            <Typography variant="body2" sx={{
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.875rem',
              minWidth: 0,
            }}>
              {itemName}
            </Typography>

            <QuantityInput
              value={itemQuantity}
              onChange={handleQuantityChange}
              size="small"
              min={0}
            />

            <Box>
              {canViewPrices ? (
                isAdmin ? (
                  <TextField
                    size="small"
                    type="number"
                    value={itemPrice}
                    onChange={handlePriceChange}
                    sx={{
                      width: 80,
                      '& .MuiOutlinedInput-root': { height: 24 },
                      '& input': { textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, p: 0.5 }
                    }}
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  />
                ) : (
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                    ₪{(itemPrice * itemQuantity).toFixed(2)}
                  </Typography>
                )
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  התחבר לצפייה
                </Typography>
              )}
            </Box>
          </Box>

          {/* Total and Delete button row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            {isAdmin && canViewPrices && (
              <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                סה"כ: ₪{(itemPrice * itemQuantity).toFixed(2)}
              </Typography>
            )}
            <IconButton
              color="error"
              size="small"
              onClick={() => onRemove(itemRef)}
              sx={{ '&:hover': { backgroundColor: 'error.main', color: 'error.contrastText' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ) : (
        // Desktop layout
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: isAdmin ? 'auto auto 1fr auto auto auto auto auto' : 'auto auto 1fr auto auto auto auto',
          alignItems: 'center',
          gap: 2,
          overflow: 'hidden',
          minWidth: 0,
        }}>
          <Typography variant="caption" color="primary" sx={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            #{itemRef}
          </Typography>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              backgroundColor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'primary.main'
            }}
          >
            {itemName?.charAt(0)}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: itemSize ? 0.25 : 0,
              }}
            >
              {itemName}
              {itemName2 && ` • ${itemName2}`}
            </Typography>
            {itemSize && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ 
                  fontWeight: 500, 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '0.75rem'
                }}
              >
                {itemSize.replace(/\s*(jar|tube|dispenser|bottle|tub|pump|cream|lotion|serum|gel|mask|cleanser|toner|moisturizer|oil|balm|scrub|peeling|foam|mousse|spray|mist)\s*/gi, '').trim()}
              </Typography>
            )}
          </Box>
          
          <QuantityInput
            value={itemQuantity}
            onChange={handleQuantityChange}
            size="medium"
            min={0}
          />

          <Box sx={{ textAlign: 'center' }}>
            {canViewPrices ? (
              isAdmin ? (
                <TextField
                  size="small"
                  type="number"
                  value={itemPrice}
                  onChange={handlePriceChange}
                  sx={{
                    width: 80,
                    '& .MuiOutlinedInput-root': { height: 32 },
                    '& input': { textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }
                  }}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              ) : (
                <Typography
                  variant="subtitle2"
                  color="primary"
                  sx={{ fontWeight: 700 }}
                >
                  ₪{itemPrice.toFixed(2)}
                </Typography>
              )
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                התחבר לצפייה
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem', mt: 0.5 }}>
              {isAdmin ? 'מחיר יחידה' : 'יחידה'}
            </Typography>
          </Box>
          {canViewPrices ? (
            <Typography
              variant="subtitle2"
              color="primary"
              sx={{ fontWeight: 700, textAlign: 'center', minWidth: 50, ml: 1 }}
            >
              ₪{(itemPrice * itemQuantity).toFixed(2)}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', textAlign: 'center', minWidth: 50, ml: 1 }}>
              התחבר לצפייה
            </Typography>
          )}
          <IconButton
            color="error"
            size="small"
            onClick={() => onRemove(itemRef)}
            sx={{ '&:hover': { backgroundColor: 'error.main', color: 'error.contrastText' } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(UnifiedCartItem);

