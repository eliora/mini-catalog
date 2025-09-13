import React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Enhanced Button with consistent styling
const StyledButton = styled(Button)(({ theme, variant, color }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  minHeight: 44,
  padding: '12px 24px',
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out',
  
  // Hover effects
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: variant === 'contained' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
  },
}));

// Simple wrapper component
const EnhancedButton = ({ children, ...props }) => {
  return (
    <StyledButton {...props}>
      {children}
    </StyledButton>
  );
};

export default EnhancedButton;
