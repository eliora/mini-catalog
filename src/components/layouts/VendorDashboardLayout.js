import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  IconButton,
  Badge,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  Assessment as ReportsIcon,
  CloudUpload as ImportIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

const drawerWidth = 280;

// Light, compact Bazaar Pro inspired design
const StyledDrawer = styled(Drawer)(({ theme }) => ({
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

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: '#FFFFFF',
  color: '#2B3445',
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
  borderBottom: '1px solid #F3F5F9',
  minHeight: 64,
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
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

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  background: '#F6F9FC',
  minHeight: '100vh',
  paddingTop: theme.spacing(1),
}));

const ContentArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  maxWidth: '100%',
  margin: '0 auto',
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1.5, 2),
  borderBottom: '1px solid #F3F5F9',
  marginBottom: theme.spacing(1),
}));

const SidebarFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: 'auto',
  borderTop: '1px solid #F3F5F9',
}));

const VendorDashboardLayout = ({ 
  children, 
  onLogout, 
  activeTab = 0, 
  onTabChange,
  stats = {},
  userInfo = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(null);

  const menuItems = [
    { 
      id: 0, 
      label: 'סקירה כללית', 
      icon: <DashboardIcon />, 
      description: 'לוח בקרה ראשי',
      badge: null
    },
    { 
      id: 1, 
      label: 'מוצרים', 
      icon: <ProductsIcon />, 
      description: 'ניהול קטלוג המוצרים',
      badge: stats.products || 0
    },
    { 
      id: 2, 
      label: 'הזמנות', 
      icon: <OrdersIcon />, 
      description: 'מעקב אחר הזמנות',
      badge: stats.orders || 0
    },
    { 
      id: 3, 
      label: 'לקוחות', 
      icon: <CustomersIcon />, 
      description: 'ניהול בסיס הלקוחות',
      badge: stats.customers || 0
    },
    { 
      id: 4, 
      label: 'דוחות', 
      icon: <ReportsIcon />, 
      description: 'דוחות ואנליטיקה',
      badge: null
    },
    { 
      id: 5, 
      label: 'ייבוא נתונים', 
      icon: <ImportIcon />, 
      description: 'ייבוא מוצרים מקובץ',
      badge: null
    },
    { 
      id: 6, 
      label: 'הגדרות', 
      icon: <SettingsIcon />, 
      description: 'הגדרות מערכת וחברה',
      badge: null
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenu(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenu(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    onLogout();
  };

  const drawer = (
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

      {/* Navigation */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <StyledListItemButton
              active={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
            >
              <ListItemIcon>
                {item.badge ? (
                  <Badge 
                    badgeContent={item.badge} 
                    color="primary"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#4E97FD',
                        color: 'white',
                        fontSize: '0.625rem',
                        minWidth: 16,
                        height: 16,
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
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.875rem',
                  }
                }}
              />
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <SidebarFooter>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            p: 1.5,
            borderRadius: '8px',
            background: '#F3F5F9',
            cursor: 'pointer',
            '&:hover': {
              background: '#E3E9EF'
            }
          }}
          onClick={handleProfileMenuOpen}
        >
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36,
              background: '#4E97FD',
              fontSize: '0.875rem'
            }}
          >
            <PersonIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2B3445', fontSize: '0.875rem' }}>
              מנהל המערכת
            </Typography>
            <Typography variant="caption" sx={{ color: '#7D879C', fontSize: '0.75rem' }}>
              מחובר כעת
            </Typography>
          </Box>
        </Box>
      </SidebarFooter>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <StyledAppBar position="fixed">
        <Toolbar sx={{ minHeight: '64px !important' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '1.125rem' }}>
            {menuItems.find(item => item.id === activeTab)?.label || 'לוח בקרה'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              icon={<AdminIcon sx={{ fontSize: 16 }} />}
              label="מנהל"
              size="small"
              sx={{
                backgroundColor: '#F6F9FC',
                color: '#4E97FD',
                borderColor: '#DAE1E7',
                fontWeight: 600
              }}
              variant="outlined"
            />
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                background: '#FFFFFF',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <StyledDrawer variant="permanent" open>
            {drawer}
          </StyledDrawer>
        )}
      </Box>

      {/* Main content */}
      <MainContent component="main" sx={{ width: { lg: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenu}
        open={Boolean(profileMenu)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #F3F5F9',
            minWidth: 180,
          }
        }}
      >
        <MenuItem onClick={handleLogout} sx={{ color: '#7D879C', fontSize: '0.875rem' }}>
          <LogoutIcon sx={{ mr: 1, fontSize: 18 }} />
          התנתק
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default VendorDashboardLayout;