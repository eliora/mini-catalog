import React from 'react';
import {
  Box,
  Button,
  Fab,
  useTheme,
  useMediaQuery,
  Slide,
  Zoom,
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ShoppingCart as CartIcon,
  ArrowUpward as ArrowUpIcon
} from '@mui/icons-material';

// Compact floating cart button for mobile (Bazaar Pro style)
const CompactCartFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  left: 20, // RTL positioning
  zIndex: 1000,
  width: 56,
  height: 56,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.35), 0 4px 16px rgba(25, 118, 210, 0.25)',
  border: `2px solid rgba(255, 255, 255, 0.3)`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
    pointerEvents: 'none',
  },
  
  '&:hover': {
    transform: 'translateY(-4px) scale(1.05)',
    boxShadow: '0 12px 48px rgba(25, 118, 210, 0.45), 0 6px 24px rgba(25, 118, 210, 0.35)',
    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
  },
  
  '&:active': {
    transform: 'translateY(-2px) scale(1.02)',
  },
  
  '& .MuiSvgIcon-root': {
    fontSize: 24,
    color: '#fff',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  },
}));

// Compact cart badge with animation
const AnimatedBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.75rem',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    border: `2px solid ${theme.palette.primary.main}`,
    boxShadow: '0 4px 12px rgba(220, 0, 78, 0.4)',
    animation: 'badgePulse 2s infinite ease-in-out',
    
    '@keyframes badgePulse': {
      '0%': { 
        transform: 'scale(1)',
        boxShadow: '0 4px 12px rgba(220, 0, 78, 0.4)',
      },
      '50%': { 
        transform: 'scale(1.1)',
        boxShadow: '0 6px 20px rgba(220, 0, 78, 0.6)',
      },
      '100%': { 
        transform: 'scale(1)',
        boxShadow: '0 4px 12px rgba(220, 0, 78, 0.4)',
      },
    },
  },
}));

// Desktop compact cart button
const DesktopCartButton = styled(Button)(({ theme }) => ({
  borderRadius: 28,
  padding: '12px 24px',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
  border: `1px solid rgba(255, 255, 255, 0.2)`,
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    transition: 'left 0.6s ease',
  },
  
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.4)',
    
    '&::before': {
      left: '100%',
    },
  },
  
  '&:active': {
    transform: 'translateY(0)',
  },
  
  '& .MuiButton-startIcon': {
    marginRight: 8,
    marginLeft: 0,
  },
}));

// Mini cart indicator for top navigation
const MiniCartIndicator = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 80,
  left: 20,
  zIndex: 999,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  borderRadius: 20,
  padding: '8px 16px',
  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
  border: `1px solid rgba(255, 255, 255, 0.2)`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.4)',
  },
}));

const CompactCartButton = ({ 
  cartCount = 0, 
  onClick, 
  onScrollToTop,
  variant = 'auto', // 'auto', 'fab', 'button', 'mini'
  showScrollToTop = true 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Auto-select variant based on screen size
  const activeVariant = variant === 'auto' 
    ? (isSmall ? 'fab' : isMobile ? 'mini' : 'button')
    : variant;

  // Mobile FAB variant
  if (activeVariant === 'fab' && cartCount > 0) {
    return (
      <Zoom in={cartCount > 0} timeout={300}>
        <CompactCartFab
          onClick={onClick}
          aria-label={`سلة التسوق - ${cartCount} عنصر`}
        >
          <AnimatedBadge 
            badgeContent={cartCount} 
            max={99}
            overlap="circular"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <CartIcon />
          </AnimatedBadge>
        </CompactCartFab>
      </Zoom>
    );
  }
  
  // Mini indicator variant
  if (activeVariant === 'mini' && cartCount > 0) {
    return (
      <Slide direction="right" in={cartCount > 0} timeout={300}>
        <MiniCartIndicator onClick={onClick}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            <AnimatedBadge 
              badgeContent={cartCount} 
              max={99}
              overlap="circular"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <CartIcon sx={{ fontSize: 20 }} />
            </AnimatedBadge>
            <span>سلة التسوق</span>
          </Box>
        </MiniCartIndicator>
      </Slide>
    );
  }
  
  // Desktop button variant
  if (activeVariant === 'button' && cartCount > 0) {
    return (
      <DesktopCartButton
        variant="contained"
        startIcon={
          <AnimatedBadge 
            badgeContent={cartCount} 
            max={99}
            overlap="circular"
          >
            <CartIcon />
          </AnimatedBadge>
        }
        onClick={onClick}
        sx={{ color: '#fff' }}
      >
        عرض السلة
      </DesktopCartButton>
    );
  }
  
  // Scroll to top button (when no cart items)
  if (showScrollToTop && cartCount === 0) {
    return (
      <Zoom in={true} timeout={300}>
        <CompactCartFab
          onClick={onScrollToTop || (() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.grey[600]} 0%, ${theme.palette.grey[800]} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.grey[500]} 0%, ${theme.palette.grey[700]} 100%)`,
            },
          }}
        >
          <ArrowUpIcon />
        </CompactCartFab>
      </Zoom>
    );
  }
  
  return null;
};

export default CompactCartButton;
