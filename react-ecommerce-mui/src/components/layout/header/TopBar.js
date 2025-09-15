/**
 * TopBar Component - Top black information bar
 * 
 * Top bar with contact information and institute search functionality.
 * Displays only on desktop, hidden on mobile devices.
 * 
 * Features:
 * - Institute location search
 * - Contact information display (phone, email)
 * - Responsive design (desktop only)
 * - Dark theme styling matching JDA website
 * 
 * @param {Object} companySettings - Company contact information
 */

import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import {
  LocationOn as LocationIcon
} from '@mui/icons-material';

const TopBar = ({ companySettings }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Don't render on mobile
  if (isMobile) return null;

  return (
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
  );
};

export default React.memo(TopBar);
