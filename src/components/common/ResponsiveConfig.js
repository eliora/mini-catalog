import { useTheme, useMediaQuery } from '@mui/material';

// Responsive configuration utility
export const useResponsiveConfig = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  return {
    isMobile,
    isSmall,
    
    // Size configurations
    size: isMobile ? 'small' : 'medium',
    cardSize: isSmall ? 'small' : 'medium',
    
    // Spacing configurations
    spacing: {
      card: isMobile ? 1 : 2,
      grid: isMobile ? 1 : 2,
      stack: isMobile ? 1 : 2,
      content: isSmall ? 1.5 : 2,
      actions: isSmall ? 1 : 2,
      fine: isMobile ? 0.2 : 0.3
    },
    
    // Dimension configurations  
    dimensions: {
      cardHeight: isSmall ? 200 : 240,
      minHeight: isMobile ? 56 : 48,
      accordionHeight: isMobile ? 80 : 96
    },
    
    // Typography configurations
    typography: {
      title: isSmall ? 'subtitle2' : 'h6',
      price: isSmall ? 'h6' : 'h5',
      body: 'body2',
      caption: 'caption'
    },
    
    // Variant configurations
    variants: {
      button: isMobile ? 'minimal' : 'contained',
      size: isMobile ? 'small' : 'medium'
    }
  };
};

export default useResponsiveConfig;
