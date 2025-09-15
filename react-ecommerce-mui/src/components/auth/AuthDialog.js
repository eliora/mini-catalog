import React, { useState } from 'react';
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
  Slide
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function TabPanel({ children, value, index, ...other }) {
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

const AuthDialog = ({ open, onClose, initialTab = 0 }) => {
  const [tabValue, setTabValue] = useState(initialTab);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSuccess = () => {
    onClose();
  };

  const switchToSignUp = () => {
    setTabValue(1);
  };

  const switchToSignIn = () => {
    setTabValue(0);
  };

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
        borderColor: 'divider'
      }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          {tabValue === 0 ? 'התחברות' : 'הרשמה'}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'grey.500',
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
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
              }
            }}
          >
            <Tab label="התחברות" />
            <Tab label="הרשמה" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ p: 3 }}>
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
