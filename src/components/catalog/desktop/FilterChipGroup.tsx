'use client';

/**
 * FilterChipGroup Component
 * 
 * Reusable chip-based filter group for desktop catalog filters.
 * Provides multi-selection capability with chip-style interface.
 * 
 * Features:
 * - Multi-selection with visual feedback
 * - "All" option to clear selections
 * - Consistent styling and hover effects
 * - Disabled state support
 */

import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';

interface FilterChipGroupProps {
  title: string;
  options?: string[];
  selectedValues?: string[];
  onToggle: (value: string) => void;
  getDisplayText?: (option: string) => string;
  disabled?: boolean;
}

const FilterChipGroup: React.FC<FilterChipGroupProps> = ({
  title,
  options = [],
  selectedValues = [],
  onToggle,
  getDisplayText = (option) => option,
  disabled = false
}) => {
  const chipStyle = {
    borderRadius: '20px',
    fontSize: '0.75rem',
    height: 28,
    opacity: disabled ? 0.6 : 1
  };

  const getChipProps = (value: string, isSelected: boolean) => ({
    variant: isSelected ? 'filled' as const : 'outlined' as const,
    color: isSelected ? 'primary' as const : 'default' as const,
    size: 'small' as const,
    disabled,
    sx: {
      ...chipStyle,
      fontWeight: isSelected ? 600 : 400,
      '&:hover': {
        backgroundColor: disabled 
          ? 'transparent' 
          : (isSelected ? 'primary.dark' : 'action.hover')
      }
    }
  });

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 2 }}>
        {title}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {/* "All" chip */}
        <Chip
          label="הכל"
          onClick={disabled ? undefined : () => onToggle('')}
          {...getChipProps('', selectedValues.length === 0)}
        />
        
        {/* Option chips */}
        {options.map((option) => (
          <Chip
            key={option}
            label={getDisplayText(option)}
            onClick={disabled ? undefined : () => onToggle(option)}
            {...getChipProps(option, selectedValues.includes(option))}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default FilterChipGroup;
