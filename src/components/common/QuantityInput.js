/**
 * QuantityInput Component - Simplified Version
 * 
 * Compact quantity input with increment/decrement buttons.
 * Supports keyboard input, validation, and responsive sizing.
 * 
 * Features:
 * - Plus/minus buttons with hover effects
 * - Direct number input with validation
 * - Configurable min/max values
 * - Multiple size variants (small, medium, large)
 * - Disabled state support
 * - Auto-blur on invalid input
 * 
 * @param {number} value - Current quantity value
 * @param {Function} onChange - Callback for value changes
 * @param {Function} onIncrement - Callback for increment button
 * @param {Function} onDecrement - Callback for decrement button
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} size - Size variant (small, medium, large)
 * @param {string} variant - Style variant (outlined, filled)
 * @param {boolean} disabled - Whether input is disabled
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  IconButton,
  TextField,
  Stack,
  useTheme
} from '@mui/material';
import { PlusIcon, MinusIcon } from './QuantityInputIcons';
import { sizeConfig, getButtonStyles, getTextFieldStyles } from './QuantityInputConfig';

const QuantityInputSimple = ({
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

  const config = sizeConfig[size];

  // Sync with external value changes
  useEffect(() => {
    if (!isTypingRef.current) {
      setLocalValue(value?.toString() || '0');
    }
  }, [value]);

  // Handle input changes with validation
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

  return (
    <Stack 
      direction="row" 
      alignItems="center" 
      spacing={0}
      sx={{
        border: variant === 'outlined' ? '1px solid' : 'none',
        borderColor: theme.palette.divider,
        borderRadius: 1,
        backgroundColor: variant === 'filled' ? theme.palette.action.hover : 'transparent',
        overflow: 'hidden',
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
          ...getButtonStyles(theme, variant, disabled),
          width: config.buttonSize,
          height: config.buttonSize,
          borderRadius: '4px 0 0 4px',
        }}
      >
        <MinusIcon sx={{ fontSize: config.iconSize }} />
      </IconButton>

      {/* Number Input */}
      <TextField
        ref={inputRef}
        type="number"
        value={localValue}
        onChange={handleInputChange}
        disabled={disabled}
        size={size}
        inputProps={{
          min,
          max,
          step: 1,
          inputMode: 'numeric',
          pattern: '[0-9]*',
          style: { textAlign: 'center' }
        }}
        sx={getTextFieldStyles(theme, variant, size)}
      />

      {/* Increment Button */}
      <IconButton
        onClick={handleIncrement}
        disabled={disabled || parseInt(localValue, 10) >= max}
        size={size}
        sx={{
          ...getButtonStyles(theme, variant, disabled),
          width: config.buttonSize,
          height: config.buttonSize,
          borderRadius: '0 4px 4px 0',
        }}
      >
        <PlusIcon sx={{ fontSize: config.iconSize }} />
      </IconButton>
    </Stack>
  );
};

export default React.memo(QuantityInputSimple);
