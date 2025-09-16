import { createTheme } from '@mui/material/styles';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';

// Create RTL cache with enhanced configuration for Next.js
export const createRtlCache = () => {
  return createCache({
    key: 'muirtl-deep',
    stylisPlugins: [prefixer, rtlPlugin],
  });
};

// Deep shadow system inspired by modern design
const deepShadows = {
  0: 'none',
  1: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
  2: '0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
  3: '0 8px 32px rgba(0, 0, 0, 0.16), 0 4px 16px rgba(0, 0, 0, 0.08)',
  4: '0 12px 48px rgba(0, 0, 0, 0.20), 0 6px 24px rgba(0, 0, 0, 0.10)',
  5: '0 16px 64px rgba(0, 0, 0, 0.24), 0 8px 32px rgba(0, 0, 0, 0.12)',
  6: '0 20px 80px rgba(0, 0, 0, 0.28), 0 10px 40px rgba(0, 0, 0, 0.14)',
  7: '0 24px 96px rgba(0, 0, 0, 0.32), 0 12px 48px rgba(0, 0, 0, 0.16)',
  8: '0 32px 128px rgba(0, 0, 0, 0.36), 0 16px 64px rgba(0, 0, 0, 0.18)',
  // Enhanced depth shadows
  depth1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
  depth2: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.10)',
  depth3: '0 6px 20px rgba(0, 0, 0, 0.20), 0 6px 20px rgba(0, 0, 0, 0.12)',
  depth4: '0 12px 40px rgba(0, 0, 0, 0.24), 0 12px 40px rgba(0, 0, 0, 0.14)',
  depth5: '0 24px 80px rgba(0, 0, 0, 0.28), 0 24px 80px rgba(0, 0, 0, 0.16)',
  // Light soft shadows
  primaryShadow: '0 4px 16px rgba(78, 151, 253, 0.24), 0 2px 8px rgba(78, 151, 253, 0.12)',
  secondaryShadow: '0 4px 16px rgba(75, 86, 107, 0.16), 0 2px 8px rgba(75, 86, 107, 0.08)',
  successShadow: '0 4px 16px rgba(51, 208, 103, 0.20), 0 2px 8px rgba(51, 208, 103, 0.10)',
  warningShadow: '0 4px 16px rgba(250, 140, 22, 0.20), 0 2px 8px rgba(250, 140, 22, 0.10)',
  errorShadow: '0 4px 16px rgba(233, 69, 96, 0.24), 0 2px 8px rgba(233, 69, 96, 0.12)',
  // Inset shadows for depth
  inset: 'inset 0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(0, 0, 0, 0.04)',
  insetDeep: 'inset 0 4px 8px rgba(0, 0, 0, 0.12), inset 0 2px 4px rgba(0, 0, 0, 0.06)',
} as const;

// Light Bazaar Pro inspired color palette
const deepColors = {
  primary: {
    50: '#DBF0FE',
    100: '#B8DEFE',
    200: '#94C9FE',
    300: '#7AB6FD',
    400: '#7AB6FD',
    500: '#4E97FD',
    600: '#3975D9',
    700: '#2756B6',
    800: '#183C92',
    900: '#0E2979',
    main: '#4E97FD',
    light: '#7AB6FD',
    dark: '#2756B6',
    contrastText: '#FFFFFF',
  },
  secondary: {
    50: '#F6F9FC',
    100: '#F3F5F9',
    200: '#E3E9EF',
    300: '#DAE1E7',
    400: '#AEB4BE',
    500: '#7D879C',
    600: '#4B566B',
    700: '#373F50',
    800: '#2B3445',
    900: '#1F2937',
    main: '#4B566B',
    light: '#AEB4BE',
    dark: '#2B3445',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F6F9FC',
    paper: '#FFFFFF',
    elevated: '#FFFFFF',
    section: '#F3F5F9',
    subtle: '#E3E9EF',
  },
  grey: {
    25: '#fcfcfc',
    50: '#F6F9FC',
    100: '#F3F5F9',
    200: '#E3E9EF',
    300: '#DAE1E7',
    400: '#AEB4BE',
    500: '#7D879C',
    600: '#4B566B',
    700: '#373F50',
    800: '#2B3445',
    900: '#1F2937',
  },
  success: {
    100: '#E7F9ED',
    200: '#C2F1D1',
    300: '#99E8B3',
    400: '#52D77E',
    500: '#33D067',
    600: '#2ECB5F',
    700: '#27C454',
    800: '#20BE4A',
    900: '#0b7724',
    main: '#33D067',
    light: '#52D77E',
    dark: '#27C454',
    contrastText: '#FFFFFF',
  },
  error: {
    100: '#FFEAEA',
    200: '#FFCBCB',
    300: '#FFA9A9',
    400: '#FF6D6D',
    500: '#FF5353',
    600: '#FF4C4C',
    700: '#FF4242',
    800: '#FF3939',
    900: '#FF2929',
    main: '#E94560',
    light: '#FF6D6D',
    dark: '#FF4242',
    contrastText: '#FFFFFF',
  },
  warning: {
    100: '#FFF8E5',
    main: '#FA8C16',
    dark: '#C86904',
    light: '#FDD8AF',
    contrastText: '#FFFFFF'
  },
  info: {
    100: '#DBF0FE',
    200: '#B8DEFE',
    300: '#94C9FE',
    400: '#7AB6FD',
    500: '#4E97FD',
    600: '#3975D9',
    700: '#2756B6',
    800: '#183C92',
    900: '#0E2979',
    main: '#4E97FD',
    light: '#7AB6FD',
    dark: '#2756B6',
    contrastText: '#FFFFFF'
  },
} as const;

