/**
 * CatalogLayout Component - Main Catalog Layout Container
 * 
 * Provides the main layout structure for the catalog with responsive design.
 * Includes filter sidebar for desktop and integrates with mobile filter drawer.
 * 
 * Features:
 * - Responsive layout (sidebar on desktop, full width on mobile)
 * - Filter sidebar integration with FilterPanel component
 * - Mobile filter drawer support
 * - Flexible content area for product display
 * - Aligned with SearchHeader container padding
 * 
 * @param {Object} filterState - Filter state from useCatalogFilters hook
 * @param {Object} mobileFilter - Mobile filter drawer state
 * @param {boolean} isLoading - Whether initial data is loading
 * @param {ReactNode} children - Main content area (ProductDisplay)
 */

import React from 'react';
import { Box, Grid, useTheme, useMediaQuery } from '@mui/material';
import FilterSidebar from './desktop/FilterSidebar';

const CatalogLayout = ({ 
  filterState, 
  mobileFilter, 
  isLoading, 
  children 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    // Mobile Layout - Full width content (filters handled by drawer in parent)
    // No padding here - parent container handles alignment
    return (
      <Box sx={{ width: '100%' }}>
        {children}
      </Box>
    );
  }

  // Desktop Layout - Sidebar + Content
  // No padding here - parent container handles alignment
  return (
    <Grid container spacing={0}>
      {/* Filter Sidebar */}
      <Grid item md={3} lg={2.5} sx={{ pr: 2 }}>
        <FilterSidebar 
          filterOptions={filterState.filterOptions}
          selectedLines={filterState.selectedLines || []}
          selectedProductTypes={filterState.selectedProductTypes || []}
          selectedSkinTypes={filterState.selectedSkinTypes || []}
          selectedTypes={filterState.selectedGeneralTypes || []}
          onLinesChange={filterState.setSelectedLines}
          onProductTypesChange={filterState.setSelectedProductTypes}
          onSkinTypesChange={filterState.setSelectedSkinTypes}
          onTypesChange={filterState.setSelectedGeneralTypes}
          disabled={isLoading}
        />
      </Grid>
      
      {/* Main Content Area */}
      <Grid item md={9} lg={9.5}>
        <Box sx={{ width: '100%' }}>
          {children}
        </Box>
      </Grid>
    </Grid>
  );
};

export default React.memo(CatalogLayout);

