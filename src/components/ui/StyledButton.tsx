/**
 * StyledButton Component - Enhanced MUI Button with TypeScript
 * 
 * Enhanced MUI Button with consistent styling across the application.
 * Replaces the complex BazaarButton system with a simpler, maintainable solution.
 * 
 * Features:
 * - Consistent 8px border radius
 * - Subtle hover animations (translateY + shadow)
 * - No text transformation (preserves natural casing)
 * - Full TypeScript support
 * - Standard MUI Button props support
 * 
 * Usage:
 *   <StyledButton variant="contained" color="primary">
 *     Save Changes
 *   </StyledButton>
 */

import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Enhanced Button with consistent styling across the app
const StyledButtonBase = styled(Button)<ButtonProps>(({ theme, variant }) => ({
  borderRadius: 8,
  textTransform: 'none', // Preserve natural text casing
  fontWeight: 600,
  minHeight: 44, // Consistent touch target size
  padding: '12px 24px',
  boxShadow: 'none', // Clean appearance, shadows only on hover
  transition: 'all 0.2s ease-in-out',
  
  // Subtle hover effects for better user feedback
  '&:hover': {
    transform: 'translateY(-1px)', // Slight lift effect
    boxShadow: variant === 'contained' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
  },
  
  // Focus styles for accessibility
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
  
  // Disabled state styling
  '&:disabled': {
    transform: 'none',
    boxShadow: 'none',
  },
}));

/**
 * Enhanced Button component with TypeScript support
 * Maintains full MUI Button API compatibility while adding consistent styling
 */
interface StyledButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const StyledButton: React.FC<StyledButtonProps> = ({ children, ...props }) => {
  return (
    <StyledButtonBase {...props}>
      {children}
    </StyledButtonBase>
  );
};

export default StyledButton;
