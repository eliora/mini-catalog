/**
 * MainToolbar Component - Main header toolbar
 * 
 * Main toolbar containing logo, search functionality, and action icons.
 * Responsive design with different layouts for desktop and mobile.
 * 
 * Features:
 * - Company logo display
 * - Desktop search bar with styling
 * - Mobile search icon
 * - Account menu integration
 * - Shopping cart with badge
 * - Responsive layout adaptation
 * 
 * @param {Object} companySettings - Company settings including logo
 * @param {number} cartItemCount - Number of items in cart
 * @param {string} searchTerm - Current search term
 * @param {Function} onSearchChange - Search change handler
 * @param {string} searchPlaceholder - Search input placeholder
 * @param {Function} handleAccountClick - Account menu click handler
 * @param {Function} handleCartClick - Cart click handler
 * @param {Function} onLogoClick - Logo click handler for navigation
 */

import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonOutline as PersonIcon,
  ShoppingCartOutlined as CartIcon
} from '@mui/icons-material';

const MainToolbar = ({
  companySettings,
  cartItemCount = 0,
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = "חיפוש מוצרים...",
  handleAccountClick,
  handleCartClick,
  onLogoClick
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto', width: '100%' }}>
        <Toolbar sx={{ px: { xs: 2, md: 3 }, py: 3, minHeight: '100px !important' }}>
          {/* Left spacer for desktop centering */}
          {!isMobile && <Box sx={{ flex: 1 }} />}

          {/* Centered Logo */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              mx: { xs: 'auto', md: 0 }
            }}
            onClick={onLogoClick}
          >
            {companySettings?.companyLogo ? (
              <Box
                component="img"
                src={companySettings.companyLogo}
                alt={companySettings.companyName || 'Jean D\'Arcel'}
                sx={{
                  height: { xs: 40, md: 60 },
                  width: 'auto'
                }}
              />
            ) : (
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 400,
                  color: '#333',
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontFamily: 'serif',
                  letterSpacing: 2
                }}
              >
                JEAN D'ARCEL
              </Typography>
            )}
          </Box>

          {/* Right side - Search and Icons */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center', 
            gap: 2 
          }}>
            {/* Search Bar - Desktop */}
            {!isMobile && (
              <Box sx={{ maxWidth: 350 }}>
                <TextField
                  fullWidth
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          sx={{ p: 0.5 }}
                        >
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      backgroundColor: 'transparent',
                      borderColor: '#ccc',
                      '&:hover': {
                        borderColor: '#999'
                      },
                      '&.Mui-focused': {
                        borderColor: '#333'
                      }
                    }
                  }}
                />
              </Box>
            )}

            {/* Action Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Search Icon - Mobile */}
              {isMobile && (
                <IconButton color="inherit">
                  <SearchIcon />
                </IconButton>
              )}
              
              {/* Account Icon */}
              <IconButton color="inherit" onClick={handleAccountClick} sx={{ p: 1 }}>
                <PersonIcon />
              </IconButton>
              
              {/* Cart Icon */}
              <IconButton color="inherit" onClick={handleCartClick} sx={{ p: 1 }}>
                <Badge badgeContent={cartItemCount} color="secondary">
                  <CartIcon />
                </Badge>
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  );
};

export default React.memo(MainToolbar);
