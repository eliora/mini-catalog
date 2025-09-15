/**
 * StyledButton Component
 * 
 * Enhanced MUI Button with consistent styling across the application.
 * Replaces the complex BazaarButton system with a simpler, maintainable solution.
 * 
 * Features:
 * - Consistent 8px border radius
 * - Subtle hover animations (translateY + shadow)
 * - No text transformation (preserves natural casing)
 * - Standard MUI Button props support
 * 
 * Usage:
 *   <StyledButton variant="contained" color="primary">
 *     Save Changes
 *   </StyledButton>
 * 
 * @param {ReactNode} children - Button content
 * @param {string} variant - MUI button variant (contained, outlined, text)
 * @param {string} color - MUI color palette (primary, secondary, etc.)
 * @param {...any} props - All other MUI Button props
 */

import React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Enhanced Button with consistent styling across the app
const StyledButton = styled(Button)(({ theme, variant, color }) => ({
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
}));

/**
 * Simple wrapper component that applies our styled button
 * while maintaining full MUI Button API compatibility
 */
const EnhancedButton = ({ children, ...props }) => {
  return (
    <StyledButton {...props}>
      {children}
    </StyledButton>
  );
};

export default EnhancedButton;
