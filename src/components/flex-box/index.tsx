/**
 * Flex Box Components
 * 
 * Utility flex components based on Bazaar Pro template
 */

import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface FlexBoxProps extends BoxProps {
  children: React.ReactNode;
}

export const FlexBox: React.FC<FlexBoxProps> = ({ children, ...props }) => (
  <Box display="flex" {...props}>
    {children}
  </Box>
);

export const FlexBetween: React.FC<FlexBoxProps> = ({ children, ...props }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" {...props}>
    {children}
  </Box>
);

export const FlexCenter: React.FC<FlexBoxProps> = ({ children, ...props }) => (
  <Box display="flex" justifyContent="center" alignItems="center" {...props}>
    {children}
  </Box>
);
