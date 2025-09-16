/**
 * Typography Components
 * 
 * Custom typography components based on Bazaar Pro template
 */

import React from 'react';
import { Typography, TypographyProps } from '@mui/material';

interface CustomTypographyProps extends Omit<TypographyProps, 'variant'> {
  children: React.ReactNode;
}

export const H1: React.FC<CustomTypographyProps> = ({ children, ...props }) => (
  <Typography variant="h1" {...props}>
    {children}
  </Typography>
);

export const H2: React.FC<CustomTypographyProps> = ({ children, ...props }) => (
  <Typography variant="h2" {...props}>
    {children}
  </Typography>
);

export const H3: React.FC<CustomTypographyProps> = ({ children, ...props }) => (
  <Typography variant="h3" {...props}>
    {children}
  </Typography>
);

export const H4: React.FC<CustomTypographyProps> = ({ children, ...props }) => (
  <Typography variant="h4" {...props}>
    {children}
  </Typography>
);

export const H5: React.FC<CustomTypographyProps> = ({ children, ...props }) => (
  <Typography variant="h5" {...props}>
    {children}
  </Typography>
);

export const H6: React.FC<CustomTypographyProps> = ({ children, ...props }) => (
  <Typography variant="h6" {...props}>
    {children}
  </Typography>
);

export const Paragraph: React.FC<CustomTypographyProps> = ({ children, ...props }) => (
  <Typography variant="body1" {...props}>
    {children}
  </Typography>
);
