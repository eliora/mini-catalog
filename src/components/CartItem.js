import React from 'react';
import {
  Card, CardContent, Typography, IconButton, Stack, Avatar, Chip, useTheme, useMediaQuery
} from '@mui/material';
import { Remove as RemoveIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: isSmall ? 2 : 3 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            sx={{
              width: isSmall ? 60 : 80,
              height: isSmall ? 60 : 80,
              bgcolor: 'primary.light',
              fontSize: isSmall ? '1rem' : '1.2rem'
            }}
          >
            {item.productName?.charAt(0)}
          </Avatar>

          <Stack spacing={1} sx={{ flex: 1, textAlign: 'right' }}>
            <Typography variant={isSmall ? "subtitle1" : "h6"} sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {item.productName}
            </Typography>

            {item.productName2 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {item.productName2}
              </Typography>
            )}

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Chip label={`#${item.ref}`} size="small" variant="outlined" />
              <Chip label={`$${item.unitPrice}`} size="small" color="primary" />
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => onUpdateQuantity(item.ref, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  sx={{ border: '1px solid', borderColor: 'divider', width: 32, height: 32 }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center', fontWeight: 600 }}>
                  {item.quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onUpdateQuantity(item.ref, item.quantity + 1)}
                  sx={{ border: '1px solid', borderColor: 'divider', width: 32, height: 32 }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
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
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default React.memo(CartItem);
