import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Typography,
  Box,
  Divider,
  IconButton,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Light Bazaar Pro Card Styles
const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => !['hoverEffect', 'bordered'].includes(prop),
})(({ theme, hoverEffect, bordered }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  border: bordered ? '1px solid #E3E9EF' : 'none',
  overflow: 'hidden',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  background: '#FFFFFF',
  
  ...(hoverEffect && {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      borderColor: '#4E97FD',
      '& .card-image': {
        transform: 'scale(1.02)',
      },
    },
  }),
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  padding: '16px 20px 0',
  '& .MuiCardHeader-title': {
    fontSize: 16,
    fontWeight: 600,
    color: '#2B3445',
  },
  '& .MuiCardHeader-subheader': {
    fontSize: 13,
    color: '#7D879C',
    marginTop: 4,
  },
}));

const StyledCardContent = styled(CardContent)({
  padding: '16px 24px',
  '&:last-child': {
    paddingBottom: 24,
  },
});

const StyledCardActions = styled(CardActions)(({ theme }) => ({
  padding: '0 24px 20px',
  gap: theme.spacing(1),
  '&.center': {
    justifyContent: 'center',
  },
  '&.space-between': {
    justifyContent: 'space-between',
  },
}));

// Light Stats Card Component
const StatsCard = styled(Card)(({ theme, color = 'primary' }) => {
  return {
    borderRadius: 12,
    padding: '20px 16px',
    background: '#FFFFFF',
    border: '1px solid #E3E9EF',
    position: 'relative',
    overflow: 'hidden',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      backgroundColor: '#4E97FD',
    },
    
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(78, 151, 253, 0.15)',
      borderColor: '#4E97FD',
    },
  };
});

const StatsNumber = styled(Typography)(({ theme }) => ({
  fontSize: 28,
  fontWeight: 700,
  lineHeight: 1,
  marginBottom: 6,
  color: '#2B3445',
}));

const StatsLabel = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  fontWeight: 500,
  color: '#7D879C',
  letterSpacing: '0.3px',
}));

const StatsIcon = styled(Box)(({ theme, color = 'primary' }) => {
  return {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F6F9FC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4E97FD',
    
    '& .MuiSvgIcon-root': {
      fontSize: 20,
    },
  };
});

// Dashboard Card Component
const DashboardCard = ({ 
  title, 
  subtitle, 
  value, 
  icon, 
  color = 'primary',
  trend,
  onClick,
  ...props 
}) => {
  return (
    <StatsCard color={color} onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }} {...props}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <StatsNumber color={color}>{value}</StatsNumber>
        <StatsLabel>{title}</StatsLabel>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
        {trend && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trend}
          </Box>
        )}
      </Box>
      {icon && <StatsIcon color={color}>{icon}</StatsIcon>}
    </StatsCard>
  );
};

// Light Product Card Component
const ProductCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  transition: 'all 0.2s ease',
  border: '1px solid #E3E9EF',
  background: '#FFFFFF',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    borderColor: '#4E97FD',
  },
}));

const ProductImage = styled(Box)({
  position: 'relative',
  paddingTop: '75%', // 4:3 aspect ratio
  overflow: 'hidden',
  
  '& img': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
});

const ProductBadge = styled(Box)(({ theme, color = 'primary' }) => ({
  position: 'absolute',
  top: 10,
  left: 10,
  padding: '3px 8px',
  borderRadius: 6,
  backgroundColor: '#4E97FD',
  color: '#fff',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.3px',
  zIndex: 2,
}));

// Light Order Card Component
const OrderCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: '1px solid #E3E9EF',
  transition: 'all 0.2s ease',
  background: '#FFFFFF',
  
  '&:hover': {
    borderColor: '#4E97FD',
    boxShadow: '0 2px 12px rgba(78, 151, 253, 0.12)',
  },
}));

const OrderHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 16px',
  borderBottom: '1px solid #F3F5F9',
}));

const OrderNumber = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 600,
  color: '#2B3445',
}));

const OrderDate = styled(Typography)(({ theme }) => ({
  fontSize: 11,
  color: '#7D879C',
}));

const OrderAmount = styled(Typography)(({ theme }) => ({
  fontSize: 16,
  fontWeight: 600,
  color: '#4E97FD',
}));

// Main BazaarCard component
const BazaarCard = ({
  children,
  title,
  subtitle,
  action,
  hoverEffect = false,
  bordered = false,
  ...props
}) => {
  return (
    <StyledCard hoverEffect={hoverEffect} bordered={bordered} {...props}>
      {title && (
        <StyledCardHeader
          title={title}
          subheader={subtitle}
          action={action}
        />
      )}
      
      {children && (
        <StyledCardContent>
          {children}
        </StyledCardContent>
      )}
    </StyledCard>
  );
};

// Export all components
export default BazaarCard;
export {
  DashboardCard,
  ProductCard,
  OrderCard,
  StatsCard,
  ProductImage,
  ProductBadge,
  OrderHeader,
  OrderNumber,
  OrderDate,
  OrderAmount,
  StyledCardActions
};
