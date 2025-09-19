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
 * - TypeScript support with proper interfaces
 */

'use client';

import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { CompanySettings } from '@/types/company';

// Props interface
interface TopBarProps {
  companySettings?: CompanySettings | null;
  showContactInfo?: boolean;
  onInstituteSearch?: () => void;
}

// Navigation items for top bar
const topBarNavItems = [
  { label: 'אודות', href: '/about' },
  { label: 'שותפים', href: '/partners' },
  { label: 'קריירה', href: '/careers' },
  { label: 'עיתונות', href: '/press' },
] as const;

const TopBar: React.FC<TopBarProps> = ({ 
  companySettings, 
  showContactInfo = true,
  onInstituteSearch 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Don't render on mobile
  if (isMobile) return null;

  // Handle institute search click
  const handleInstituteSearch = () => {
    if (onInstituteSearch) {
      onInstituteSearch();
    } else {
      // Default behavior - could open a search dialog
      console.log('Institute search clicked');
    }
  };

  // Handle navigation item click
  const handleNavClick = (href: string) => {
    // In a real app, you'd use Next.js router here
    if (typeof window !== 'undefined') {
      window.location.href = href;
    }
  };

  return (
    <Box 
      sx={{ 
        backgroundColor: '#1a1a1a',
        color: 'white',
        py: 1,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          minHeight: 32
        }}>
          {/* Left side - Institute Search & Contact */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Institute Search */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 1,
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onClick={handleInstituteSearch}
            >
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

            {/* Contact Information */}
            {showContactInfo && companySettings && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {companySettings.company_phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PhoneIcon sx={{ fontSize: 14, color: 'grey.400' }} />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'grey.300',
                        fontSize: '0.7rem'
                      }}
                    >
                      {companySettings.company_phone}
                    </Typography>
                  </Box>
                )}
                
                {companySettings.company_email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EmailIcon sx={{ fontSize: 14, color: 'grey.400' }} />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'grey.300',
                        fontSize: '0.7rem'
                      }}
                    >
                      {companySettings.company_email}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Right side - Navigation links */}
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {topBarNavItems.map((item, index) => (
              <Typography 
                key={index}
                variant="caption" 
                component="button"
                onClick={() => handleNavClick(item.href)}
                sx={{ 
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'grey.300',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  },
                  '&:focus': {
                    outline: '2px solid rgba(255, 255, 255, 0.3)',
                    outlineOffset: 2
                  }
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(TopBar);

