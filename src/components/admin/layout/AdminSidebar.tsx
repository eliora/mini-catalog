/**
 * Admin Sidebar Component
 * 
 * Responsive navigation sidebar for admin dashboard.
 * Includes navigation items, user info, and mobile drawer support.
 */

'use client';

import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Avatar,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const DRAWER_WIDTH = 280;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/admin'
  },
  {
    id: 'clients',
    label: 'Client Management',
    icon: <PeopleIcon />,
    path: '/admin/client-management'
  },
  {
    id: 'products',
    label: 'Products Management',
    icon: <InventoryIcon />,
    path: '/admin/products-management'
  },
  {
    id: 'orders',
    label: 'Orders Management',
    icon: <OrdersIcon />,
    path: '/admin/orders-management',
    badge: '12'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <AnalyticsIcon />,
    path: '/admin/analytics'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '/admin/settings'
  }
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  open: controlledOpen,
  onClose
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const _isOpen = controlledOpen !== undefined ? controlledOpen : !isMobile; // eslint-disable-line @typescript-eslint/no-unused-vars

  const handleDrawerToggle = () => {
    if (onClose) {
      onClose();
    } else {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            Admin Panel
          </Typography>
          <Typography variant="caption" color="text.secondary">
            E-commerce Management
          </Typography>
        </Box>
        
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ p: 1 }}>
          {navigationItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <ListItem 
                key={item.id} 
                onClick={() => handleNavigation(item.path)}
                sx={{ 
                  mb: 0.5,
                  borderRadius: 2,
                  mx: 0.5,
                  cursor: 'pointer',
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '& .MuiListItemIcon-root': {
                    color: isActive ? 'primary.contrastText' : 'text.secondary'
                  }
                }}
              >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? 'primary.contrastText' : 'text.secondary'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isActive ? 600 : 500
                    }}
                  />
                  
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      color="error"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}
                    />
                  )}
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {user?.email || 'Admin User'}
            </Typography>
            
            <Chip
              label="Admin"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.65rem' }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box'
          }
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default AdminSidebar;
