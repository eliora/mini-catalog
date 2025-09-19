/**
 * AdminLayout Component - Modern admin dashboard layout
 * 
 * Hybrid approach with:
 * - Desktop: Fixed sidebar + top bar + full-width content
 * - Mobile: Collapsible sidebar + top bar + responsive content
 * 
 * Features:
 * - Full-width content area (no max-width constraints)
 * - Responsive sidebar (280px desktop, overlay mobile)
 * - Enhanced top bar with search, notifications, user menu
 * - Better breakpoint strategy for admin interfaces
 * - Mobile-first responsive design
 * - TypeScript support
 */

'use client';

import React, { useState, useCallback } from 'react';
import { 
  Box, 
  useTheme, 
  useMediaQuery, 
  Drawer, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Constants
const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 64;

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title = 'לוח בקרה' 
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  // State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'לוח בקרה', icon: DashboardIcon, path: '/admin' },
    { id: 'products', label: 'ניהול מוצרים', icon: InventoryIcon, path: '/admin/products-management' },
    { id: 'orders', label: 'ניהול הזמנות', icon: OrdersIcon, path: '/admin/orders-management' },
    { id: 'clients', label: 'ניהול לקוחות', icon: PeopleIcon, path: '/admin/client-management' },
    { id: 'settings', label: 'הגדרות', icon: SettingsIcon, path: '/admin/settings' },
  ];

  // Event handlers
  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleUserMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleUserMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleUserMenuClose();
  }, [signOut, router, handleUserMenuClose]);

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [router, isMobile]);

  const handleReturnToWebsite = useCallback(() => {
    router.push('/');
  }, [router]);

  // Sidebar content
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        minHeight: 64
      }}>
        {!sidebarCollapsed && (
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            מערכת ניהול
          </Typography>
        )}
        <IconButton 
          onClick={handleSidebarToggle}
          size="small"
          sx={{ 
            color: 'text.secondary',
            '&:hover': { backgroundColor: 'action.hover' }
          }}
        >
          {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                minHeight: 48,
                px: sidebarCollapsed ? 1.5 : 2,
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                },
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: sidebarCollapsed ? 'auto' : 40,
                justifyContent: 'center',
                color: 'text.secondary'
              }}>
                <item.icon />
              </ListItemIcon>
              {!sidebarCollapsed && (
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* User Info */}
      {!sidebarCollapsed && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500, 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user?.email || 'משתמש'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                מנהל מערכת
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 } }}>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Desktop sidebar toggle */}
          {!isMobile && (
            <IconButton
              color="inherit"
              onClick={handleSidebarToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Page Title */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {title}
          </Typography>

          {/* Return to Website Button */}
          <IconButton
            color="inherit"
            onClick={handleReturnToWebsite}
            sx={{ 
              mr: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              }
            }}
            title="חזרה לאתר"
          >
            <HomeIcon />
          </IconButton>

          {/* Notifications */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton
            color="inherit"
            onClick={handleUserMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
          </IconButton>

          {/* User Menu Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: { minWidth: 200, mt: 1 }
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user?.email || 'משתמש'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                מנהל מערכת
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { handleUserMenuClose(); router.push('/admin/settings'); }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>הגדרות</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>התנתק</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          backgroundColor: 'grey.50',
          minHeight: '100vh',
        }}
      >
        {/* Content Area - Full Width */}
        <Box sx={{ 
          pt: 8, // Account for AppBar height
          px: { xs: 2, sm: 3, lg: 4 },
          pb: 4,
          minHeight: '100vh',
          // Remove max-width constraints for admin
          maxWidth: 'none',
          width: '100%',
          // Global DataGrid styling for admin area
          '& .MuiDataGrid-root': {
            width: '100% !important',
            minWidth: '100%',
            '& .MuiDataGrid-main': {
              width: '100% !important',
            },
            '& .MuiDataGrid-virtualScroller': {
              width: '100% !important',
            },
            '& .MuiDataGrid-columnHeaders': {
              width: '100% !important',
            },
            '& .MuiDataGrid-footerContainer': {
              width: '100% !important',
            },
          },
        }}>
          {children}
        </Box>
      </Box>

      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: theme.zIndex.drawer - 1,
          }}
          onClick={handleDrawerToggle}
        />
      )}
    </Box>
  );
};

export default AdminLayout;
