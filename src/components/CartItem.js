import React from 'react';
import {
  Box, Typography, IconButton, Stack, useTheme, useMediaQuery, TextField
} from '@mui/material';
import { Remove as RemoveIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const CartItem = ({ item, onUpdateQuantity, onRemove, onUpdatePrice, isAdmin = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const renderMobileView = () => (
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
          {item.ref}
        </Typography>
        <Typography variant="body2" sx={{
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '0.875rem',
  
          minWidth: 0,
        }}>
          {item.productName}
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0}
          sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
        >
          <IconButton
            size="small"
            onClick={() => onUpdateQuantity(item.ref, item.quantity - 1)}
            disabled={item.quantity <= 1}
            sx={{ width: 24, height: 24, borderRadius: '4px 0 0 4px' }}
          >
            <RemoveIcon sx={{ fontSize: '0.75rem' }} />
          </IconButton>
          <TextField
            type="number"
            size="small"
            value={item.quantity}
            onChange={(e) => {
              const value = e.target.value;
              const numValue = value === '' ? 0 : parseInt(value, 10);
              if (!isNaN(numValue) && numValue >= 0 && numValue <= 99) {
                onUpdateQuantity(item.ref, numValue);
              }
            }}
            sx={{
              width: 44,
              '& .MuiOutlinedInput-root': { 
                height: 24,
                '& fieldset': {
                  border: 'none'
                }
              },
              '& input': { 
                textAlign: 'center', 
                fontSize: '0.7rem', 
                fontWeight: 600,
                p: 0,
                MozAppearance: 'textfield',
                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none',
                  margin: 0,
                },
              }
            }}
            inputProps={{ min: 0, max: 99, step: 1, inputMode: 'numeric', pattern: '[0-9]*' }}
          />
          <IconButton
            size="small"
            onClick={() => onUpdateQuantity(item.ref, item.quantity + 1)}
            sx={{ width: 24, height: 24, borderRadius: '0 4px 4px 0' }}
          >
            <AddIcon sx={{ fontSize: '0.75rem' }} />
          </IconButton>
        </Stack>
        <Box>
          {isAdmin ? (
            <TextField
              size="small"
              type="number"
              value={item.unitPrice}
              onChange={(e) => onUpdatePrice && onUpdatePrice(item.ref, e.target.value)}
              sx={{
                width: 80,
                '& .MuiOutlinedInput-root': { height: 24 },
                '& input': { textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, p: 0.5 }
              }}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          ) : (
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
              ${(item.unitPrice * item.quantity).toFixed(2)}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Total and Delete button row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        {isAdmin && (
          <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
            סה"כ: ${(item.unitPrice * item.quantity).toFixed(2)}
          </Typography>
        )}
        <IconButton
          color="error"
          size="small"
          onClick={() => onRemove(item.ref)}
          sx={{ '&:hover': { backgroundColor: 'error.main', color: 'error.contrastText' } }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  const renderDesktopView = () => (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: isAdmin ? 'auto auto 1fr auto auto auto auto auto' : 'auto auto 1fr auto auto auto auto',
      alignItems: 'center',
      gap: 2,
      overflow: 'hidden',
      minWidth: 0,


    }}>
      <Typography variant="caption" color="primary" sx={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
        #{item.ref}
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
        {item.productName?.charAt(0)}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.25,
          }}
        >
          {item.productName}
          {item.productName2 && ` • ${item.productName2}`}
        </Typography>

      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 500, whiteSpace: 'nowrap', mx: 1 }}
      >
        {item.size ? item.size.replace(/\s*(jar|tube|dispenser|bottle|tub|pump|cream|lotion|serum|gel|mask|cleanser|toner|moisturizer|oil|balm|scrub|peeling|foam|mousse|spray|mist)\s*/gi, '').trim() : ''}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={0}
        sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <IconButton size="small" onClick={() => onUpdateQuantity(item.ref, item.quantity - 1)} disabled={item.quantity <= 1}
          sx={{ width: 28, height: 28, borderRadius: '4px 0 0 4px' }}>
          <RemoveIcon fontSize="small" />
        </IconButton>
        <TextField
          type="number"
          size="small"
          value={item.quantity}
          onChange={(e) => {
            const value = e.target.value;
            const numValue = value === '' ? 0 : parseInt(value, 10);
            if (!isNaN(numValue) && numValue >= 0 && numValue <= 99) {
              onUpdateQuantity(item.ref, numValue);
            }
          }}
          sx={{ 
            width: 54, 
            '& .MuiOutlinedInput-root': { 
              height: 28,
              '& fieldset': {
                border: 'none'
              }
            }, 
            '& input': { 
              textAlign: 'center', 
              fontSize: '0.75rem', 
              fontWeight: 600,
              p: 0,
              MozAppearance: 'textfield',
              '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
            } 
          }}
          inputProps={{ min: 0, max: 99, step: 1, inputMode: 'numeric', pattern: '[0-9]*' }}
        />
        <IconButton size="small" onClick={() => onUpdateQuantity(item.ref, item.quantity + 1)} sx={{ width: 28, height: 28, borderRadius: '0 4px 4px 0' }}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Box sx={{ textAlign: 'center' }}>
        {isAdmin ? (
          <TextField
            size="small"
            type="number"
            value={item.unitPrice}
            onChange={(e) => onUpdatePrice && onUpdatePrice(item.ref, e.target.value)}
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
            ${item.unitPrice.toFixed(2)}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem', mt: 0.5 }}>
          {isAdmin ? 'מחיר יחידה' : 'יחידה'}
        </Typography>
      </Box>
      <Typography
        variant="subtitle2"
        color="primary"
        sx={{ fontWeight: 700, textAlign: 'center', minWidth: 50, ml: 1 }}
      >
        ${(item.unitPrice * item.quantity).toFixed(2)}
      </Typography>
      <IconButton
        color="error"
        size="small"
        onClick={() => onRemove(item.ref)}
        sx={{ '&:hover': { backgroundColor: 'error.main', color: 'error.contrastText' } }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );

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
      {isMobile ? renderMobileView() : renderDesktopView()}
    </Box>
  );
};

export default React.memo(CartItem);
