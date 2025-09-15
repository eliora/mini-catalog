/**
 * Dashboard Styles - Styled components for vendor dashboard
 * 
 * Centralized styled components for the vendor dashboard layout.
 * Provides consistent styling based on Bazaar Pro design system.
 * 
 * Features:
 * - Light, clean design aesthetic
 * - Consistent spacing and colors
 * - Hover and active states
 * - Responsive behavior
 * - Material-UI theme integration
 * - TypeScript support
 */

import { styled } from '@mui/material/styles';
import { Drawer, AppBar, ListItemButton, Box } from '@mui/material';

// Constants
export const drawerWidth = 280;

// Theme colors
export const dashboardColors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  primary: '#4E97FD',
  secondary: '#2B3445',
  text: {
    primary: '#2B3445',
    secondary: '#4B566B',
    disabled: '#7D879C',
  },
  border: '#F3F5F9',
  divider: '#E3E9EF',
  hover: '#F3F5F9',
  active: '#F6F9FC',
} as const;

// Styled drawer component interface
interface StyledDrawerProps {
  variant?: 'permanent' | 'persistent' | 'temporary';
  open?: boolean;
}

/**
 * Styled drawer component with light theme
 */
export const StyledDrawer = styled(Drawer)<StyledDrawerProps>(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    background: dashboardColors.surface,
    color: dashboardColors.text.primary,
    borderRight: `1px solid ${dashboardColors.border}`,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    zIndex: theme.zIndex.drawer,
  },
}));

/**
 * Styled app bar with clean design
 */
export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: dashboardColors.surface,
  color: dashboardColors.text.primary,
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
  borderBottom: `1px solid ${dashboardColors.border}`,
  minHeight: 64,
  '& .MuiToolbar-root': {
    minHeight: '64px !important',
  },
}));

// List item button props interface
interface StyledListItemButtonProps {
  active?: boolean;
}

/**
 * Styled list item button with active states
 */
export const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})<StyledListItemButtonProps>(({ theme, active = false }) => ({
  borderRadius: '8px',
  margin: theme.spacing(0.25, 1),
  padding: theme.spacing(1, 1.5),
  minHeight: 44,
  transition: 'all 0.2s ease-in-out',
  
  ...(active && {
    background: dashboardColors.active,
    borderLeft: `3px solid ${dashboardColors.primary}`,
    paddingLeft: theme.spacing(1.25),
    '& .MuiListItemIcon-root': {
      color: dashboardColors.primary,
    },
    '& .MuiListItemText-primary': {
      color: dashboardColors.text.primary,
      fontWeight: 600,
    },
    '& .MuiListItemText-secondary': {
      color: dashboardColors.text.disabled,
    },
  }),
  
  '&:hover': {
    background: active ? dashboardColors.active : dashboardColors.hover,
    transform: 'translateX(2px)',
  },
  
  '& .MuiListItemIcon-root': {
    color: active ? dashboardColors.primary : dashboardColors.text.disabled,
    minWidth: 36,
    fontSize: 20,
    transition: 'color 0.2s ease',
  },
  
  '& .MuiListItemText-primary': {
    color: active ? dashboardColors.text.primary : dashboardColors.text.secondary,
    fontWeight: active ? 600 : 500,
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
  },
  
  '& .MuiListItemText-secondary': {
    color: dashboardColors.text.disabled,
    fontSize: '0.7rem',
  },
}));

/**
 * Main content area with responsive margins
 */
export const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  background: dashboardColors.background,
  minHeight: '100vh',
  transition: 'margin 0.2s ease-in-out',
  [theme.breakpoints.up('md')]: {
    marginLeft: drawerWidth,
  },
}));

/**
 * Sidebar header section
 */
export const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 2, 2),
  borderBottom: `1px solid ${dashboardColors.border}`,
  background: dashboardColors.surface,
}));

/**
 * Content wrapper with proper spacing
 */
export const ContentWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: 64, // Account for AppBar height
  minHeight: 'calc(100vh - 64px)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

/**
 * Dashboard card component
 */
export const DashboardCard = styled(Box)(({ theme }) => ({
  background: dashboardColors.surface,
  borderRadius: '12px',
  padding: theme.spacing(3),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  border: `1px solid ${dashboardColors.border}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    transform: 'translateY(-1px)',
  },
}));

/**
 * Stats card for dashboard metrics
 */
export const StatsCard = styled(Box)(({ theme }) => ({
  background: dashboardColors.surface,
  borderRadius: '12px',
  padding: theme.spacing(2.5),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  border: `1px solid ${dashboardColors.border}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
}));

// Export all styles as a default object
const DashboardStyles = {
  drawerWidth,
  dashboardColors,
  StyledDrawer,
  StyledAppBar,
  StyledListItemButton,
  MainContent,
  SidebarHeader,
  ContentWrapper,
  DashboardCard,
  StatsCard,
};

export default DashboardStyles;

