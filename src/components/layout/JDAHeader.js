import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonOutline as PersonIcon,
  ShoppingCartOutlined as CartIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import useAdminAccess from '../../hooks/useAdminAccess';
import AuthDialog from '../auth/AuthDialog';

const JDAHeader = ({ 
  companySettings, 
  cartItemCount = 0, 
  searchTerm = '', 
  onSearchChange, 
  onClearSearch,
  searchPlaceholder = "חיפוש מוצרים..."
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  // Authentication hooks
  const { user, signOut } = useSupabaseAuth();
  const { isAdmin } = useAdminAccess();

  // Navigation menu structure exactly matching JDA website
  const navigationItems = [
    {
      id: 'newProducts',
      label: 'מוצרים חדשים',
      route: '/catalog?filter=new'
    },
    {
      id: 'skinNeeds',
      label: 'צרכי עור',
      submenu: [
        { label: 'עור יבש', value: 'dry' },
        { label: 'עור מעורב', value: 'combination' },
        { label: 'עור שמני', value: 'oily' },
        { label: 'עור רגיש', value: 'sensitive' },
        { label: 'עור בוגר', value: 'mature' },
        { label: 'עור רגיל', value: 'normal' }
      ]
    },
    {
      id: 'products',
      label: 'מוצרים',
      submenu: [
        {
          category: 'ניקוי פנים',
          items: [
            { label: 'קרם ניקוי', value: 'cleansing-cream' },
            { label: 'חלב ניקוי', value: 'cleansing-milk' },
            { label: 'ג\'ל ניקוי', value: 'cleansing-gel' },
            { label: 'קצף ניקוי', value: 'cleansing-foam' },
            { label: 'שמן ניקוי', value: 'cleansing-oil' },
            { label: 'מי פנים', value: 'toner' },
            { label: 'מסכת ניקוי', value: 'cleansing-mask' }
          ]
        },
        {
          category: 'טיפוח פנים',
          items: [
            { label: 'קרם יום', value: 'day-cream' },
            { label: 'קרם לילה', value: 'night-cream' },
            { label: 'טיפוח 24 שעות', value: '24h-care' },
            { label: 'סרום', value: 'serum' },
            { label: 'אמפולות', value: 'ampoules' }
          ]
        }
      ]
    },
    {
      id: 'makeupCollection',
      label: 'קולקציית איפור',
      submenu: [
        {
          category: 'איפור פנים',
          items: [
            { label: 'קונסילר', value: 'concealer' },
            { label: 'סומק', value: 'rouge' },
            { label: 'פודרה', value: 'powder' },
            { label: 'בסיס', value: 'foundation' }
          ]
        },
        {
          category: 'איפור עיניים',
          items: [
            { label: 'צלליות', value: 'eyeshadow' },
            { label: 'מסקרה', value: 'mascara' },
            { label: 'אייליינר', value: 'eyeliner' },
            { label: 'עיפרון גבות', value: 'eyebrow' }
          ]
        }
      ]
    },
    {
      id: 'productLines',
      label: 'קווי מוצרים',
      submenu: [
        { label: 'DÉMAQUILLANTE', value: 'demaquillante' },
        { label: 'hydratante', value: 'hydratante' },
        { label: 'sensitive', value: 'sensitive' },
        { label: 'purifiante', value: 'purifiante' },
        { label: 'ARCELMED', value: 'arcelmed' },
        { label: 'prestige', value: 'prestige' },
        { label: 'CAVIAR', value: 'caviar' }
      ]
    },
    {
      id: 'blog',
      label: 'בלוג',
      route: '/blog'
    }
  ];

  const handleMenuOpen = (event, menuId) => {
    setAnchorEl(prev => ({ ...prev, [menuId]: event.currentTarget }));
  };

  const handleMenuClose = (menuId) => {
    setAnchorEl(prev => ({ ...prev, [menuId]: null }));
  };

  const handleNavigation = (route) => {
    navigate(route);
  };

  const handleLogoClick = () => {
    navigate('/catalog');
  };

  const handleCartClick = () => {
    navigate('/orderform');
  };

  const handleAccountClick = (event) => {
    if (!user) {
      setAuthDialogOpen(true);
    } else {
      setAccountMenuAnchor(event.currentTarget);
    }
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleSignOut = async () => {
    handleAccountMenuClose();
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };


  const renderMegaMenu = (item) => {
    if (!item.submenu) return null;

    const isOpen = Boolean(anchorEl[item.id]);

    return (
      <Menu
        anchorEl={anchorEl[item.id]}
        open={isOpen}
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
    <Box>
      {/* Top Black Bar - exactly like JDA */}
      {!isMobile && (
        <Box 
          sx={{ 
            backgroundColor: '#1a1a1a',
            color: 'white',
            py: 1
          }}
        >
          <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Left side - Institute Search */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon sx={{ fontSize: 16, color: 'white' }} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  חיפוש מכון
                </Typography>
              </Box>
              
              {/* Right side - Navigation links */}
              <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {['אודות', 'שותפים', 'קריירה', 'עיתונות'].map((item, index) => (
                  <Typography 
                    key={index}
                    variant="caption" 
                    sx={{ 
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        color: 'grey.300'
                      }
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Main Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          color: 'text.primary'
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: 'auto', width: '100%' }}>
          <Toolbar sx={{ px: { xs: 2, md: 3 }, py: 3, minHeight: '100px !important' }}>
            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                sx={{ mr: 2 }}
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
                mx: { xs: 'auto', md: 0 }
              }}
              onClick={handleLogoClick}
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

      {/* Navigation Menu - Desktop */}
      {!isMobile && (
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
                      ...(location.pathname === item.route && {
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
                  {renderMegaMenu(item)}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Account Menu */}
      <Menu
        anchorEl={accountMenuAnchor}
        open={Boolean(accountMenuAnchor)}
        onClose={handleAccountMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.05)'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { handleAccountMenuClose(); console.log('Profile clicked'); }} sx={{ py: 1.5, px: 2 }}>
          <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography>הפרופיל שלי</Typography>
        </MenuItem>
        <MenuItem onClick={() => { handleAccountMenuClose(); navigate('/orderform'); }} sx={{ py: 1.5, px: 2 }}>
          <CartIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography>ההזמנות שלי</Typography>
        </MenuItem>
        <Divider />
        {isAdmin && (
          <MenuItem onClick={() => { handleAccountMenuClose(); navigate('/admin'); }} sx={{ py: 1.5, px: 2 }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 600 }}>ניהול מערכת</Typography>
          </MenuItem>
        )}
        {isAdmin && <Divider />}
        <MenuItem onClick={handleSignOut} sx={{ py: 1.5, px: 2 }}>
          <Typography sx={{ color: 'error.main' }}>התנתק</Typography>
        </MenuItem>
      </Menu>

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        initialTab={0}
      />

    </Box>
  );
};

export default JDAHeader;
