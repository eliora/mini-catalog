'use client';

/**
 * MobileFilterControls Component - Mobile Filter Interface
 * 
 * Provides touch-optimized filter controls for mobile devices.
 * Used within the mobile filter drawer.
 */

import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';

interface FilterOptions {
  lines: string[];
  productTypes: string[];
  skinTypes: string[];
  types: string[];
}

interface MobileFilterControlsProps {
  filterOptions: FilterOptions;
  selectedLines: string[];
  selectedProductTypes: string[];
  selectedSkinTypes: string[];
  selectedTypes: string[];
  onLinesChange: (lines: string[]) => void;
  onProductTypesChange: (types: string[]) => void;
  onSkinTypesChange: (types: string[]) => void;
  onTypesChange: (types: string[]) => void;
}

const MobileFilterControls: React.FC<MobileFilterControlsProps> = ({
  filterOptions,
  selectedLines,
  selectedProductTypes,
  selectedSkinTypes,
  selectedTypes,
  onLinesChange,
  onProductTypesChange,
  onSkinTypesChange,
  onTypesChange
}) => {
  const handleChipToggle = (value: string, selected: string[], onChange: (values: string[]) => void) => {
    const newSelection = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    onChange(newSelection);
  };

  const renderFilterSection = (
    title: string,
    options: string[],
    selected: string[],
    onChange: (values: string[]) => void
  ) => {
    if (!options || !Array.isArray(options) || !options.length) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          {title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {options.map((option) => (
            <Chip
              key={option}
              label={option}
              variant={selected.includes(option) ? 'filled' : 'outlined'}
              color={selected.includes(option) ? 'primary' : 'default'}
              onClick={() => handleChipToggle(option, selected, onChange)}
              sx={{
                fontSize: '0.875rem',
                height: 36,
                '&:hover': {
                  backgroundColor: selected.includes(option) ? 'primary.dark' : 'action.hover'
                }
              }}
            />
          ))}
        </Stack>
      </Box>
    );
  };

  // Safely access filterOptions with fallbacks
  const safeFilterOptions = {
    lines: filterOptions?.lines || [],
    productTypes: filterOptions?.productTypes || [],
    skinTypes: filterOptions?.skinTypes || [],
    types: filterOptions?.types || []
  };

  return (
    <Box>
      {renderFilterSection('קווי מוצרים', safeFilterOptions.lines, selectedLines, onLinesChange)}
      {renderFilterSection('סוגי מוצרים', safeFilterOptions.productTypes, selectedProductTypes, onProductTypesChange)}
      {renderFilterSection('סוגי עור', safeFilterOptions.skinTypes, selectedSkinTypes, onSkinTypesChange)}
      {renderFilterSection('קטגוריות כלליות', safeFilterOptions.types, selectedTypes, onTypesChange)}
    </Box>
  );
};

export default MobileFilterControls;
