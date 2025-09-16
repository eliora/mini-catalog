'use client';

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
 */

import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import FilterSidebar from './desktop/FilterSidebar';
import MobileFilterDrawer from './mobile/MobileFilterDrawer';

interface FilterState {
  filterOptions: any;
  selectedLines?: string[];
  selectedProductTypes?: string[];
  selectedSkinTypes?: string[];
  selectedGeneralTypes?: string[];
  setSelectedLines: (lines: string[]) => void;
  setSelectedProductTypes: (types: string[]) => void;
  setSelectedSkinTypes: (types: string[]) => void;
  setSelectedGeneralTypes: (types: string[]) => void;
}

interface MobileFilter {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: (open?: boolean) => void;
}

interface CatalogLayoutProps {
  filterState: FilterState;
  mobileFilter: MobileFilter;
  isLoading: boolean;
  children: React.ReactNode;
}

const CatalogLayout: React.FC<CatalogLayoutProps> = ({ 
  filterState, 
  mobileFilter, 
  isLoading, 
  children 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  if (isMobile) {
    // Mobile Layout - Full width content with mobile filter components
    return (
      <>
        <Box sx={{ width: '100%' }}>
          {children}
        </Box>
        {/* Mobile Filter Drawer */}
        <MobileFilterDrawer
          open={mobileFilter.isOpen}
          onToggle={mobileFilter.toggleDrawer}
          filterOptions={{
            productLines: filterState.filterOptions?.lines,
            lines: filterState.filterOptions?.lines,
            productTypes: filterState.filterOptions?.productTypes,
            skinTypes: filterState.filterOptions?.skinTypes,
            types: filterState.filterOptions?.types
          }}
          selectedValues={{
            selectedLines: filterState.selectedLines || [],
            selectedProductTypes: filterState.selectedProductTypes || [],
            selectedSkinTypes: filterState.selectedSkinTypes || [],
            selectedTypes: filterState.selectedGeneralTypes || []
          }}
          onFilterChange={{
            onLinesChange: filterState.setSelectedLines,
            onProductTypesChange: filterState.setSelectedProductTypes,
            onSkinTypesChange: filterState.setSelectedSkinTypes,
            onTypesChange: filterState.setSelectedGeneralTypes,
            onClearAll: () => {
              filterState.setSelectedLines([]);
              filterState.setSelectedProductTypes([]);
              filterState.setSelectedSkinTypes([]);
              filterState.setSelectedGeneralTypes([]);
            }
          }}
          disabled={isLoading}
        />
      </>
    );
  }

  // Desktop Layout - Sidebar + Content using Flexbox for MUI v7 compatibility
  // Added proper spacing between filters and content area
  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      {/* Filter Sidebar */}
      <Box sx={{ flex: '0 0 25%', maxWidth: '300px' }}>
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
      </Box>
      
      {/* Main Content Area */}
      <Box sx={{ flex: '1 1 75%', pl: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export default React.memo(CatalogLayout);
