import React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Enhanced Button Styles based on Bazaar Pro
const StyledButton = styled(Button)(({ theme, variant, color }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  minHeight: 44,
  padding: '12px 24px',
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out',
  
  // Primary Button Style
  ...(variant === 'contained' && color === 'primary' && {
    backgroundColor: '#4E97FD',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#3975D9',
      boxShadow: '0 4px 12px rgba(78, 151, 253, 0.25)',
      transform: 'translateY(-1px)',
    },
  }),
  
  // Secondary Button Style
  ...(variant === 'contained' && color === 'secondary' && {
    backgroundColor: '#4B566B',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#373F50',
      boxShadow: '0 4px 12px rgba(75, 86, 107, 0.25)',
      transform: 'translateY(-1px)',
    },
  }),
  
  // Info Button Style
  ...(variant === 'contained' && color === 'info' && {
    backgroundColor: '#4E97FD',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#3975D9',
      boxShadow: '0 4px 12px rgba(78, 151, 253, 0.25)',
      transform: 'translateY(-1px)',
    },
  }),
  
  // Outlined Button Style
  ...(variant === 'outlined' && {
    borderWidth: 1,
    borderColor: '#E3E9EF',
    color: '#2B3445',
    backgroundColor: 'transparent',
    '&:hover': {
      borderColor: '#4E97FD',
      color: '#4E97FD',
      backgroundColor: '#F6F9FC',
      transform: 'translateY(-1px)',
    },
  }),
  
  // Text Button Style
  ...(variant === 'text' && {
    color: '#7D879C',
    '&:hover': {
      color: '#4E97FD',
      backgroundColor: '#F6F9FC',
    },
  }),
}));

// Light Button variant (Bazaar Pro style)
const WhiteButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  minHeight: 40,
  padding: '10px 20px',
  color: '#2B3445',
  backgroundColor: '#fff',
  border: '1px solid #E3E9EF',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    color: '#fff',
    backgroundColor: '#4E97FD',
    borderColor: '#4E97FD',
    boxShadow: '0 4px 16px rgba(78, 151, 253, 0.25)',
    transform: 'translateY(-2px)',
  },
}));

// Icon Button with light styling
const StyledIconButton = styled(Button)(({ theme, color = 'primary' }) => ({
  minWidth: 40,
  width: 40,
  height: 40,
  borderRadius: 8,
  padding: 8,
  color: '#7D879C',
  backgroundColor: 'transparent',
  border: '1px solid #E3E9EF',
  transition: 'all 0.2s ease-in-out',
  
  '& .MuiSvgIcon-root': {
    fontSize: 18,
  },
  
  '&:hover': {
    color: '#4E97FD',
    backgroundColor: '#F6F9FC',
    borderColor: '#4E97FD',
    transform: 'translateY(-1px)',
  },
}));

// Status Button for different states
const StatusButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'status',
})(({ theme, status }) => {
  let backgroundColor, color, hoverColor;
  
  switch (status) {
    case 'success':
    case 'delivered':
    case 'completed':
      backgroundColor = theme.palette.success[100];
      color = theme.palette.success.main;
      hoverColor = theme.palette.success.dark;
      break;
    case 'warning':
    case 'pending':
    case 'processing':
      backgroundColor = theme.palette.warning[100];
      color = theme.palette.warning.main;
      hoverColor = theme.palette.warning.dark;
      break;
    case 'error':
    case 'cancelled':
    case 'rejected':
      backgroundColor = theme.palette.error[100];
      color = theme.palette.error.main;
      hoverColor = theme.palette.error.dark;
      break;
    case 'info':
    case 'draft':
      backgroundColor = theme.palette.info[100];
      color = theme.palette.info.main;
      hoverColor = theme.palette.info.dark;
      break;
    default:
      backgroundColor = theme.palette.grey[100];
      color = theme.palette.grey[700];
      hoverColor = theme.palette.grey[800];
  }
  
  return {
    borderRadius: 16,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: 12,
    minHeight: 28,
    padding: '4px 12px',
    backgroundColor,
    color,
    border: 'none',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: color + '20',
      color: hoverColor,
    },
  };
});

// Main BazaarButton component
const BazaarButton = ({ 
  children, 
  variant = 'contained', 
  color = 'primary',
  white = false,
  icon = false,
  status = null,
  ...props 
}) => {
  if (white) {
    return <WhiteButton {...props}>{children}</WhiteButton>;
  }
  
  if (icon) {
    return <StyledIconButton color={color} {...props}>{children}</StyledIconButton>;
  }
  
  if (status) {
    return <StatusButton status={status} {...props}>{children}</StatusButton>;
  }
  
  return (
    <StyledButton variant={variant} color={color} {...props}>
      {children}
    </StyledButton>
  );
};

// Export individual components for flexibility
export default BazaarButton;
export { WhiteButton, StyledIconButton, StatusButton };
