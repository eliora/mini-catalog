/**
 * Size and Style Configurations for QuantityInput Component
 * 
 * Provides consistent sizing configurations across different
 * component sizes (small, medium, large).
 */

// Size configurations - optimized for double-digit display
export const sizeConfig = {
  small: {
    buttonSize: 32,
    textFieldWidth: 50,
    textFieldHeight: 32,
    fontSize: '0.875rem',
    iconSize: 18
  },
  medium: {
    buttonSize: 40,
    textFieldWidth: 60,
    textFieldHeight: 40,
    fontSize: '1rem',
    iconSize: 20
  },
  large: {
    buttonSize: 48,
    textFieldWidth: 70,
    textFieldHeight: 48,
    fontSize: '1.125rem',
    iconSize: 22
  }
};

/**
 * Get theme-based button styles
 */
export const getButtonStyles = (theme, variant, disabled) => {
  const baseStyles = {
    borderRadius: 1,
    transition: 'all 0.2s ease-in-out',
    minWidth: 'auto',
    border: variant === 'outlined' ? '1px solid' : 'none',
    borderColor: disabled ? theme.palette.divider : theme.palette.divider,
    color: disabled ? theme.palette.text.disabled : theme.palette.text.primary,
    backgroundColor: disabled ? theme.palette.action.disabledBackground : 'transparent',
    
    '&:hover': disabled ? {} : {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
      color: theme.palette.primary.main,
      transform: 'scale(1.05)',
    },
    
    '&:active': disabled ? {} : {
      transform: 'scale(0.95)',
      backgroundColor: theme.palette.action.selected,
    }
  };

  return baseStyles;
};

/**
 * Get text field styles based on variant and size
 */
export const getTextFieldStyles = (theme, variant, size) => {
  const config = sizeConfig[size];
  
  return {
    width: config.textFieldWidth,
    '& .MuiOutlinedInput-root': {
      height: config.textFieldHeight,
      fontSize: config.fontSize,
      fontWeight: 600,
      '& fieldset': {
        borderColor: variant === 'filled' ? 'transparent' : theme.palette.divider,
      },
      '&:hover fieldset': {
        borderColor: variant === 'filled' ? 'transparent' : theme.palette.primary.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: variant === 'filled' ? 'transparent' : theme.palette.primary.main,
        borderWidth: 2,
      },
    },
    '& input': {
      textAlign: 'center',
      padding: 0,
      MozAppearance: 'textfield',
      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
    }
  };
};
