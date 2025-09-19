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
 * - TypeScript support with proper interfaces
 */

'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Drawer,
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonOutline as PersonIcon,
  Menu as MenuIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { CompanySettings } from '@/types/company';
import CartBadge from '@/components/common/CartBadge';

// Props interface
interface MainToolbarProps {
  companySettings?: CompanySettings | null;
  cartItemCount?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onSearchClear?: () => void;
  searchPlaceholder?: string;
  handleAccountClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleCartClick?: () => void;
  onLogoClick?: () => void;
  onMenuToggle?: () => void;
  showSearch?: boolean;
  elevation?: number;
}

// Search component for mobile drawer
interface MobileSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchClear?: () => void;
  placeholder: string;
  onClose: () => void;
}

const MobileSearch: React.FC<MobileSearchProps> = ({
  searchTerm,
  onSearchChange,
  onSearchClear,
  placeholder,
  onClose
}) => (
  <Box sx={{ p: 2 }}>
    <TextField
      fullWidth
      autoFocus
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: searchTerm ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={() => {
                onSearchClear?.();
                onClose();
              }}
              edge="end"
            >
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ) : undefined,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        }
      }}
    />
  </Box>
);

const MainToolbar: React.FC<MainToolbarProps> = ({
  companySettings,
  cartItemCount = 0,
  searchTerm = '',
  onSearchChange,
  onSearchClear,
  searchPlaceholder = "חיפוש מוצרים...",
  handleAccountClick,
  handleCartClick,
  onLogoClick,
  onMenuToggle,
  showSearch = true,
  elevation = 0
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Handle search change with validation
  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  // Handle mobile search toggle
  const handleMobileSearchToggle = () => {
    setMobileSearchOpen(!mobileSearchOpen);
  };

  // Handle mobile search close
  const handleMobileSearchClose = () => {
    setMobileSearchOpen(false);
  };

  // Get company name and logo from settings
  const companyName = companySettings?.company_name || '';
  const logoUrl = companySettings?.logo_url || companySettings?.company_logo;

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={elevation}
        sx={{ 
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          zIndex: theme.zIndex.appBar
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: 'auto', width: '100%' }}>
          <Toolbar sx={{ 
            px: { xs: 2, md: 3 }, 
            py: { xs: 2, md: 3 }, 
            minHeight: { xs: '80px', md: '100px' },
            gap: 2
          }}>
            {/* Mobile Menu Button */}
            {isMobile && onMenuToggle && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={onMenuToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Left spacer for desktop centering */}
            {!isMobile && <Box sx={{ flex: 1 }} />}

            {/* Centered Logo */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                mx: { xs: 'auto', md: 0 },
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
              onClick={onLogoClick}
              role="button"
              tabIndex={0}
              aria-label={`Navigate to home - ${companyName}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onLogoClick?.();
                }
              }}
            >
              {logoUrl ? (
                <Box
                  component="img"
                  src={logoUrl}
                  alt={companyName}
                  sx={{
                    height: { xs: 40, md: 60 },
                    width: 'auto',
                    maxWidth: { xs: 150, md: 200 }
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
                    letterSpacing: 2,
                    textAlign: 'center'
                  }}
                >
                  {companyName.toUpperCase()}
                </Typography>
              )}
            </Box>

            {/* Right side - Search and Icons */}
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center', 
              gap: { xs: 1, md: 2 }
            }}>
              {/* Search Bar - Desktop */}
              {!isMobile && showSearch && (
                <Box sx={{ maxWidth: 350, width: '100%' }}>
                  <TextField
                    fullWidth
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {searchTerm ? (
                            <IconButton
                              size="small"
                              onClick={onSearchClear}
                              sx={{ p: 0.5 }}
                              aria-label="Clear search"
                            >
                              <ClearIcon />
                            </IconButton>
                          ) : (
                            <IconButton
                              size="small"
                              sx={{ p: 0.5 }}
                              aria-label="Search"
                            >
                              <SearchIcon />
                            </IconButton>
                          )}
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        backgroundColor: 'transparent',
                        borderColor: '#ccc',
                        transition: 'border-color 0.2s ease',
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
                {/* Search Icon - Mobile */}
                {isMobile && showSearch && (
                  <IconButton 
                    color="inherit" 
                    onClick={handleMobileSearchToggle}
                    aria-label="Open search"
                    sx={{ p: 1 }}
                  >
                    <SearchIcon />
                  </IconButton>
                )}
                
                {/* Account Icon */}
                <IconButton 
                  color="inherit" 
                  onClick={handleAccountClick} 
                  sx={{ p: 1 }}
                  aria-label="Account menu"
                >
                  <PersonIcon />
                </IconButton>
                
                {/* Cart Icon */}
                <CartBadge 
                  cartItemCount={cartItemCount || 0}
                  onCartClick={handleCartClick}
                />
              </Box>
            </Box>
          </Toolbar>
        </Box>
      </AppBar>

      {/* Mobile Search Drawer */}
      <Drawer
        anchor="top"
        open={mobileSearchOpen}
        onClose={handleMobileSearchClose}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor: 'background.paper',
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <MobileSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearchClear={onSearchClear}
          placeholder={searchPlaceholder}
          onClose={handleMobileSearchClose}
        />
      </Drawer>
    </>
  );
};

export default React.memo(MainToolbar);