// Light Bazaar Pro inspired gradient system
const deepGradients = {
  primary: 'linear-gradient(135deg, #4E97FD 0%, #3975D9 50%, #2756B6 100%)',
  primaryLight: 'linear-gradient(135deg, #DBF0FE 0%, #B8DEFE 50%, #94C9FE 100%)',
  secondary: 'linear-gradient(135deg, #4B566B 0%, #373F50 50%, #2B3445 100%)',
  secondaryLight: 'linear-gradient(135deg, #F6F9FC 0%, #F3F5F9 50%, #E3E9EF 100%)',
  success: 'linear-gradient(135deg, #33D067 0%, #2ECB5F 50%, #27C454 100%)',
  warning: 'linear-gradient(135deg, #FA8C16 0%, #FB9C37 50%, #FCB05F 100%)',
  error: 'linear-gradient(135deg, #E94560 0%, #FF5353 50%, #FF6D6D 100%)',
  info: 'linear-gradient(135deg, #4E97FD 0%, #7AB6FD 50%, #94C9FE 100%)',
  neutral: 'linear-gradient(135deg, #FFFFFF 0%, #F6F9FC 50%, #F3F5F9 100%)',
  dark: 'linear-gradient(135deg, #2B3445 0%, #373F50 50%, #4B566B 100%)',
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)',
  // Light special gradients
  subtle: 'linear-gradient(135deg, #F6F9FC 0%, #F3F5F9 50%, #E3E9EF 100%)',
  card: 'linear-gradient(135deg, #FFFFFF 0%, #F6F9FC 50%, #F3F5F9 100%)',
  soft: 'linear-gradient(135deg, #F3F5F9 0%, #E3E9EF 50%, #DAE1E7 100%)',
  accent: 'linear-gradient(135deg, #4E97FD15 0%, #4E97FD08 50%, transparent 100%)',
} as const;

