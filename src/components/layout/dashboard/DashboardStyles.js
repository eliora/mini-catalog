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
 */

import { styled } from '@mui/material/styles';
import { Drawer, AppBar, ListItemButton, Box } from '@mui/material';

export const drawerWidth = 280;

/**
 * Styled drawer component with light theme
 */
export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    background: '#FFFFFF',
    color: '#2B3445',
    borderRight: '1px solid #F3F5F9',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
}));

/**
 * Styled app bar with clean design
 */
export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: '#FFFFFF',
  color: '#2B3445',
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
  borderBottom: '1px solid #F3F5F9',
  minHeight: 64,
}));

/**
 * Styled list item button with active states
 */
export const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  borderRadius: '8px',
  margin: theme.spacing(0.25, 1),
  padding: theme.spacing(1, 1.5),
  minHeight: 44,
  transition: 'all 0.2s ease-in-out',
  
  ...(active && {
    background: '#F6F9FC',
    borderLeft: '3px solid #4E97FD',
    paddingLeft: theme.spacing(1.25),
    '& .MuiListItemIcon-root': {
      color: '#4E97FD',
    },
    '& .MuiListItemText-primary': {
      color: '#2B3445',
      fontWeight: 600,
    },
  }),
  
  '&:hover': {
    background: active ? '#F6F9FC' : '#F3F5F9',
  },
  
  '& .MuiListItemIcon-root': {
    color: active ? '#4E97FD' : '#7D879C',
    minWidth: 36,
    fontSize: 20,
  },
  
  '& .MuiListItemText-primary': {
    color: active ? '#2B3445' : '#4B566B',
    fontWeight: active ? 600 : 500,
    fontSize: '0.875rem',
  },
}));

/**
 * Main content area with responsive margins
 */
export const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  background: '#F8F9FA',
  minHeight: '100vh',
  [theme.breakpoints.up('md')]: {
    marginLeft: drawerWidth,
  },
}));

/**
 * Sidebar header section
 */
export const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 2, 2),
  borderBottom: '1px solid #F3F5F9',
  background: '#FFFFFF',
}));

/**
 * Content wrapper with proper spacing
 */
export const ContentWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: 64, // Account for AppBar height
  minHeight: 'calc(100vh - 64px)',
}));

const DashboardStyles = {
  drawerWidth,
  StyledDrawer,
  StyledAppBar,
  StyledListItemButton,
  MainContent,
  SidebarHeader,
  ContentWrapper
};

export default DashboardStyles;
