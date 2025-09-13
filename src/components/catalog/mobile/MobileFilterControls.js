/**
 * MobileFilterControls Component
 * 
 * Mobile-optimized filter interface using dropdown selects.
 * Provides a clean, touch-friendly filter experience for mobile devices.
 * 
 * Features:
 * - Dropdown-based filter selection
 * - Single selection per filter type
 * - Optimized for mobile touch interaction
 * - Consistent styling and layout
 * 
 * @param {Object} filterOptions - Available filter options
 * @param {Array} selectedLines - Selected product lines
 * @param {Array} selectedProductTypes - Selected product types
 * @param {Array} selectedSkinTypes - Selected skin types
 * @param {Array} selectedTypes - Selected packaging types
 * @param {Function} onLinesChange - Line selection change handler
 * @param {Function} onProductTypesChange - Product type change handler
 * @param {Function} onSkinTypesChange - Skin type change handler
 * @param {Function} onTypesChange - Type change handler
 */

import React from 'react';
import { Grid } from '@mui/material';
import { getProductTypeDisplay } from '../../../utils/imageHelpers';
import FilterSelect from './FilterSelect';

// Helper function to display type in Hebrew
const getTypeDisplayText = (type) => {
  return getProductTypeDisplay(type);
};

const MobileFilterControls = ({
  filterOptions,
  selectedLines = [],
  selectedProductTypes = [],
  selectedSkinTypes = [],
  selectedTypes = [],
  onLinesChange,
  onProductTypesChange,
  onSkinTypesChange,
  onTypesChange
}) => {
  return (
    <Grid container spacing={3}>
      {/* Product Line Filter */}
      <FilterSelect
        label="קו מוצרים"
        value={selectedLines[0] || ''}
        onChange={(e) => onLinesChange(e.target.value ? [e.target.value] : [])}
        options={filterOptions.lines}
        gridProps={{ xs: 12 }}
      />

      {/* Product Type Filter */}
      <FilterSelect
        label="סוג מוצר"
        value={selectedProductTypes[0] || ''}
        onChange={(e) => onProductTypesChange(e.target.value ? [e.target.value] : [])}
        options={filterOptions.productTypes}
        getDisplayText={getProductTypeDisplay}
        gridProps={{ xs: 12, sm: 6 }}
      />

      {/* Skin Type Filter */}
      <FilterSelect
        label="סוג עור"
        value={selectedSkinTypes[0] || ''}
        onChange={(e) => onSkinTypesChange(e.target.value ? [e.target.value] : [])}
        options={filterOptions.skinTypes}
        gridProps={{ xs: 12, sm: 6 }}
      />

      {/* Type Filter */}
      <FilterSelect
        label="סוג אריזה"
        value={selectedTypes[0] || ''}
        onChange={(e) => onTypesChange(e.target.value ? [e.target.value] : [])}
        options={filterOptions.types}
        getDisplayText={getTypeDisplayText}
        gridProps={{ xs: 12 }}
      />
    </Grid>
  );
};

export default MobileFilterControls;
