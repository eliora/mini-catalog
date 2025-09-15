/**
 * JDAHeader Component - Main application header
 * 
 * Comprehensive header component matching JDA website design.
 * Refactored with TypeScript and Next.js compatibility.
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
 * - TypeScript support
 * - Next.js App Router compatibility
 * 
 * Performance:
 * - React.memo optimization
 * - Extracted static navigation data
 * - Modular component architecture
 * - Efficient state management
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { CompanySettings } from '@/types/company';

// Extracted components
import TopBar from './header/TopBar';
import MainToolbar from './header/MainToolbar';
import NavigationMenu from './header/NavigationMenu';
import AccountMenu from './header/AccountMenu';
import AuthDialog from '../auth/AuthDialog';

// Navigation data
import { navigationItems } from './header/NavigationData';

// Props interface
interface JDAHeaderProps {
  companySettings?: CompanySettings | null;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onClearSearch?: () => void;
  searchPlaceholder?: string;
  showTopBar?: boolean;
  showNavigation?: boolean;
  elevation?: number;
}

// Anchor elements state type
interface AnchorElements {
  [key: string]: HTMLElement | null;
}

const JDAHeader: React.FC<JDAHeaderProps> = ({ 
  companySettings, 
  searchTerm = '', 
  onSearchChange,
  onClearSearch,
  searchPlaceholder = "חיפוש מוצרים...",
  showTopBar = true,
  showNavigation = true,
  elevation = 0
}) => {
  const router = useRouter();
  const pathname = usePathname();
  
  // Context hooks
  const { user, isAdmin, signOut } = useAuth();
  const { cart } = useCart();
  
  // State management
  const [anchorEl, setAnchorEl] = useState<AnchorElements>({});
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<HTMLElement | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState<boolean>(false);

  // ===== EVENT HANDLERS =====

  /**
   * Opens a navigation dropdown menu
   */
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>, menuId: string) => {
    setAnchorEl(prev => ({
      ...prev,
      [menuId]: event.currentTarget
    }));
  }, []);

  /**
   * Closes a navigation dropdown menu
   */
  const handleMenuClose = useCallback((menuId: string) => {
    setAnchorEl(prev => ({
      ...prev,
      [menuId]: null
    }));
  }, []);

  /**
   * Handles navigation to routes using Next.js router
   */
  const handleNavigation = useCallback((route: string) => {
    if (route) {
      router.push(route);
      // Close any open menus
      setAnchorEl({});
    }
  }, [router]);

  /**
   * Opens account menu or auth dialog
   */
  const handleAccountClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!user) {
      setAuthDialogOpen(true);
    } else {
      setAccountMenuAnchor(event.currentTarget);
    }
  }, [user]);

  /**
   * Closes account menu
   */
  const handleAccountMenuClose = useCallback(() => {
    setAccountMenuAnchor(null);
  }, []);

  /**
   * Handles cart navigation
   */
  const handleCartClick = useCallback(() => {
    router.push('/orderform');
  }, [router]);

  /**
   * Handles logo click navigation to catalog
   */
  const handleLogoClick = useCallback(() => {
    router.push('/catalog');
  }, [router]);

  /**
   * Opens authentication dialog
   */
  const handleLogin = useCallback(() => {
    setAuthDialogOpen(true);
    handleAccountMenuClose();
  }, [handleAccountMenuClose]);

  /**
   * Handles user logout
   */
  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      handleAccountMenuClose();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [signOut, router, handleAccountMenuClose]);

  /**
   * Navigates to admin panel
   */
  const handleAdminAccess = useCallback(() => {
    router.push('/admin');
    handleAccountMenuClose();
  }, [router, handleAccountMenuClose]);

  /**
   * Handles auth dialog close
   */
  const handleAuthDialogClose = useCallback(() => {
    setAuthDialogOpen(false);
  }, []);

  /**
   * Handles successful authentication
   */
  const handleAuthSuccess = useCallback(() => {
    setAuthDialogOpen(false);
    // Optionally redirect or show success message
  }, []);

  /**
   * Handles institute search
   */
  const handleInstituteSearch = useCallback(() => {
    // Could open a search dialog or navigate to institute finder
    console.log('Institute search clicked');
  }, []);

  // Get cart item count
  const cartItemCount = cart.itemCount || 0;

  // Create location object for navigation menu
  const location = { pathname };

  // ===== RENDER =====
  return (
    <Box sx={{ position: 'relative', zIndex: 'appBar' }}>
      {/* Top Contact Bar */}
      {showTopBar && (
        <TopBar 
          companySettings={companySettings} 
          onInstituteSearch={handleInstituteSearch}
        />
      )}

      {/* Main Toolbar */}
      <MainToolbar
        companySettings={companySettings}
        cartItemCount={cartItemCount}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onSearchClear={onClearSearch}
        searchPlaceholder={searchPlaceholder}
        handleAccountClick={handleAccountClick}
        handleCartClick={handleCartClick}
        onLogoClick={handleLogoClick}
        elevation={elevation}
      />

      {/* Desktop Navigation Menu */}
      {showNavigation && (
        <NavigationMenu
          navigationItems={navigationItems}
          anchorEl={anchorEl}
          handleMenuOpen={handleMenuOpen}
          handleMenuClose={handleMenuClose}
          handleNavigation={handleNavigation}
          location={location}
        />
      )}

      {/* Account Dropdown Menu */}
      <AccountMenu
        user={user}
        isAdmin={isAdmin()}
        accountMenuAnchor={accountMenuAnchor}
        handleAccountMenuClose={handleAccountMenuClose}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        handleAdminAccess={handleAdminAccess}
        navigate={handleNavigation}
      />

      {/* Authentication Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onClose={handleAuthDialogClose}
        onAuthSuccess={handleAuthSuccess}
      />
    </Box>
  );
};

export default React.memo(JDAHeader);
