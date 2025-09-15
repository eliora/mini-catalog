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
    // Mobile Layout - Full width content (filters handled by drawer in parent)
    // No padding here - parent container handles alignment
    return (
      <Box sx={{ width: '100%' }}>
        {children}
      </Box>
    );
  }

  // Desktop Layout - Sidebar + Content using Flexbox for MUI v7 compatibility
  // No padding here - parent container handles alignment
  return (
    <Box sx={{ display: 'flex', gap: 0 }}>
      {/* Filter Sidebar */}
      <Box sx={{ flex: '0 0 25%', maxWidth: '300px', pr: 2 }}>
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
      <Box sx={{ flex: '1 1 75%' }}>
        {children}
      </Box>
    </Box>
  );
};

export default React.memo(CatalogLayout);
