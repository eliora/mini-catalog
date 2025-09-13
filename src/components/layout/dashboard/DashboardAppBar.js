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
 * 
 * @param {Function} onDrawerToggle - Mobile drawer toggle handler
 * @param {Function} onLogout - Logout handler
 * @param {Object} user - Current user information
 */

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
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

// Local imports
import { StyledAppBar } from './DashboardStyles';

const DashboardAppBar = ({ onDrawerToggle, onLogout, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [profileMenu, setProfileMenu] = useState(null);

  /**
   * Opens the profile menu
   */
  const handleProfileMenuOpen = (event) => {
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
            sx={{ mr: 2 }}
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
            fontSize: '1.1rem'
          }}
        >
          לוח בקרה
        </Typography>

        {/* User Profile Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* User Info */}
          {!isMobile && user && (
            <Box sx={{ textAlign: 'right', mr: 1 }}>
              <Typography variant="body2" sx={{ color: '#2B3445', fontWeight: 500 }}>
                {user.name || 'מנהל מערכת'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#7D879C' }}>
                {user.role || 'מנהל'}
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
              p: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36,
                bgcolor: '#4E97FD',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'מ'}
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
              minWidth: 200,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid rgba(0,0,0,0.05)'
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* User Info in Menu */}
          {user && (
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F3F5F9' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2B3445' }}>
                {user.name || 'מנהל מערכת'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#7D879C', fontSize: '0.8rem' }}>
                {user.email || 'admin@system.com'}
              </Typography>
            </Box>
          )}

          {/* Profile Menu Item */}
          <MenuItem onClick={handleProfileMenuClose} sx={{ py: 1.5 }}>
            <PersonIcon sx={{ mr: 2, fontSize: 20, color: '#7D879C' }} />
            <Typography variant="body2">הפרופיל שלי</Typography>
          </MenuItem>

          {/* Logout Menu Item */}
          <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
            <LogoutIcon sx={{ mr: 2, fontSize: 20, color: '#7D879C' }} />
            <Typography variant="body2">יציאה</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </StyledAppBar>
  );
};

export default React.memo(DashboardAppBar);
