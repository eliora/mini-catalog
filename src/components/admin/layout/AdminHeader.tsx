/**
 * Admin Header Component
 * 
 * Top header bar for admin dashboard with user menu, notifications, and mobile menu toggle.
 */

'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  onMobileMenuToggle?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMobileMenuToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleUserMenuClose();
  };

  const handleProfileClick = () => {
    router.push('/admin/profile');
    handleUserMenuClose();
  };

  const handleSettingsClick = () => {
    router.push('/admin/settings');
    handleUserMenuClose();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar>
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <IconButton
            edge="start"
            onClick={onMobileMenuToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Page Title - This will be updated by individual pages */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Admin Dashboard
          </Typography>
        </Box>

        {/* Header Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton
            onClick={handleNotificationsOpen}
            color="inherit"
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton
            onClick={handleUserMenuOpen}
            color="inherit"
            sx={{ ml: 1 }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: '0.9rem'
              }}
            >
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </Avatar>
          </IconButton>
        </Box>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
          PaperProps={{
            sx: { width: 300, maxWidth: '90vw' }
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
          </Box>
          
          <MenuItem>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                New order received
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Order #1234 from John Doe
              </Typography>
            </Box>
          </MenuItem>
          
          <MenuItem>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Low stock alert
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Vitamin C Serum is running low
              </Typography>
            </Box>
          </MenuItem>
          
          <MenuItem>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                New client registration
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Jane Smith has registered
              </Typography>
            </Box>
          </MenuItem>
          
          <Divider />
          
          <MenuItem sx={{ justifyContent: 'center' }}>
            <Typography variant="body2" color="primary">
              View All Notifications
            </Typography>
          </MenuItem>
        </Menu>

        {/* User Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          PaperProps={{
            sx: { width: 200 }
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.email || 'Admin User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Administrator
            </Typography>
          </Box>
          
          <MenuItem onClick={handleProfileClick}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleSettingsClick}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
