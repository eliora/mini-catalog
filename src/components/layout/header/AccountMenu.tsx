/**
 * AccountMenu Component - User account dropdown menu
 * 
 * Dropdown menu for user account actions including login/logout and admin access.
 * Displays different options based on authentication status and user permissions.
 * 
 * Features:
 * - Login/logout functionality
 * - Admin panel access for authorized users
 * - User profile information display
 * - Authentication dialog integration
 * - Responsive menu positioning
 * - TypeScript support with proper interfaces
 */

'use client';

import React from 'react';
import {
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  Avatar,
  Box,
} from '@mui/material';
import {
  PersonOutline as PersonIcon,
  ShoppingCartOutlined as CartIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import { AuthUser } from '@/types/auth';

// Props interface
interface AccountMenuProps {
  user: AuthUser | null;
  isAdmin: boolean;
  accountMenuAnchor: HTMLElement | null;
  handleAccountMenuClose: () => void;
  handleLogin: () => void;
  handleLogout: () => void;
  handleAdminAccess: () => void;
  navigate: (path: string) => void;
}

const AccountMenu: React.FC<AccountMenuProps> = ({
  user,
  isAdmin,
  accountMenuAnchor,
  handleAccountMenuClose,
  handleLogin,
  handleLogout,
  handleAdminAccess,
  navigate
}) => {
  // Handle menu item click with navigation
  const handleMenuItemClick = (action: () => void) => {
    handleAccountMenuClose();
    action();
  };

  // Get user display name
  const getUserDisplayName = (): string => {
    if (!user) return '';
    
    if (user.profile?.first_name && user.profile?.last_name) {
      return `${user.profile.first_name} ${user.profile.last_name}`;
    }
    
    if (user.profile?.first_name) {
      return user.profile.first_name;
    }
    
    return user.email?.split('@')[0] || 'משתמש';
  };

  // Get user avatar
  const getUserAvatar = (): string => {
    return user?.user_metadata?.avatar_url || '';
  };

  return (
    <Menu
      anchorEl={accountMenuAnchor}
      open={Boolean(accountMenuAnchor)}
      onClose={handleAccountMenuClose}
      PaperProps={{
        sx: {
          mt: 1,
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
      {/* User Info Header */}
      {user && (
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
              src={getUserAvatar()}
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: 'primary.main'
              }}
            >
              {getUserDisplayName().charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {getUserDisplayName()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Menu Items */}
      {user ? (
        [
          /* Profile */
          <MenuItem 
            key="profile"
            onClick={() => handleMenuItemClick(() => navigate('/profile'))} 
            sx={{ py: 1.5, px: 2 }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <Typography>הפרופיל שלי</Typography>
          </MenuItem>,

          /* Orders */
          <MenuItem 
            key="orders"
            onClick={() => handleMenuItemClick(() => navigate('/orderform'))} 
            sx={{ py: 1.5, px: 2 }}
          >
            <ListItemIcon>
              <CartIcon fontSize="small" />
            </ListItemIcon>
            <Typography>ההזמנות שלי</Typography>
          </MenuItem>,

          /* Admin Panel */
          ...(isAdmin ? [
            <Divider key="admin-divider" />,
            <MenuItem 
              key="admin"
              onClick={() => handleMenuItemClick(handleAdminAccess)} 
              sx={{ py: 1.5, px: 2 }}
            >
              <ListItemIcon>
                <AdminIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <Typography sx={{ color: 'primary.main', fontWeight: 600 }}>
                ניהול מערכת
              </Typography>
            </MenuItem>
          ] : []),

          /* Logout */
          <Divider key="logout-divider" />,
          <MenuItem 
            key="logout"
            onClick={() => handleMenuItemClick(handleLogout)} 
            sx={{ py: 1.5, px: 2 }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <Typography sx={{ color: 'error.main' }}>
              התנתק
            </Typography>
          </MenuItem>
        ]
      ) : (
        /* Login Option for Non-authenticated Users */
        <MenuItem 
          onClick={() => handleMenuItemClick(handleLogin)} 
          sx={{ py: 1.5, px: 2 }}
        >
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          <Typography>התחבר / הרשמה</Typography>
        </MenuItem>
      )}
    </Menu>
  );
};

export default React.memo(AccountMenu);