// Create enhanced theme
export const createDeepTheme = () => {
  const theme = createTheme({
    direction: 'rtl',
    
    palette: {
      ...deepColors,
      mode: 'light',
    },
    
    typography: {
      fontFamily: [
        'Heebo',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      
      h1: {
        fontSize: '2.5rem',
        fontWeight: 800,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 700,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        fontWeight: 400,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        fontWeight: 400,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none' as const,
        letterSpacing: '0.02em',
      },
    },
    
    shape: {
      borderRadius: 12,
    },
    
    spacing: 8,
    
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: deepColors.background.default,
            backgroundImage: deepGradients.neutral,
          },
        },
      },
      
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${deepColors.grey[200]}`,
            backdropFilter: 'blur(20px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          elevation1: {
            boxShadow: deepShadows.depth1,
            '&:hover': {
              boxShadow: deepShadows.depth2,
              transform: 'translateY(-1px)',
            },
          },
          elevation2: {
            boxShadow: deepShadows.depth2,
            '&:hover': {
              boxShadow: deepShadows.depth3,
              transform: 'translateY(-2px)',
            },
          },
          elevation3: {
            boxShadow: deepShadows.depth3,
            '&:hover': {
              boxShadow: deepShadows.depth4,
              transform: 'translateY(-3px)',
            },
          },
        },
      },
      
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: `1px solid ${deepColors.grey[200]}`,
            boxShadow: deepShadows.depth2,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            position: 'relative',
            
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
              zIndex: 1,
            },
            
            '&:hover': {
              boxShadow: deepShadows.depth4,
              transform: 'translateY(-8px) scale(1.02)',
              borderColor: deepColors.primary[300],
            },
          },
        },
      },
      
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '12px 24px',
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none' as const,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              transition: 'left 0.6s ease',
            },
            
            '&:hover::before': {
              left: '100%',
            },
          },
          
          contained: {
            boxShadow: deepShadows.depth2,
            '&:hover': {
              boxShadow: deepShadows.depth3,
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: deepShadows.depth1,
            },
          },
          
          containedPrimary: {
            background: deepGradients.primary,
            boxShadow: deepShadows.primaryShadow,
            '&:hover': {
              background: deepGradients.primary,
              boxShadow: deepShadows.primaryShadow,
              filter: 'brightness(1.1)',
            },
          },
          
          outlined: {
            borderWidth: 2,
            borderColor: deepColors.grey[300],
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              borderColor: deepColors.primary.main,
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              transform: 'translateY(-2px)',
              boxShadow: deepShadows.depth2,
            },
          },
        },
      },
      
      MuiTabs: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: 16,
            padding: '8px',
            border: `1px solid ${deepColors.grey[200]}`,
            boxShadow: deepShadows.depth3,
            position: 'relative',
            
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
            },
          },
          indicator: {
            display: 'none', // We'll use custom styling for tabs
          },
        },
      },
      
      MuiTab: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            margin: '0 4px',
            minHeight: 48,
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none' as const,
            color: deepColors.grey[600],
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 12,
              padding: '2px',
              background: 'linear-gradient(135deg, transparent, rgba(25, 118, 210, 0.1), transparent)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            },
            
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              color: deepColors.primary.main,
              transform: 'translateY(-2px)',
              boxShadow: deepShadows.depth1,
              
              '&::before': {
                opacity: 1,
              },
            },
            
            '&.Mui-selected': {
              background: deepGradients.primary,
              color: '#fff',
              boxShadow: deepShadows.primaryShadow,
              transform: 'translateY(-2px)',
              
              '&:hover': {
                background: deepGradients.primary,
                filter: 'brightness(1.1)',
              },
            },
          },
        },
      },
      
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${deepColors.grey[200]}`,
            boxShadow: deepShadows.depth2,
            color: deepColors.grey[800],
          },
        },
      },
      
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${deepColors.grey[200]}`,
            boxShadow: deepShadows.depth2,
            overflow: 'hidden',
          },
        },
      },
      
      MuiTableHead: {
        styleOverrides: {
          root: {
            background: deepGradients.neutral,
            borderBottom: `2px solid ${deepColors.grey[200]}`,
          },
        },
      },
      
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.1em',
            color: deepColors.grey[700],
            padding: '20px 16px',
          },
          body: {
            fontSize: '0.875rem',
            fontWeight: 500,
            padding: '16px',
            borderBottom: `1px solid ${deepColors.grey[100]}`,
          },
        },
      },
    },
    
    // Custom shadow system - MUI expects 25 shadow values (0-24)
    shadows: [
      'none', // 0
      deepShadows[1], // 1
      deepShadows[2], // 2
      deepShadows[3], // 3
      deepShadows[4], // 4
      deepShadows[5], // 5
      deepShadows[6], // 6
      deepShadows[7], // 7
      deepShadows[8], // 8
      deepShadows[8], // 9 - reuse 8
      deepShadows[8], // 10 - reuse 8
      deepShadows[8], // 11 - reuse 8
      deepShadows[8], // 12 - reuse 8
      deepShadows[8], // 13 - reuse 8
      deepShadows[8], // 14 - reuse 8
      deepShadows[8], // 15 - reuse 8
      deepShadows[8], // 16 - reuse 8
      deepShadows[8], // 17 - reuse 8
      deepShadows[8], // 18 - reuse 8
      deepShadows[8], // 19 - reuse 8
      deepShadows[8], // 20 - reuse 8
      deepShadows[8], // 21 - reuse 8
      deepShadows[8], // 22 - reuse 8
      deepShadows[8], // 23 - reuse 8
      deepShadows[8], // 24 - reuse 8 (for Dialog default elevation)
    ] as any,
  });
  
  // Add custom properties
  (theme as any).customShadows = deepShadows;
  (theme as any).gradients = deepGradients;
  (theme as any).deepColors = deepColors;
  
  return theme;
};

export default createDeepTheme;
