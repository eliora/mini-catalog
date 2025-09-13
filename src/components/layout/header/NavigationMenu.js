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
 * 
 * @param {Array} navigationItems - Menu structure data
 * @param {Object} anchorEl - Menu anchor elements state
 * @param {Function} handleMenuOpen - Menu open handler
 * @param {Function} handleMenuClose - Menu close handler
 * @param {Function} handleNavigation - Navigation handler
 * @param {Object} location - Current location for active state
 */

import React from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { KeyboardArrowDown as ArrowDownIcon } from '@mui/icons-material';

const NavigationMenu = ({
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
   * Renders a dropdown menu for a navigation item
   * Handles both simple lists and complex category-based menus
   */
  const renderDropdownMenu = (item) => {
    if (!item.submenu) return null;

    return (
      <Menu
        anchorEl={anchorEl[item.id]}
        open={Boolean(anchorEl[item.id])}
        onClose={() => handleMenuClose(item.id)}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: item.id === 'products' || item.id === 'makeup' ? 600 : 300,
            maxWidth: 800,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.05)'
          }
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {item.submenu[0]?.category ? (
          // Multi-column layout for complex menus
          <Box sx={{ p: 3, minWidth: 600 }}>
            <Grid container spacing={4}>
              {item.submenu.map((category, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
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
                    {category.category}
                  </Typography>
                  {category.items.map((subItem, subIndex) => (
                    <MenuItem 
                      key={subIndex}
                      onClick={() => handleMenuClose(item.id)}
                      sx={{ 
                        py: 0.75,
                        px: 0,
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText'
                        }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {subItem.label}
                      </Typography>
                    </MenuItem>
                  ))}
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          // Simple list layout
          <Box sx={{ minWidth: 250 }}>
            {item.submenu.map((subItem, index) => (
              <MenuItem 
                key={index}
                onClick={() => handleMenuClose(item.id)}
                sx={{ 
                  py: 1.5,
                  px: 3,
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText'
                  }
                }}
              >
                <Typography variant="body2">
                  {subItem.label}
                </Typography>
              </MenuItem>
            ))}
          </Box>
        )}
      </Menu>
    );
  };

  return (
    <Box 
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'grey.200',
        py: 2
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {navigationItems.map((item) => (
            <Box key={item.id}>
              <Button
                onClick={item.submenu ? (e) => handleMenuOpen(e, item.id) : () => item.route && handleNavigation(item.route)}
                endIcon={item.submenu ? <ArrowDownIcon sx={{ fontSize: 16 }} /> : null}
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                  px: 0,
                  py: 1.5,
                  borderRadius: 0,
                  textTransform: 'uppercase',
                  fontSize: '0.875rem',
                  letterSpacing: 1,
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#333',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      backgroundColor: 'primary.main'
                    }
                  },
                  // Active state for current page
                  ...(location?.pathname === item.route && {
                    color: 'primary.main',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
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
