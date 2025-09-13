/**
 * EmptyCartView Component
 * 
 * Displays when the cart is empty with a call-to-action to return to catalog.
 * Reusable component that can be used anywhere empty cart state needs to be shown.
 */

import React from 'react';
import { Box, Typography, Fade } from '@mui/material';
import { ShoppingCart as CartIcon } from '@mui/icons-material';
import StyledButton from '../ui/StyledButton';

const EmptyCartView = ({ onBackToCatalog }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      p: 4
    }}>
      <Fade in timeout={600}>
        <Box>
          <CartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
            העגלה ריקה
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            לא נמצאו מוצרים בעגלת הקניות
          </Typography>
          <StyledButton
            onClick={onBackToCatalog || (() => window.history.back())}
            sx={{ px: 4, py: 1.5 }}
          >
            חזור לקטלוג
          </StyledButton>
        </Box>
      </Fade>
    </Box>
  );
};

export default React.memo(EmptyCartView);
