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
 * 
 * @param {Object} user - Current authenticated user
 * @param {boolean} isAdmin - Whether user has admin permissions
 * @param {Element} accountMenuAnchor - Menu anchor element
 * @param {Function} handleAccountMenuClose - Menu close handler
 * @param {Function} handleLogin - Login handler
 * @param {Function} handleLogout - Logout handler
 * @param {Function} handleAdminAccess - Admin panel access handler
 */

import React from 'react';
import {
  Menu,
  MenuItem,
  Typography,
  Divider
} from '@mui/material';
import {
  PersonOutline as PersonIcon,
  ShoppingCartOutlined as CartIcon
} from '@mui/icons-material';

const AccountMenu = ({
  user,
  isAdmin,
  accountMenuAnchor,
  handleAccountMenuClose,
  handleLogin,
  handleLogout,
  handleAdminAccess,
  navigate
}) => {
  return (
    <Menu
      anchorEl={accountMenuAnchor}
      open={Boolean(accountMenuAnchor)}
      onClose={handleAccountMenuClose}
      PaperProps={{
        sx: {
          mt: 1,
          minWidth: 200,
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid rgba(0,0,0,0.05)'
        }
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={() => { handleAccountMenuClose(); console.log('Profile clicked'); }} sx={{ py: 1.5, px: 2 }}>
        <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
        <Typography>הפרופיל שלי</Typography>
      </MenuItem>
      <MenuItem onClick={() => { handleAccountMenuClose(); navigate('/orderform'); }} sx={{ py: 1.5, px: 2 }}>
        <CartIcon sx={{ mr: 1, fontSize: 20 }} />
        <Typography>ההזמנות שלי</Typography>
      </MenuItem>
      <Divider />
      {isAdmin && (
        <MenuItem onClick={() => { handleAccountMenuClose(); navigate('/admin'); }} sx={{ py: 1.5, px: 2 }}>
          <Typography sx={{ color: 'primary.main', fontWeight: 600 }}>ניהול מערכת</Typography>
        </MenuItem>
      )}
      {isAdmin && <Divider />}
      <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2 }}>
        <Typography sx={{ color: 'error.main' }}>התנתק</Typography>
      </MenuItem>
    </Menu>
  );
};

export default React.memo(AccountMenu);
