import React, { useState } from 'react';
import {
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  ShoppingCart as CartIcon,
  Receipt as OrdersIcon,
  AccountCircle as AccountIcon,
  Login as LoginIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import usePricing from '../../hooks/usePricing';
import useAdminAccess from '../../hooks/useAdminAccess';
import AuthDialog from './AuthDialog';
import { useNavigate } from 'react-router-dom';

const UserMenu = ({ cartItemCount = 0 }) => {
  const { user, signOut, loading } = useSupabaseAuth();
  const { canViewPrices, tier } = usePricing();
  const { isAdmin } = useAdminAccess();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState(0);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleMenuClose();
    
    // Set a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.log('⏰ Sign out timeout - forcing reload');
      window.location.reload();
    }, 3000); // 3 second timeout
    
    try {
      console.log('🔓 Signing out user...');
      await signOut();
      console.log('✅ Sign out successful');
      
      // Clear the timeout since we succeeded
      clearTimeout(timeoutId);
      
      // Force a small delay then reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('❌ Sign out error:', error);
      
      // Clear the timeout and reload immediately
      clearTimeout(timeoutId);
      window.location.reload();
    }
  };

  const handleSignInClick = () => {
    setAuthDialogTab(0);
    setAuthDialogOpen(true);
  };


  const getUserDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'משתמש';
  };

  const getUserRole = () => {
    if (!canViewPrices) return 'משתמש רגיל';
    if (tier === 'verified_member') return 'חבר מאומת';
    if (tier === 'admin') return 'מנהל';
    return 'משתמש';
  };

  const getRoleColor = () => {
    if (tier === 'admin') return 'error';
    if (tier === 'verified_member') return 'success';
    return 'default';
  };

  // If user is not authenticated, show sign in/up buttons
  if (!user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Cart Icon for anonymous users */}
        <Tooltip title="עגלת קניות">
          <IconButton color="inherit">
            <Badge badgeContent={cartItemCount} color="error">
              <CartIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Single Login/Signup Button */}
        <Button
          variant="contained"
          size="small"
          startIcon={<LoginIcon />}
          onClick={handleSignInClick}
          sx={{
            textTransform: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            }
          }}
        >
          התחברות / הרשמה
        </Button>

        {/* Auth Dialog */}
        <AuthDialog
          open={authDialogOpen}
          onClose={() => setAuthDialogOpen(false)}
          initialTab={authDialogTab}
        />
      </Box>
    );
  }

  // If user is authenticated, show user menu
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Cart Icon */}
      <Tooltip title="עגלת קניות">
        <IconButton color="inherit">
          <Badge badgeContent={cartItemCount} color="error">
            <CartIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* User Menu Button */}
      <Button
        onClick={handleMenuOpen}
        sx={{
          textTransform: 'none',
          color: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            backgroundColor: 'primary.main',
            fontSize: '0.875rem'
          }}
        >
          {getUserDisplayName().charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
            {getUserDisplayName()}
          </Typography>
          <Chip
            label={getUserRole()}
            size="small"
            color={getRoleColor()}
            sx={{
              height: 16,
              fontSize: '0.6rem',
              '& .MuiChip-label': {
                px: 0.5,
              }
            }}
          />
        </Box>
      </Button>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5, backgroundColor: 'grey.50' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {getUserDisplayName()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip
              label={getUserRole()}
              size="small"
              color={getRoleColor()}
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
        </Box>

        <Divider />

        {/* Menu Items */}
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="פרופיל אישי" />
        </MenuItem>

        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <OrdersIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="ההזמנות שלי" />
        </MenuItem>

        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="הגדרות" />
        </MenuItem>

        {/* Admin Panel - only visible to admins */}
        {isAdmin && (
          <>
            <MenuItem onClick={() => {
              handleMenuClose();
              navigate('/admin');
            }}>
              <ListItemIcon>
                <AdminIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="פאנל ניהול" />
            </MenuItem>
          </>
        )}

        <Divider />

        {/* Sign Out */}
        <MenuItem onClick={handleSignOut} disabled={loading}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={loading ? 'מתנתק...' : 'התנתקות'} />
        </MenuItem>
        
        {/* Emergency logout if regular logout hangs */}
        {loading && (
          <MenuItem 
            onClick={() => {
              console.log('🚨 Emergency logout - clearing everything');
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="יציאה מהירה" />
          </MenuItem>
        )}
      </Menu>

      {/* Auth Dialog (in case needed) */}
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        initialTab={authDialogTab}
      />
    </Box>
  );
};

export default UserMenu;
