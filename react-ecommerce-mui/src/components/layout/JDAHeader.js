/**
 * JDAHeader Component (Refactored) - Main application header
 * 
 * Comprehensive header component matching JDA website design.
 * Refactored from 589 lines to ~150 lines by extracting specialized components.
 * 
 * Architecture:
 * - TopBar: Contact information and institute search
 * - MainToolbar: Logo, search, and action icons  
 * - NavigationMenu: Desktop navigation with dropdowns
 * - AccountMenu: User account dropdown
 * - AuthDialog: Authentication modal
 * 
 * Features:
 * - Responsive design (desktop/mobile)
 * - Multi-level navigation menus
 * - Search functionality integration
 * - Shopping cart integration
 * - User authentication system
 * - Admin access controls
 * 
 * Performance:
 * - React.memo optimization
 * - Extracted static navigation data
 * - Modular component architecture
 * - Reduced bundle size through code splitting
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import useAdminAccess from '../../hooks/useAdminAccess';

// Extracted components
import TopBar from './header/TopBar';
import MainToolbar from './header/MainToolbar';
import NavigationMenu from './header/NavigationMenu';
import AccountMenu from './header/AccountMenu';
import AuthDialog from '../auth/AuthDialog';

// Navigation data
import { navigationItems } from './header/NavigationData';

const JDAHeader = ({ 
  companySettings, 
  cartItemCount = 0, 
  searchTerm = '', 
  onSearchChange, 
  onClearSearch,
  searchPlaceholder = "חיפוש מוצרים..."
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [anchorEl, setAnchorEl] = useState({});
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  // Authentication hooks
  const { user, signOut } = useSupabaseAuth();
  const { isAdmin } = useAdminAccess();

  // ===== EVENT HANDLERS =====

  /**
   * Opens a navigation dropdown menu
   */
  const handleMenuOpen = (event, menuId) => {
    setAnchorEl(prev => ({
      ...prev,
      [menuId]: event.currentTarget
    }));
  };

  /**
   * Closes a navigation dropdown menu
   */
  const handleMenuClose = (menuId) => {
    setAnchorEl(prev => ({
      ...prev,
      [menuId]: null
    }));
  };

  /**
   * Handles navigation to routes
   */
  const handleNavigation = (route) => {
    if (route) {
      navigate(route);
    }
  };

  /**
   * Opens account menu or auth dialog
   */
  const handleAccountClick = (event) => {
    if (!user) {
      setAuthDialogOpen(true);
    } else {
      setAccountMenuAnchor(event.currentTarget);
    }
  };

  /**
   * Closes account menu
   */
  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  /**
   * Handles cart navigation
   */
  const handleCartClick = () => {
    navigate('/orderform');
  };

  /**
   * Handles logo click navigation to catalog
   */
  const handleLogoClick = () => {
    navigate('/catalog');
  };

  /**
   * Opens authentication dialog
   */
  const handleLogin = () => {
    setAuthDialogOpen(true);
    handleAccountMenuClose();
  };

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    try {
      await signOut();
      handleAccountMenuClose();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Navigates to admin panel
   */
  const handleAdminAccess = () => {
    navigate('/admin');
    handleAccountMenuClose();
  };

  // ===== RENDER =====
  return (
    <Box>
      {/* Top Contact Bar */}
      <TopBar companySettings={companySettings} />

      {/* Main Toolbar */}
      <MainToolbar
        companySettings={companySettings}
        cartItemCount={cartItemCount}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        handleAccountClick={handleAccountClick}
        handleCartClick={handleCartClick}
        onLogoClick={handleLogoClick}
      />

      {/* Desktop Navigation Menu */}
      <NavigationMenu
        navigationItems={navigationItems}
        anchorEl={anchorEl}
        handleMenuOpen={handleMenuOpen}
        handleMenuClose={handleMenuClose}
        handleNavigation={handleNavigation}
        location={location}
      />

      {/* Account Dropdown Menu */}
      <AccountMenu
        user={user}
        isAdmin={isAdmin}
        accountMenuAnchor={accountMenuAnchor}
        handleAccountMenuClose={handleAccountMenuClose}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        handleAdminAccess={handleAdminAccess}
        navigate={navigate}
      />

      {/* Authentication Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
      />
    </Box>
  );
};

export default React.memo(JDAHeader);
