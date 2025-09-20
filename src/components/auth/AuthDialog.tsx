/**
 * AUTHENTICATION DIALOG COMPONENT
 * ================================
 * 
 * This component provides a modal dialog for user authentication with tabbed
 * interface for sign-in and sign-up forms. It features responsive design,
 * smooth animations, and comprehensive form integration.
 * 
 * KEY FEATURES:
 * - Modal dialog with tabbed interface
 * - Sign-in and sign-up form integration
 * - Responsive design (full-screen on mobile)
 * - Smooth slide-up animation
 * - Form switching between sign-in and sign-up
 * - Success callback handling
 * - Close button with proper accessibility
 * - Sticky header with dynamic title
 * 
 * ARCHITECTURE:
 * - Uses Material-UI Dialog with custom transitions
 * - Tabbed interface with proper ARIA attributes
 * - Responsive design with useMediaQuery
 * - Form components integration (SignInForm, SignUpForm)
 * - Proper TypeScript interfaces and forwardRef usage
 * 
 * ACCESSIBILITY FEATURES:
 * - Proper ARIA labels and roles
 * - Keyboard navigation support
 * - Screen reader compatibility
 * - Focus management
 * - Tab panel accessibility
 * 
 * RESPONSIVE DESIGN:
 * - Full-screen mode on mobile devices
 * - Adaptive sizing for different screen sizes
 * - Proper overflow handling
 * - Custom scrollbar styling
 * 
 * ANIMATIONS:
 * - Slide-up transition for dialog appearance
 * - Smooth tab switching
 * - Hover effects on interactive elements
 * - Loading state animations
 * 
 * USAGE:
 * - Import and use in header components or pages
 * - Pass open/onClose props for dialog control
 * - Pass initialTab prop to start with specific form
 * - Pass onAuthSuccess callback for success handling
 * 
 * STYLING:
 * - Clean dialog design with rounded corners
 * - Sticky header with border separation
 * - Custom scrollbar for content area
 * - Responsive padding and margins
 * - Hebrew RTL text support
 * 
 * @file src/components/auth/AuthDialog.tsx
 * @author Authentication System
 * @version 1.0.0
 */

'use client';

import React, { useState, forwardRef, ReactElement, Ref } from 'react';
import {
  Dialog,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Slide,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

// Transition component for dialog animation
const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement;
  },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// TabPanel component with proper TypeScript typing
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Props interface for AuthDialog
interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  initialTab?: number;
  onAuthSuccess?: () => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ 
  open, 
  onClose, 
  initialTab = 0,
  onAuthSuccess 
}) => {
  const [tabValue, setTabValue] = useState<number>(initialTab);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle successful authentication
  const handleSuccess = () => {
    onAuthSuccess?.();
    onClose();
  };

  // Switch to sign up tab
  const switchToSignUp = () => {
    setTabValue(1);
  };

  // Switch to sign in tab
  const switchToSignIn = () => {
    setTabValue(0);
  };

  // Reset tab value when dialog opens
  React.useEffect(() => {
    if (open) {
      setTabValue(initialTab);
    }
  }, [open, initialTab]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          minHeight: fullScreen ? '100vh' : 'auto',
          maxHeight: fullScreen ? '100vh' : '90vh',
          overflow: 'hidden',
        }
      }}
      sx={{
        '& .MuiDialog-paper': {
          margin: fullScreen ? 0 : 2,
        }
      }}
    >
      {/* Header with close button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}>
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          {tabValue === 0 ? 'התחברות' : 'הרשמה'}
        </Typography>
        <IconButton
          aria-label="close dialog"
          onClick={onClose}
          sx={{
            color: 'grey.500',
            '&:hover': {
              backgroundColor: 'grey.100',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                minHeight: 48,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                '&.Mui-selected': {
                  fontWeight: 600,
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              }
            }}
          >
            <Tab 
              label="התחברות" 
              id="auth-tab-0"
              aria-controls="auth-tabpanel-0"
            />
            <Tab 
              label="הרשמה" 
              id="auth-tab-1"
              aria-controls="auth-tabpanel-1"
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box 
          sx={{ 
            p: 3,
            maxHeight: fullScreen ? 'calc(100vh - 140px)' : '70vh',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '3px',
            },
          }}
        >
          <TabPanel value={tabValue} index={0}>
            <SignInForm 
              onSuccess={handleSuccess}
              onSwitchToSignUp={switchToSignUp}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <SignUpForm 
              onSuccess={handleSuccess}
              onSwitchToSignIn={switchToSignIn}
            />
          </TabPanel>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;

