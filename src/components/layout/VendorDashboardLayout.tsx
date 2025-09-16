/**
 * VendorDashboardLayout Component - Main dashboard layout
 * 
 * Comprehensive dashboard layout with sidebar navigation and content area.
 * Refactored with TypeScript and Next.js compatibility.
 * 
 * Architecture:
 * - DashboardAppBar: Top navigation bar with user profile
 * - DashboardSidebar: Left navigation sidebar with menu items
 * - DashboardStyles: Centralized styled components
 * - DashboardNavigation: Navigation menu data and configuration
 * 
 * Features:
 * - Responsive design (desktop/mobile)
 * - Drawer navigation for mobile
 * - Active state management
 * - User profile integration
 * - Statistics badges on menu items
 * - Clean, modern Bazaar Pro inspired design
 * - TypeScript support
 * - Next.js App Router compatibility
 * 
 * Performance:
 * - React.memo optimization
 * - Extracted styled components
 * - Modular component architecture
 * - Efficient state management
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { AuthUser } from '@/types/auth';

// Extracted components
import DashboardAppBar from './dashboard/DashboardAppBar';
import DashboardSidebar from './dashboard/DashboardSidebar';
import { MainContent, ContentWrapper } from './dashboard/DashboardStyles';
import { DashboardStats } from './dashboard/DashboardNavigation';

// Props interface
interface VendorDashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: number;
  onTabChange?: (tabId: number) => void;
  onLogout?: () => void;
  stats?: DashboardStats;
  user?: AuthUser | null;
  title?: string;
  showNotifications?: boolean;
  notificationCount?: number;
  companyName?: string;
  version?: string;
}

const VendorDashboardLayout: React.FC<VendorDashboardLayoutProps> = ({ 
  children, 
  activeTab = 0, 
  onTabChange,
  onLogout,
  stats = {},
  user,
  title = 'לוח בקרה',
  showNotifications = true,
  notificationCount = 0,
  companyName = 'מערכת ניהול חכמה',
  version = '3.0'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Get user from context if not provided
  const { user: contextUser, signOut } = useAuth();
  const currentUser = user || contextUser;

  // ===== EVENT HANDLERS =====

  /**
   * Toggles mobile drawer
   */
  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  /**
   * Handles tab change
   */
  const handleTabChange = useCallback((tabId: number) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    
    // Close mobile drawer after tab change
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [onTabChange, isMobile]);

  /**
   * Handles user logout
   */
  const handleLogout = useCallback(async () => {
    try {
      if (onLogout) {
        onLogout();
      } else {
        // Use context signOut if no custom handler provided
        await signOut();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [onLogout, signOut]);

  // ===== RENDER =====
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top App Bar */}
      <DashboardAppBar
        onDrawerToggle={handleDrawerToggle}
        onLogout={handleLogout}
        user={currentUser}
        title={title}
        showNotifications={showNotifications}
        notificationCount={notificationCount}
      />

      {/* Navigation Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        stats={stats}
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        companyName={companyName}
        version={version}
      />

      {/* Main Content Area */}
      <MainContent>
        <ContentWrapper>
          {children}
        </ContentWrapper>
      </MainContent>

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

export default React.memo(VendorDashboardLayout);

