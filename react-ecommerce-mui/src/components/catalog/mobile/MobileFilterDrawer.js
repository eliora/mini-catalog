/**
 * MobileFilterDrawer Component
 * 
 * Mobile-specific filter drawer that slides up from bottom
 * on mobile devices. Contains all filter sections in a
 * swipeable drawer format optimized for touch interaction.
 * 
 * @param {boolean} open - Whether the drawer is open
 * @param {Function} onToggle - Function to toggle drawer open/close
 * @param {Object} filterOptions - Available filter options
 * @param {Object} selectedValues - Currently selected filter values
 * @param {Object} onFilterChange - Callbacks for filter changes
 * @param {boolean} disabled - Whether filters are disabled
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
import { getProductTypeDisplay } from '../../utils/imageHelpers';

const MobileFilterDrawer = ({
  open,
  onToggle,
  filterOptions,
  selectedValues,
  onFilterChange,
  disabled
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
  const getTypeDisplayText = (type) => {
    return getProductTypeDisplay(type);
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
          {filterOptions.productLines?.length > 0 && (
            <FilterSection
              title="קו מוצרים"
              options={filterOptions.productLines}
              selectedValues={selectedLines}
              onChange={onLinesChange}
              disabled={disabled}
            />
          )}

          {/* Product Types Filter */}
          {filterOptions.productTypes?.length > 0 && (
            <FilterSection
              title="סוג מוצר"
              options={filterOptions.productTypes}
              selectedValues={selectedProductTypes}
              onChange={onProductTypesChange}
              disabled={disabled}
            />
          )}

          {/* Skin Types Filter */}
          {filterOptions.skinTypes?.length > 0 && (
            <FilterSection
              title="סוג עור"
              options={filterOptions.skinTypes}
              selectedValues={selectedSkinTypes}
              onChange={onSkinTypesChange}
              disabled={disabled}
            />
          )}

          {/* Types Filter */}
          {filterOptions.types?.length > 0 && (
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
