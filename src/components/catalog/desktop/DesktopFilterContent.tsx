'use client';

/**
 * DesktopFilterContent Component - Desktop Filter Interface
 * 
 * Provides comprehensive filter controls optimized for desktop usage.
 * Features chip-based selection and clear visual hierarchy.
 */

import React from 'react';
import { Box, Typography, Stack, Button, Chip } from '@mui/material';
import { FilterList as FilterIcon, ClearAll as ClearAllIcon } from '@mui/icons-material';
import FilterChipGroup from './FilterChipGroup';

interface FilterOptions {
  lines: string[];
  productTypes: string[];
  skinTypes: string[];
  types: string[];
}

interface DesktopFilterContentProps {
  filterOptions: FilterOptions;
  selectedLines: string[];
  selectedProductTypes: string[];
  selectedSkinTypes: string[];
  selectedTypes: string[];
  toggleLineSelection: (value: string) => void;
  toggleProductTypeSelection: (value: string) => void;
  toggleSkinTypeSelection: (value: string) => void;
  toggleTypeSelection: (value: string) => void;
  handleClearAll: () => void;
  activeFiltersCount: number;
  disabled?: boolean;
  sidebarMode?: boolean;
}

const DesktopFilterContent: React.FC<DesktopFilterContentProps> = ({
  filterOptions,
  selectedLines,
  selectedProductTypes,
  selectedSkinTypes,
  selectedTypes,
  toggleLineSelection,
  toggleProductTypeSelection,
  toggleSkinTypeSelection,
  toggleTypeSelection,
  handleClearAll,
  activeFiltersCount,
  disabled = false,
  sidebarMode = false
}) => {
  // Helper function to display type in Hebrew (if needed)
  const getTypeDisplayText = (type: string) => {
    return type; // You can add translation logic here if needed
  };

  const getProductTypeDisplay = (type: string) => {
    return type; // You can add translation logic here if needed
  };

  return (
    <>
      {/* Header - only show when not in sidebar mode */}
      {!sidebarMode && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              סינון מוצרים
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip 
                label={`${activeFiltersCount} פעיל`}
                size="small"
                color="primary"
                variant="filled"
                sx={{ 
                  fontSize: '0.75rem',
                  height: 24,
                  borderRadius: '12px'
                }}
              />
            )}
          </Box>
          {activeFiltersCount > 0 && (
            <Button
              size="small"
              startIcon={<ClearAllIcon />}
              onClick={handleClearAll}
              variant="outlined"
              sx={{ 
                fontSize: '0.875rem',
                borderRadius: '20px',
                px: 2
              }}
            >
              נקה הכל
            </Button>
          )}
        </Stack>
      )}
      
      {/* Filter Groups */}
      <FilterChipGroup
        title="קו מוצרים"
        options={filterOptions?.lines || []}
        selectedValues={selectedLines}
        onToggle={toggleLineSelection}
        disabled={disabled}
      />

      <FilterChipGroup
        title="סוג מוצר"
        options={filterOptions?.productTypes || []}
        selectedValues={selectedProductTypes}
        onToggle={toggleProductTypeSelection}
        getDisplayText={getProductTypeDisplay}
        disabled={disabled}
      />

      <FilterChipGroup
        title="סוג עור"
        options={filterOptions?.skinTypes || []}
        selectedValues={selectedSkinTypes}
        onToggle={toggleSkinTypeSelection}
        disabled={disabled}
      />

      <FilterChipGroup
        title="סוג אריזה"
        options={filterOptions?.types || []}
        selectedValues={selectedTypes}
        onToggle={toggleTypeSelection}
        getDisplayText={getTypeDisplayText}
        disabled={disabled}
      />
    </>
  );
};

export default DesktopFilterContent;
