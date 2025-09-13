import React, { useState, useRef, useEffect } from 'react';
import {
  IconButton,
  TextField,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { createSvgIcon } from '@mui/material/utils';

// Custom Plus Icon using proper SVG path
const PlusIcon = createSvgIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
  'Plus'
);

// Custom Minus Icon using proper SVG path  
const MinusIcon = createSvgIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />,
  'Minus'
);

const QuantityInput = ({
  value = 0,
  onChange,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  size = 'medium',
  variant = 'outlined',
  disabled = false,
  ...props
}) => {
  const theme = useTheme();
  const [localValue, setLocalValue] = useState(value?.toString() || '0');
  const isTypingRef = useRef(false);
  const timeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Size configurations - optimized for double-digit display
  const sizeConfig = {
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

  const config = sizeConfig[size] || sizeConfig.medium;

  // Variant styles - modern and accessible
  const getVariantStyles = () => {
    switch (variant) {
      case 'contained':
        return {
          button: {
            backgroundColor: 'transparent',
            color: theme.palette.primary.main,
            border: 'none',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
            '&:disabled': {
              color: theme.palette.action.disabled,
            }
          },
          textField: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.paper,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              }
            }
          }
        };
      case 'outlined':
        return {
          button: {
            border: 'none',
            backgroundColor: 'transparent',
            color: theme.palette.text.primary,
            borderRadius: 0,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
            '&:disabled': {
              color: theme.palette.action.disabled,
            }
          },
          textField: {
            '& .MuiOutlinedInput-root': {
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              }
            }
          }
        };
      case 'minimal':
        return {
          button: {
            backgroundColor: 'transparent',
            color: theme.palette.text.secondary,
            border: 'none',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
            },
            '&:disabled': {
              color: theme.palette.action.disabled,
            }
          },
          textField: {
            '& .MuiOutlinedInput-root': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.grey[500], 0.3),
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              }
            }
          }
        };
      default:
        return getVariantStyles().outlined;
    }
  };

  const styles = getVariantStyles();

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    
    // Mark as typing and clear any existing timeout
    isTypingRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Allow empty string for user to clear and retype
    if (newValue === '') {
      setLocalValue('');
      // Debounce the onChange call
      timeoutRef.current = setTimeout(() => {
        onChange?.(0);
        isTypingRef.current = false;
      }, 500);
      return;
    }

    // Only allow numeric input
    if (/^\d+$/.test(newValue)) {
      const numericValue = parseInt(newValue, 10);
      
      // Always update local value for immediate visual feedback
      setLocalValue(newValue);
      
      // Debounce the onChange call to prevent rapid parent updates
      timeoutRef.current = setTimeout(() => {
        if (numericValue >= min && numericValue <= max) {
          onChange?.(numericValue);
        } else if (numericValue > max) {
          // Cap at max value
          setLocalValue(max.toString());
          onChange?.(max);
        } else if (numericValue < min) {
          // Set to min value
          setLocalValue(min.toString());
          onChange?.(min);
        }
        isTypingRef.current = false;
      }, 300);
    }
  };

  const handleInputBlur = () => {
    // Clear any pending timeouts and execute immediately
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    isTypingRef.current = false;
    
    // Handle final value validation
    if (localValue === '') {
      const resetValue = Math.max(value || min, min);
      setLocalValue(resetValue.toString());
      onChange?.(resetValue);
    } else {
      const numericValue = parseInt(localValue, 10);
      if (numericValue >= min && numericValue <= max) {
        onChange?.(numericValue);
      } else if (numericValue > max) {
        setLocalValue(max.toString());
        onChange?.(max);
      } else if (numericValue < min) {
        setLocalValue(min.toString());
        onChange?.(min);
      }
    }
  };

  const handleKeyDown = (event) => {
    // Prevent page scroll on arrow keys and other navigation keys
    if (['ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) {
      event.preventDefault();
    }
    
    // Handle Enter key to blur the input
    if (event.key === 'Enter') {
      event.target.blur();
    }
  };

  const handleFocus = (event) => {
    isTypingRef.current = true;
    // Don't auto-select text to allow multi-digit typing
    // Remove scroll manipulation as it may cause jumping
  };

  const handleDecrement = () => {
    const currentValue = parseInt(localValue, 10) || 0;
    const newValue = Math.max(currentValue - 1, min);
    setLocalValue(newValue.toString());
    
    // Call onChange for direct quantity updates, OR onDecrement for custom logic
    if (onChange) {
      onChange(newValue);
    } else {
      onDecrement?.();
    }
  };

  const handleIncrement = () => {
    const currentValue = parseInt(localValue, 10) || 0;
    const newValue = Math.min(currentValue + 1, max);
    setLocalValue(newValue.toString());
    
    // Call onChange for direct quantity updates, OR onIncrement for custom logic  
    if (onChange) {
      onChange(newValue);
    } else {
      onIncrement?.();
    }
  };

  // Update local value when prop changes, but only if user isn't currently typing
  useEffect(() => {
    if (!isTypingRef.current) {
      setLocalValue(value?.toString() || '0');
    }
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Stack 
      direction="row" 
      alignItems="center" 
      spacing={0}
      sx={{
        display: 'inline-flex',
        borderRadius: '8px',
        overflow: 'hidden',
        border: `2px solid ${theme.palette.divider}`,
        '&:hover': {
          borderColor: theme.palette.primary.main,
        },
        '&:focus-within': {
          borderColor: theme.palette.primary.main,
        },
        ...props.sx
      }}
      {...props}
    >
      {/* Minus Button */}
      <IconButton
        onClick={handleDecrement}
        disabled={disabled || parseInt(localValue, 10) <= min}
        sx={{
          width: config.buttonSize,
          height: config.buttonSize,
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          ...styles.button,
        }}
        aria-label="Decrease quantity"
      >
        <MinusIcon sx={{ 
          fontSize: config.iconSize,
          '& path': {
            stroke: 'currentColor',
            strokeWidth: 1.5,
            fill: 'none'
          }
        }} />
      </IconButton>

      {/* Filled Number Input - Centered for double-digit display */}
      <TextField
        ref={inputRef}
        value={localValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        disabled={disabled}
        type="number"
        variant="filled"
          inputProps={{
          min,
          max,
          'aria-label': 'Quantity',
          onWheel: (e) => e.preventDefault(), // Prevent scroll wheel changes
          style: {
            textAlign: 'center',
            fontSize: config.fontSize,
            fontWeight: 600,
            padding: '8px 4px',
            MozAppearance: 'textfield', // Hide spinner in Firefox
          }
        }}
        sx={{
          width: config.textFieldWidth,
          borderLeft: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          '& .MuiFilledInput-root': {
            height: config.textFieldHeight,
            borderRadius: 0,
            backgroundColor: 'transparent',
            border: 'none',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
            '&.Mui-focused': {
              backgroundColor: alpha(theme.palette.primary.light, 0.08),
            },
            '&:before': {
              display: 'none', // Remove bottom border
            },
            '&:after': {
              display: 'none', // Remove focus border
            }
          },
          // Hide number input spinners
          '& input[type="number"]::-webkit-outer-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
          '& input[type="number"]::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
          ...styles.textField
        }}
      />

      {/* Plus Button */}
      <IconButton
        onClick={handleIncrement}
        disabled={disabled || parseInt(localValue, 10) >= max}
        sx={{
          width: config.buttonSize,
          height: config.buttonSize,
          ...styles.button,
        }}
        aria-label="Increase quantity"
      >
        <PlusIcon sx={{ 
          fontSize: config.iconSize,
          '& path': {
            stroke: 'currentColor',
            strokeWidth: 1.5,
            fill: 'none'
          }
        }} />
      </IconButton>
    </Stack>
  );
};

export default React.memo(QuantityInput);