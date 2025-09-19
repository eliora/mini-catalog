/**
 * DashboardAppBar Component - Top application bar for dashboard
 * 
 * Top navigation bar with user profile, notifications, and mobile menu toggle.
 * Provides consistent header across all dashboard pages.
 * 
 * Features:
 * - User profile dropdown menu
 * - Mobile menu toggle button
 * - Notification badges
 * - Logout functionality
 * - Responsive design
 * - Clean, modern styling
 * - TypeScript support with proper interfaces
 */

'use client';

import React, { useState } from 'react';
import {
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
  ListItemIcon,
  Divider,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { AuthUser } from '@/types/auth';

// Local imports
import { StyledAppBar } from './DashboardStyles';

// Props interface
interface DashboardAppBarProps {
  onDrawerToggle: () => void;
  onLogout: () => void;
  user?: AuthUser | null;
  title?: string;
  showNotifications?: boolean;
  notificationCount?: number;
}

const DashboardAppBar: React.FC<DashboardAppBarProps> = ({ 
  onDrawerToggle, 
  onLogout, 
  user,
  title = 'לוח בקרה',
  showNotifications = true,
  notificationCount = 0
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [profileMenu, setProfileMenu] = useState<HTMLElement | null>(null);

  /**
   * Opens the profile menu
   */
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenu(event.currentTarget);
  };

  /**
   * Closes the profile menu
   */
  const handleProfileMenuClose = () => {
    setProfileMenu(null);
  };

  /**
   * Handles user logout
   */
  const handleLogout = () => {
    handleProfileMenuClose();
    onLogout();
  };

  /**
   * Handles profile navigation
   */
  const handleProfile = () => {
    handleProfileMenuClose();
    // Navigate to profile page
    console.log('Navigate to profile');
  };

  /**
   * Handles settings navigation
   */
  const handleSettings = () => {
    handleProfileMenuClose();
    // Navigate to settings page
    console.log('Navigate to settings');
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = (): string => {
    if (!user) return 'מנהל מערכת';
    
    if (user.profile?.first_name && user.profile?.last_name) {
      return `${user.profile.first_name} ${user.profile.last_name}`;
    }
    
    if (user.profile?.first_name) {
      return user.profile.first_name;
    }
    
    return user.email?.split('@')[0] || 'משתמש';
  };

  /**
   * Get user role display
   */
  const getUserRole = (): string => {
    if (!user?.profile) return 'מנהל';
    
    const roleMap: Record<string, string> = {
      admin: 'מנהל מערכת',
      manager: 'מנהל',
      user: 'משתמש',
      standard: 'משתמש רגיל'
    };
    
    return roleMap[user.profile.user_role || 'standard'] || 'משתמש';
  };

  /**
   * Get user avatar
   */
  const getUserAvatar = (): string => {
    return user?.user_metadata?.avatar_url || '';
  };

  return (
    <StyledAppBar position="fixed">
      <Toolbar sx={{ minHeight: '64px !important', px: 3 }}>
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ 
              mr: 2
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Title */}
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            color: '#2B3445',
            fontWeight: 600,
            fontSize: { xs: '1rem', md: '1.1rem' }
          }}
        >
          {title}
        </Typography>

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          {showNotifications && (
            <IconButton
              color="inherit"
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          )}

          {/* User Info - Desktop */}
          {!isMobile && user && (
            <Box sx={{ textAlign: 'right', mr: 1 }}>
              <Typography variant="body2" sx={{ color: '#2B3445', fontWeight: 500 }}>
                {getUserDisplayName()}
              </Typography>
              <Typography variant="caption" sx={{ color: '#7D879C' }}>
                {getUserRole()}
              </Typography>
            </Box>
          )}

          {/* Profile Avatar */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
            sx={{
              p: 0.5
            }}
          >
            <Avatar 
              src={getUserAvatar()}
              sx={{ 
                width: 36, 
                height: 36,
                bgcolor: '#4E97FD',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              {getUserDisplayName().charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileMenu}
          open={Boolean(profileMenu)}
          onClose={handleProfileMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 240,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid rgba(0,0,0,0.05)',
              overflow: 'visible',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* User Info in Menu */}
          {user && (
            <>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F3F5F9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar 
                    src={getUserAvatar()}
                    sx={{ 
                      width: 40, 
                      height: 40,
                      bgcolor: '#4E97FD'
                    }}
                  >
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2B3445' }}>
                      {getUserDisplayName()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7D879C', fontSize: '0.8rem' }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Divider />
            </>
          )}

          {/* Profile Menu Item */}
          <MenuItem onClick={handleProfile} sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" sx={{ color: '#7D879C' }} />
            </ListItemIcon>
            <Typography variant="body2">הפרופיל שלי</Typography>
          </MenuItem>

          {/* Settings Menu Item */}
          <MenuItem onClick={handleSettings} sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" sx={{ color: '#7D879C' }} />
            </ListItemIcon>
            <Typography variant="body2">הגדרות</Typography>
          </MenuItem>

          <Divider />

          {/* Logout Menu Item */}
          <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: '#f44336' }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ color: '#f44336' }}>
              יציאה
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </StyledAppBar>
  );
};

export default React.memo(DashboardAppBar);

