/**
 * EmptyCartView Component
 * 
 * Displays when the cart is empty with a call-to-action to return to catalog.
 * Reusable component that can be used anywhere empty cart state needs to be shown.
 */

'use client';

import React from 'react';
import { Box, Typography, Fade } from '@mui/material';
import { ShoppingCart as CartIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface EmptyCartViewProps {
  onBackToCatalog?: () => void;
}

const EmptyCartView: React.FC<EmptyCartViewProps> = ({ onBackToCatalog }) => {
  const router = useRouter();

  const handleBackToCatalog = () => {
    if (onBackToCatalog) {
      onBackToCatalog();
    } else {
      router.push('/catalog');
    }
  };

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
          <Box
            component="button"
            onClick={handleBackToCatalog}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              color: 'primary.contrastText',
              backgroundColor: 'primary.main',
              border: 'none',
              borderRadius: 1,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
          >
            חזור לקטלוג
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

export default React.memo(EmptyCartView);