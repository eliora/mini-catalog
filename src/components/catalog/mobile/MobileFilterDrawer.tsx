'use client';

/**
 * MobileFilterDrawer Component
 * 
 * Mobile-specific filter drawer that slides up from bottom
 * on mobile devices. Contains all filter sections in a
 * swipeable drawer format optimized for touch interaction.
 */

import React from 'react';
import {
  SwipeableDrawer,
  Box,
  IconButton,
  Typography,
  Divider,
  Button,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material';
import FilterSection from '../desktop/FilterSection';

interface FilterOptions {
  productLines?: string[];
  lines?: string[];
  productTypes?: string[];
  skinTypes?: string[];
  types?: string[];
}

interface SelectedValues {
  selectedLines?: string[];
  selectedProductTypes?: string[];
  selectedSkinTypes?: string[];
  selectedTypes?: string[];
}

interface FilterChangeCallbacks {
  onLinesChange: (lines: string[]) => void;
  onProductTypesChange: (types: string[]) => void;
  onSkinTypesChange: (types: string[]) => void;
  onTypesChange: (types: string[]) => void;
  onClearAll: () => void;
}

interface MobileFilterDrawerProps {
  open: boolean;
  onToggle: (open: boolean) => void;
  filterOptions: FilterOptions;
  selectedValues: SelectedValues;
  onFilterChange: FilterChangeCallbacks;
  disabled?: boolean;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  open,
  onToggle,
  filterOptions,
  selectedValues,
  onFilterChange,
  disabled = false
}) => {
  const {
    selectedLines = [],
    selectedProductTypes = [],
    selectedSkinTypes = [],
    selectedTypes = []
  } = selectedValues;

  const {
    onLinesChange,
    onProductTypesChange,
    onSkinTypesChange,
    onTypesChange,
    onClearAll
  } = onFilterChange;

  // Helper function for type display
  const getTypeDisplayText = (type: string): string => {
    // Simple display transformation - can be enhanced
    return type;
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={() => onToggle(false)}
      onOpen={() => onToggle(true)}
      disableSwipeToOpen={false}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '80vh',
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            סינון מוצרים
          </Typography>
          <IconButton onClick={() => onToggle(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Filter Sections */}
        <Stack spacing={2}>
          {/* Product Lines Filter */}
          {(filterOptions.productLines || filterOptions.lines) && 
           (filterOptions.productLines?.length || filterOptions.lines?.length) && (
            <FilterSection
              title="קו מוצרים"
              options={filterOptions.productLines || filterOptions.lines || []}
              selectedValues={selectedLines}
              onChange={onLinesChange}
              disabled={disabled}
            />
          )}

          {/* Product Types Filter */}
          {filterOptions.productTypes && filterOptions.productTypes.length > 0 && (
            <FilterSection
              title="סוג מוצר"
              options={filterOptions.productTypes}
              selectedValues={selectedProductTypes}
              onChange={onProductTypesChange}
              disabled={disabled}
            />
          )}

          {/* Skin Types Filter */}
          {filterOptions.skinTypes && filterOptions.skinTypes.length > 0 && (
            <FilterSection
              title="סוג עור"
              options={filterOptions.skinTypes}
              selectedValues={selectedSkinTypes}
              onChange={onSkinTypesChange}
              disabled={disabled}
            />
          )}

          {/* Types Filter */}
          {filterOptions.types && filterOptions.types.length > 0 && (
            <FilterSection
              title="סוג"
              options={filterOptions.types}
              selectedValues={selectedTypes}
              onChange={onTypesChange}
              disabled={disabled}
              getDisplayText={getTypeDisplayText}
            />
          )}
        </Stack>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ClearAllIcon />}
              onClick={onClearAll}
              fullWidth
              disabled={disabled}
            >
              נקה הכל
            </Button>
            <Button
              variant="contained"
              onClick={() => onToggle(false)}
              fullWidth
            >
              הצג תוצאות
            </Button>
          </Stack>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};

export default MobileFilterDrawer;
