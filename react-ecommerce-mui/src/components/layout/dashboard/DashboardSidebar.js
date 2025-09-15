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
 * 
 * @param {number} activeTab - Currently active tab index
 * @param {Function} onTabChange - Tab change handler
 * @param {Object} stats - Dashboard statistics for badges
 * @param {boolean} mobileOpen - Mobile drawer open state
 * @param {Function} onDrawerToggle - Mobile drawer toggle handler
 */

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
  useMediaQuery
} from '@mui/material';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';

// Local imports
import { StyledDrawer, StyledListItemButton, SidebarHeader } from './DashboardStyles';
import { createNavigationItems } from './DashboardNavigation';

const DashboardSidebar = ({
  activeTab,
  onTabChange,
  stats = {},
  mobileOpen,
  onDrawerToggle
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Generate navigation items with current stats
  const navigationItems = createNavigationItems(stats);

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
              background: '#4E97FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(78, 151, 253, 0.24)',
            }}
          >
            <AdminIcon sx={{ fontSize: 22, color: '#FFFFFF' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: '#2B3445', fontWeight: 600, mb: 0.5, fontSize: '1rem' }}>
              מערכת ניהול חכמה
            </Typography>
            <Typography variant="caption" sx={{ color: '#7D879C', fontSize: '0.75rem' }}>
              לוח בקרה מתקדם
            </Typography>
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            p: 1.5, 
            borderRadius: '8px',
            background: '#F3F5F9',
            textAlign: 'center',
            border: '1px solid #E3E9EF'
          }}
        >
          <Typography variant="body2" sx={{ color: '#4B566B', mb: 0.5, fontSize: '0.75rem' }}>
            מערכת ניהול מתקדמת
          </Typography>
          <Typography variant="caption" sx={{ color: '#7D879C', fontSize: '0.7rem' }}>
            גרסה 3.0 - Light
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
                onClick={() => onTabChange(item.id)}
              >
                <ListItemIcon>
                  {item.badge !== null && item.badge > 0 ? (
                    <Badge 
                      badgeContent={item.badge} 
                      color="secondary"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          height: 16,
                          minWidth: 16,
                          right: -8,
                          top: -4,
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
                  secondaryTypographyProps={{
                    sx: { 
                      fontSize: '0.7rem', 
                      color: '#7D879C',
                      mt: 0.25
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
        <Typography variant="caption" sx={{ color: '#7D879C', textAlign: 'center', display: 'block' }}>
          © 2024 מערכת ניהול חכמה
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
    >
      {sidebarContent}
    </StyledDrawer>
  );
};

export default React.memo(DashboardSidebar);
