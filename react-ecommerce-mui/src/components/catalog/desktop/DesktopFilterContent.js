/**
 * DesktopFilterContent Component
 * 
 * Desktop-optimized filter interface using chip-based selections.
 * Provides multi-selection capability and visual filter management.
 * 
 * Features:
 * - Chip-based multi-selection interface
 * - Filter count display and clear all functionality
 * - Responsive chip layout
 * - Disabled state support
 * - Optional sidebar mode (no header)
 * 
 * @param {Object} filterOptions - Available filter options
 * @param {Array} selectedLines - Selected product lines
 * @param {Array} selectedProductTypes - Selected product types
 * @param {Array} selectedSkinTypes - Selected skin types
 * @param {Array} selectedTypes - Selected packaging types
 * @param {Function} toggleLineSelection - Line toggle handler
 * @param {Function} toggleProductTypeSelection - Product type toggle handler
 * @param {Function} toggleSkinTypeSelection - Skin type toggle handler
 * @param {Function} toggleTypeSelection - Type toggle handler
 * @param {Function} handleClearAll - Clear all filters handler
 * @param {number} activeFiltersCount - Count of active filters
 * @param {boolean} disabled - Whether filters are disabled
 * @param {boolean} sidebarMode - Whether in sidebar mode (no header)
 */

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip
} from '@mui/material';
import {
  FilterList as FilterIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material';
import { getProductTypeDisplay } from '../../../utils/imageHelpers';
import FilterChipGroup from './FilterChipGroup';

// Helper function to display type in Hebrew
const getTypeDisplayText = (type) => {
  return getProductTypeDisplay(type);
};

const DesktopFilterContent = ({
  filterOptions,
  selectedLines = [],
  selectedProductTypes = [],
  selectedSkinTypes = [],
  selectedTypes = [],
  toggleLineSelection,
  toggleProductTypeSelection,
  toggleSkinTypeSelection,
  toggleTypeSelection,
  handleClearAll,
  activeFiltersCount,
  disabled = false,
  sidebarMode = false
}) => {
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
        options={filterOptions.lines}
        selectedValues={selectedLines}
        onToggle={toggleLineSelection}
        disabled={disabled}
      />

      <FilterChipGroup
        title="סוג מוצר"
        options={filterOptions.productTypes}
        selectedValues={selectedProductTypes}
        onToggle={toggleProductTypeSelection}
        getDisplayText={getProductTypeDisplay}
        disabled={disabled}
      />

      <FilterChipGroup
        title="סוג עור"
        options={filterOptions.skinTypes}
        selectedValues={selectedSkinTypes}
        onToggle={toggleSkinTypeSelection}
        disabled={disabled}
      />

      <FilterChipGroup
        title="סוג אריזה"
        options={filterOptions.types}
        selectedValues={selectedTypes}
        onToggle={toggleTypeSelection}
        getDisplayText={getTypeDisplayText}
        disabled={disabled}
      />
    </>
  );
};

export default DesktopFilterContent;
