/**
 * VendorDashboardLayout Component (Refactored) - Main dashboard layout
 * 
 * Comprehensive dashboard layout with sidebar navigation and content area.
 * Refactored from 434 lines to ~100 lines by extracting specialized components.
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
 * 
 * Performance:
 * - React.memo optimization
 * - Extracted styled components
 * - Modular component architecture
 * - Reduced bundle size through code splitting
 */

import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

// Extracted components
import DashboardAppBar from './dashboard/DashboardAppBar';
import DashboardSidebar from './dashboard/DashboardSidebar';
import { MainContent, ContentWrapper } from './dashboard/DashboardStyles';

const VendorDashboardLayout = ({ 
  children, 
  activeTab = 0, 
  onTabChange, 
  onLogout,
  stats = {},
  user = null
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  // ===== EVENT HANDLERS =====

  /**
   * Toggles mobile drawer
   */
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // ===== RENDER =====
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Top App Bar */}
      <DashboardAppBar
        onDrawerToggle={handleDrawerToggle}
        onLogout={onLogout}
        user={user}
      />

      {/* Navigation Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        stats={stats}
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
      />

      {/* Main Content Area */}
      <MainContent>
        <ContentWrapper>
          {children}
        </ContentWrapper>
      </MainContent>
    </Box>
  );
};

export default React.memo(VendorDashboardLayout);