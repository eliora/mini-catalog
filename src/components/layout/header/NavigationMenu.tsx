/**
 * NavigationMenu Component - Desktop navigation menu
 * 
 * Main navigation menu with dropdown submenus for desktop view.
 * Handles complex menu structures with categories and items.
 * 
 * Features:
 * - Multi-level dropdown menus
 * - Category-based organization for complex menus
 * - Simple list layout for basic menus
 * - Hover effects and smooth transitions
 * - Navigation routing integration
 * - TypeScript support with proper interfaces
 */

'use client';

import React from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import { KeyboardArrowDown as ArrowDownIcon } from '@mui/icons-material';
import { 
  NavigationItem, 
  NavigationCategory, 
  NavigationSubItem 
} from './NavigationData';

// Props interface
interface NavigationMenuProps {
  navigationItems: NavigationItem[];
  anchorEl: Record<string, HTMLElement | null>;
  handleMenuOpen: (event: React.MouseEvent<HTMLButtonElement>, menuId: string) => void;
  handleMenuClose: (menuId: string) => void;
  handleNavigation: (route: string) => void;
  location?: { pathname: string };
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  navigationItems,
  anchorEl,
  handleMenuOpen,
  handleMenuClose,
  handleNavigation,
  location
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Don't render on mobile
  if (isMobile) return null;

  /**
   * Handles navigation item click
   */
  const handleItemClick = (item: NavigationSubItem, menuId: string) => {
    handleMenuClose(menuId);
    if (item.route) {
      handleNavigation(item.route);
    }
  };

  /**
   * Check if item is a category
   */
  const isCategory = (item: NavigationSubItem | NavigationCategory): item is NavigationCategory => {
    return 'category' in item && 'items' in item;
  };

  /**
   * Renders a dropdown menu for a navigation item
   * Handles both simple lists and complex category-based menus
   */
  const renderDropdownMenu = (item: NavigationItem) => {
    if (!item.submenu) return null;

    const isComplexMenu = item.submenu.some(subItem => isCategory(subItem));
    const menuWidth = isComplexMenu ? 600 : 300;

    return (
      <Menu
        anchorEl={anchorEl[item.id]}
        open={Boolean(anchorEl[item.id])}
        onClose={() => handleMenuClose(item.id)}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: menuWidth,
            maxWidth: 800,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'visible',
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              left: 20,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          }
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {isComplexMenu ? (
          // Multi-column layout for complex menus
          <Box sx={{ p: 3, minWidth: 600 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {item.submenu!.map((subItem, index) => {
                if (isCategory(subItem)) {
                  return (
                    <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%' }, minWidth: 180 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: 'primary.main',
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: 1
                        }}
                      >
                        {subItem.category}
                      </Typography>
                      {subItem.items.map((nestedItem, nestedIndex) => (
                        <MenuItem 
                          key={nestedIndex}
                          onClick={() => handleItemClick(nestedItem, item.id)}
                          sx={{ 
                            py: 0.75,
                            px: 0,
                            borderRadius: 1,
                            mb: 0.5,
                            minHeight: 'auto',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                              color: 'primary.contrastText'
                            }
                          }}
                        >
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {nestedItem.label}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Box>
                  );
                }
                return null;
              })}
            </Box>
          </Box>
        ) : (
          // Simple list layout
          <Box sx={{ minWidth: 250, py: 1 }}>
            {item.submenu!.map((subItem, index) => {
              if (!isCategory(subItem)) {
                return (
                  <MenuItem 
                    key={index}
                    onClick={() => handleItemClick(subItem, item.id)}
                    sx={{ 
                      py: 1.5,
                      px: 3,
                      borderRadius: 0,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {subItem.label}
                    </Typography>
                  </MenuItem>
                );
              }
              return null;
            })}
          </Box>
        )}
      </Menu>
    );
  };

  /**
   * Check if navigation item is active
   */
  const isActiveItem = (item: NavigationItem): boolean => {
    if (!location?.pathname || !item.route) return false;
    return location.pathname === item.route || location.pathname.startsWith(item.route);
  };

  return (
    <Box 
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'grey.200',
        py: 2,
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar - 1
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: { md: 4, lg: 6 },
          flexWrap: 'wrap'
        }}>
          {navigationItems.map((item) => (
            <Box key={item.id} sx={{ position: 'relative' }}>
              <Button
                onClick={item.submenu ? 
                  (e) => handleMenuOpen(e, item.id) : 
                  () => item.route && handleNavigation(item.route)
                }
                endIcon={item.submenu ? 
                  <ArrowDownIcon sx={{ 
                    fontSize: 16,
                    transition: 'transform 0.2s ease',
                    transform: anchorEl[item.id] ? 'rotate(180deg)' : 'rotate(0deg)'
                  }} /> : 
                  null
                }
                sx={{
                  color: isActiveItem(item) ? 'primary.main' : 'text.primary',
                  fontWeight: isActiveItem(item) ? 600 : 500,
                  px: 0,
                  py: 1.5,
                  borderRadius: 0,
                  textTransform: 'uppercase',
                  fontSize: '0.875rem',
                  letterSpacing: 1,
                  position: 'relative',
                  minWidth: 'auto',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'primary.main',
                    transform: 'translateY(-1px)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      right: 0,
                      height: 2,
                      backgroundColor: 'primary.main',
                      transition: 'all 0.2s ease'
                    }
                  },
                  // Active state for current page
                  ...(isActiveItem(item) && {
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      right: 0,
                      height: 2,
                      backgroundColor: 'primary.main'
                    }
                  })
                }}
              >
                {item.label}
              </Button>
              {renderDropdownMenu(item)}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(NavigationMenu);
