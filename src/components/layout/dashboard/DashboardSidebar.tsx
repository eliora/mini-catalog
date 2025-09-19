/**
 * DashboardSidebar Component - Navigation sidebar for dashboard
 * 
 * Responsive sidebar navigation with menu items and user information.
 * Handles both desktop and mobile layouts with drawer functionality.
 * 
 * Features:
 * - Responsive drawer behavior
 * - Active state management
 * - Badge support for menu items
 * - Clean, modern design
 * - User information display
 * - Mobile-friendly navigation
 * - TypeScript support with proper interfaces
 */

'use client';

import React from 'react';
import {
  Box,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';

// Local imports
import { StyledDrawer, StyledListItemButton, SidebarHeader } from './DashboardStyles';
import { createNavigationItems, NavigationItem, DashboardStats } from './DashboardNavigation';

// Props interface
interface DashboardSidebarProps {
  activeTab: number;
  onTabChange: (tabId: number) => void;
  stats?: DashboardStats;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  showAnalytics?: boolean;
  companyName?: string;
  version?: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onTabChange,
  stats = {},
  mobileOpen,
  onDrawerToggle,
  showAnalytics: _showAnalytics = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  companyName = 'מערכת ניהול חכמה',
  version = '3.0'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Generate navigation items with current stats
  const navigationItems = createNavigationItems(stats);

  /**
   * Handles navigation item click
   */
  const handleItemClick = (item: NavigationItem) => {
    onTabChange(item.id);
    
    // Close mobile drawer after selection
    if (isMobile) {
      onDrawerToggle();
    }
  };

  /**
   * Renders the sidebar content
   */
  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <SidebarHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4E97FD 0%, #3B82F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(78, 151, 253, 0.3)',
            }}
          >
            <AdminIcon sx={{ fontSize: 22, color: '#FFFFFF' }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#2B3445', 
                fontWeight: 600, 
                mb: 0.5, 
                fontSize: '1rem',
                lineHeight: 1.2
              }}
            >
              {companyName}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#7D879C', 
                fontSize: '0.75rem',
                fontWeight: 500
              }}
            >
              לוח בקרה מתקדם
            </Typography>
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            p: 1.5, 
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            textAlign: 'center',
            border: '1px solid #E3E9EF'
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#4B566B', 
              mb: 0.5, 
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            מערכת ניהול מתקדמת
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#7D879C', 
              fontSize: '0.7rem',
              opacity: 0.8
            }}
          >
            גרסה {version} - Light
          </Typography>
        </Box>
      </SidebarHeader>

      <Divider sx={{ borderColor: '#F3F5F9' }} />

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, py: 1 }}>
        <List sx={{ padding: 0 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <StyledListItemButton
                active={activeTab === item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
              >
                <ListItemIcon>
                  {item.badge !== null && item.badge > 0 ? (
                    <Badge 
                      badgeContent={item.badge} 
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          height: 18,
                          minWidth: 18,
                          right: -8,
                          top: -4,
                          fontWeight: 600,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  secondary={item.description}
                  primaryTypographyProps={{
                    sx: { 
                      fontSize: '0.875rem',
                      fontWeight: activeTab === item.id ? 600 : 500,
                      transition: 'all 0.2s ease'
                    }
                  }}
                  secondaryTypographyProps={{
                    sx: { 
                      fontSize: '0.7rem', 
                      color: '#7D879C',
                      mt: 0.25,
                      lineHeight: 1.2
                    }
                  }}
                />
              </StyledListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid #F3F5F9' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#7D879C', 
            textAlign: 'center', 
            display: 'block',
            fontSize: '0.7rem',
            opacity: 0.8
          }}
        >
          © {new Date().getFullYear()} מערכת ניהול חכמה
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#7D879C', 
            textAlign: 'center', 
            display: 'block',
            fontSize: '0.65rem',
            opacity: 0.6,
            mt: 0.5
          }}
        >
          Built with ❤️ for efficiency
        </Typography>
      </Box>
    </Box>
  );

  return (
    <StyledDrawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? mobileOpen : true}
      onClose={isMobile ? onDrawerToggle : undefined}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        '& .MuiDrawer-paper': {
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {sidebarContent}
    </StyledDrawer>
  );
};

export default React.memo(DashboardSidebar);

