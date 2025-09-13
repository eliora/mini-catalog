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
 * 
 * @param {string} title - Filter group title
 * @param {Array} options - Available filter options
 * @param {Array} selectedValues - Currently selected values
 * @param {Function} onToggle - Toggle selection handler
 * @param {Function} getDisplayText - Optional function to transform option display
 * @param {boolean} disabled - Whether filter is disabled
 */

import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';

const FilterChipGroup = ({
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

  const getChipProps = (value, isSelected) => ({
    variant: isSelected ? 'filled' : 'outlined',
    color: isSelected ? 'primary' : 'default',
    size: 'small',
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
      <Typography variant="h7" sx={{ fontWeight: 500, mb: 2 }}>
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
