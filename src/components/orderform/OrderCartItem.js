import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  IconButton
} from '@mui/material';
import {
  Delete as DeleteIcon
} from '@mui/icons-material';
import QuantityInput from '../common/QuantityInput';

/**
 * Simplified cart item component for order form
 * Similar to accordion header but without images and with minimal description
 */
const OrderCartItem = ({
  item,
  onUpdateQuantity,
  onRemove,
  onUpdatePrice,
  isAdmin = false
}) => {
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      onRemove(item.ref);
    } else {
      onUpdateQuantity(item.ref, newQuantity);
    }
  };

  return (
    <Box
      sx={{
        p: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ minHeight: 48 }}>
        {/* Product Ref - Compact */}
        <Box sx={{ minWidth: 80 }}>
          <Chip 
            label={item.ref}
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

        {/* Product Info - Compact single line */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '0.875rem',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {item.productName}
            {item.productName2 && ` | ${item.productName2}`}
            {item.size && ` | ${item.size}`}
          </Typography>
        </Box>

        {/* Unit Price - Compact */}
        <Box sx={{ minWidth: 60, textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              fontSize: '0.8rem'
            }}
          >
            ₪{item.unitPrice.toFixed(2)}
          </Typography>
        </Box>

        {/* Quantity Controls - Compact */}
        <Box sx={{ minWidth: 100 }}>
          <QuantityInput
            value={item.quantity}
            onChange={handleQuantityChange}
            size="small"
            min={0}
          />
        </Box>

        {/* Total Price - Compact */}
        <Box sx={{ minWidth: 70, textAlign: 'right' }}>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 600,
              color: 'primary.main',
              fontSize: '0.9rem'
            }}
          >
            ₪{(item.unitPrice * item.quantity).toFixed(2)}
          </Typography>
        </Box>

        {/* Remove Button - Compact */}
        <Box sx={{ minWidth: 32 }}>
          <IconButton
            onClick={() => onRemove(item.ref)}
            size="small"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Stack>
    </Box>
  );
};

export default React.memo(OrderCartItem);
