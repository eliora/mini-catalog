/**
 * QuantityInput Component
 * 
 * Compact, modern quantity input with seamless increment/decrement buttons.
 * Features elegant design with hover effects and proper accessibility.
 * 
 * Features:
 * - Seamless unified container design
 * - Plus/minus buttons with smooth animations
 * - Direct number input with validation
 * - Multiple size variants and styles
 * - Proper accessibility support
 * - Auto-blur on invalid input
 * 
 * @param {number} value - Current quantity value
 * @param {Function} onChange - Callback for value changes
 * @param {Function} onIncrement - Callback for increment button
 * @param {Function} onDecrement - Callback for decrement button
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} size - Size variant (small, medium, large)
 * @param {string} variant - Style variant (outlined, contained, filled)
 * @param {boolean} disabled - Whether input is disabled
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  TextField,
  useTheme,
  alpha
} from '@mui/material';
import { PlusIcon, MinusIcon } from './QuantityInputIcons';

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
              backgroundColor: alpha(theme.palette.action.hover, 0.8),
              color: theme.palette.primary.main,
            },
            '&:disabled': {
              color: theme.palette.action.disabled,
            }
          },
          textField: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            }
          }
        };
      case 'filled':
        return {
          button: {
            backgroundColor: 'transparent',
            color: theme.palette.text.primary,
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
            '& .MuiFilledInput-root': {
              backgroundColor: 'transparent',
              '&:before, &:after': {
                display: 'none',
              },
              '&:hover': {
                backgroundColor: 'transparent',
              }
            }
          }
        };
      default:
        return {};
    }
  };

  const styles = getVariantStyles();

  // Sync with external value changes
  useEffect(() => {
    if (!isTypingRef.current) {
      setLocalValue(value?.toString() || '0');
    }
  }, [value]);

  // Enhanced input validation with better UX
  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    
    // Allow empty string for temporary state while typing
    if (inputValue === '') {
      setLocalValue('');
      isTypingRef.current = true;
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set timeout to validate after user stops typing
      timeoutRef.current = setTimeout(() => {
        const finalValue = Math.max(min, 0);
        setLocalValue(finalValue.toString());
        onChange?.(finalValue);
        isTypingRef.current = false;
      }, 1000);
      
      return;
    }

    // Parse and validate numeric input
    const numericValue = parseInt(inputValue, 10);
    
    if (!isNaN(numericValue)) {
      const clampedValue = Math.max(min, Math.min(max, numericValue));
      setLocalValue(clampedValue.toString());
      onChange?.(clampedValue);
      
      // If value was clamped, show feedback by auto-blur
      if (clampedValue !== numericValue) {
        setTimeout(() => inputRef.current?.blur(), 100);
      }
    }
    
    isTypingRef.current = true;
    
    // Clear typing flag after delay
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 500);
  };

  const handleIncrement = () => {
    if (disabled) return;
    const newValue = Math.min(max, (parseInt(localValue, 10) || 0) + 1);
    setLocalValue(newValue.toString());
    onIncrement?.();
    onChange?.(newValue);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const newValue = Math.max(min, (parseInt(localValue, 10) || 0) - 1);
    setLocalValue(newValue.toString());
    onDecrement?.();
    onChange?.(newValue);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Unified container design for seamless appearance
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        border: variant === 'outlined' ? '1px solid' : 'none',
        borderColor: theme.palette.divider,
        borderRadius: 1,
        backgroundColor: variant === 'filled' ? alpha(theme.palette.action.hover, 0.05) : 'transparent',
        overflow: 'hidden',
        height: config.textFieldHeight,
        '&:hover': {
          borderColor: variant === 'outlined' ? theme.palette.primary.main : 'transparent',
        },
        ...props.sx
      }}
      {...props}
    >
      {/* Decrement Button */}
      <IconButton
        onClick={handleDecrement}
        disabled={disabled || parseInt(localValue, 10) <= min}
        size={size}
        sx={{
          ...styles.button,
          width: config.buttonSize,
          height: config.buttonSize,
          minWidth: config.buttonSize,
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
            ...styles.button?.['&:hover']
          }
        }}
      >
        <MinusIcon sx={{ fontSize: config.iconSize }} />
      </IconButton>

      {/* Number Input - seamlessly integrated */}
      <TextField
        ref={inputRef}
        type="number"
        value={localValue}
        onChange={handleInputChange}
        disabled={disabled}
        size={size}
        variant={variant === 'filled' ? 'filled' : 'outlined'}
        inputProps={{
          min,
          max,
          step: 1,
          inputMode: 'numeric',
          pattern: '[0-9]*',
          style: { 
            textAlign: 'center',
            fontSize: config.fontSize,
            fontWeight: 600,
            padding: 0
          }
        }}
        sx={{
          width: config.textFieldWidth,
          '& .MuiOutlinedInput-root': {
            height: config.textFieldHeight,
            ...styles.textField?.['& .MuiOutlinedInput-root'],
            '& input': {
              padding: 0,
              textAlign: 'center',
              fontSize: config.fontSize,
              fontWeight: 600,
              MozAppearance: 'textfield',
              '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
            }
          },
          '& .MuiFilledInput-root': {
            height: config.textFieldHeight,
            ...styles.textField?.['& .MuiFilledInput-root'],
            '& input': {
              padding: 0,
              textAlign: 'center',
              fontSize: config.fontSize,
              fontWeight: 600,
            }
          },
          ...styles.textField
        }}
      />

      {/* Increment Button */}
      <IconButton
        onClick={handleIncrement}
        disabled={disabled || parseInt(localValue, 10) >= max}
        size={size}
        sx={{
          ...styles.button,
          width: config.buttonSize,
          height: config.buttonSize,
          minWidth: config.buttonSize,
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
            ...styles.button?.['&:hover']
          }
        }}
      >
        <PlusIcon sx={{ fontSize: config.iconSize }} />
      </IconButton>
    </Box>
  );
};

export default React.memo(QuantityInput);
