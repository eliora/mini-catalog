'use client';

import React, { useState, useEffect } from 'react';
import {
  IconButton,
  TextField,
  Stack,
  useTheme,
  alpha,
  StackProps
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

interface QuantityInputProps extends Omit<StackProps, 'onChange'> {
  value?: number;
  onChange?: (value: string) => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  min?: number;
  max?: number;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

interface SizeConfig {
  buttonSize: number;
  textFieldWidth: number;
  textFieldHeight: number;
  fontSize: string;
  iconSize: number;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  value = 0,
  onChange,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  size = 'medium',
  disabled = false,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const [localValue, setLocalValue] = useState<string>(value?.toString() || '0');

  // Size configurations
  const sizeConfig: Record<string, SizeConfig> = {
    small: { buttonSize: 32, textFieldWidth: 50, textFieldHeight: 32, fontSize: '0.875rem', iconSize: 18 },
    medium: { buttonSize: 40, textFieldWidth: 60, textFieldHeight: 40, fontSize: '1rem', iconSize: 20 },
    large: { buttonSize: 48, textFieldWidth: 70, textFieldHeight: 48, fontSize: '1.125rem', iconSize: 22 }
  };
  const config = sizeConfig[size] || sizeConfig.medium;

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value?.toString() || '0');
  }, [value]);

  // Reusable utilities  
  const getCurrentValue = (): number => parseInt(localValue, 10) || 0;
  const getRawValue = (): number => parseInt(localValue, 10); // For disabled checks - matches original
  const updateValue = (newValue: number, callback?: () => void): void => {
    setLocalValue(newValue.toString());
    onChange?.(newValue.toString());
    callback?.();
  };

  // Common styling objects
  const buttonStyle = {
    width: config.buttonSize,
    height: config.buttonSize,
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
  };

  const iconStyle = {
    fontSize: config.iconSize,
    '& path': {
      stroke: 'currentColor',
      strokeWidth: 1.5,
      fill: 'none'
    }
  };

  // Simple input handler
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    const newValue = event.target.value;
    if (newValue === '' || /^\d+$/.test(newValue)) {
      setLocalValue(newValue);
    }
  };

  // Handle blur to validate and update
  const handleInputBlur = (): void => {
    const numericValue = getCurrentValue() || min;
    const clampedValue = Math.max(min, Math.min(max, numericValue));
    setLocalValue(clampedValue.toString());
    onChange?.(clampedValue.toString());
  };

  // Button handlers with event propagation prevention
  const handleDecrement = (event?: React.MouseEvent): void => {
    event?.stopPropagation();
    const newValue = Math.max(getCurrentValue() - 1, min);
    updateValue(newValue, onDecrement);
  };

  const handleIncrement = (event?: React.MouseEvent): void => {
    event?.stopPropagation();
    const newValue = Math.min(getCurrentValue() + 1, max);
    updateValue(newValue, onIncrement);
  };

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
        ...sx
      }}
      {...props}
    >
      {/* Minus Button */}
      <IconButton
        onClick={handleDecrement}
        disabled={disabled || getRawValue() <= min}
        sx={{
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          ...buttonStyle
        }}
        aria-label="Decrease quantity"
      >
        <MinusIcon sx={iconStyle} />
      </IconButton>

      {/* Filled Number Input */}
      <TextField
        value={localValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={disabled}
        type="number"
        variant="filled"
        inputProps={{
          min,
          max,
          'aria-label': 'Quantity',
          onWheel: (e: React.WheelEvent) => e.preventDefault(),
          onClick: (e: React.MouseEvent) => e.stopPropagation(),
          onFocus: (e: React.FocusEvent) => e.stopPropagation(),
          style: {
            textAlign: 'center',
            fontSize: config.fontSize,
            fontWeight: 600,
            padding: '8px 4px',
            MozAppearance: 'textfield' as const
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
          }
        }}
      />

      {/* Plus Button */}
      <IconButton
        onClick={handleIncrement}
        disabled={disabled || getRawValue() >= max}
        sx={buttonStyle}
        aria-label="Increase quantity"
      >
        <PlusIcon sx={iconStyle} />
      </IconButton>
    </Stack>
  );
};

export default React.memo(QuantityInput);

