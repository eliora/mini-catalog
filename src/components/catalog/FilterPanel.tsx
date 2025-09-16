'use client';

/**
 * FilterPanel Component - Product Filtering Interface
 * 
 * Provides comprehensive product filtering with responsive design.
 * Supports both mobile drawer and desktop sidebar modes.
 * 
 * Features:
 * - Multi-selection filters (lines, product types, skin types, general types)
 * - Mobile SwipeableDrawer with bottom sheet design
 * - Desktop sidebar with chip-based selection
 * - Active filter count display
 * - Clear all functionality
 * - Responsive breakpoint handling
 */

import React, { useState } from 'react';
import {
  Paper,
  Typography,
  SwipeableDrawer,
  Box,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  Stack,
  Chip,
  Button
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material';
import MobileFilterControls from './mobile/MobileFilterControls';
import DesktopFilterContent from './desktop/DesktopFilterContent';

interface FilterOptions {
  lines: string[];
  productTypes: string[];
  skinTypes: string[];
  types: string[];
}

interface FilterPanelProps {
  filterOptions: FilterOptions;
  selectedLines?: string[];
  selectedProductTypes?: string[];
  selectedSkinTypes?: string[];
  selectedTypes?: string[];
  onLinesChange: (lines: string[]) => void;
  onProductTypesChange: (types: string[]) => void;
  onSkinTypesChange: (types: string[]) => void;
  onTypesChange: (types: string[]) => void;
  open?: boolean;
  mobileDrawerOpen?: boolean;
  onMobileDrawerToggle?: (open: boolean) => void;
  disabled?: boolean;
  sidebarMode?: boolean;
}

// Hook for mobile filter drawer state management
export const useMobileFilterDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const toggleDrawer = (open?: boolean) => setIsOpen(open ?? !isOpen);
  
  return {
    isOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer
  };
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  filterOptions,
  selectedLines = [],
  selectedProductTypes = [],
  selectedSkinTypes = [],
  selectedTypes = [],
  onLinesChange,
  onProductTypesChange,
  onSkinTypesChange,
  onTypesChange,
  open = true,
  mobileDrawerOpen = false,
  onMobileDrawerToggle,
  disabled = false,
  sidebarMode = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Count active filters
  const activeFiltersCount = selectedLines.length + selectedProductTypes.length + selectedSkinTypes.length + selectedTypes.length;

  // Helper functions for multiple selection
  // Toggle helper - reusable for all filter types
  const createToggleHandler = (selectedArray: string[], onChange: (values: string[]) => void) => (value: string) => {
    if (value === '') {
      onChange([]);
    } else {
      const newSelection = selectedArray.includes(value)
        ? selectedArray.filter(item => item !== value)
        : [...selectedArray, value];
      onChange(newSelection);
    }
  };

  // Create toggle handlers
  const toggleLineSelection = createToggleHandler(selectedLines, onLinesChange);
  const toggleProductTypeSelection = createToggleHandler(selectedProductTypes, onProductTypesChange);
  const toggleSkinTypeSelection = createToggleHandler(selectedSkinTypes, onSkinTypesChange);
  const toggleTypeSelection = createToggleHandler(selectedTypes, onTypesChange);

  // Clear all filters
  const handleClearAll = () => {
    onLinesChange([]);
    onProductTypesChange([]);
    onSkinTypesChange([]);
    onTypesChange([]);
  };

  if (!open) {
    return null;
  }

  // Mobile view with SwipeableDrawer
  if (isMobile) {
    return (
      <>
        {/* Mobile filter trigger - integrated into toolbar */}
        <SwipeableDrawer
          anchor="bottom"
          open={mobileDrawerOpen}
          onClose={() => onMobileDrawerToggle && onMobileDrawerToggle(false)}
          onOpen={() => onMobileDrawerToggle && onMobileDrawerToggle(true)}
          disableSwipeToOpen={false}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '85vh',
            }
          }}
        >
          {/* Drawer Handle */}
          <Box
            sx={{
              width: 40,
              height: 4,
              backgroundColor: 'grey.300',
              borderRadius: 2,
              mx: 'auto',
              mt: 1,
              mb: 2
            }}
          />
          
          {/* Drawer Header */}
          <Box sx={{ px: 3, pb: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  סינון מוצרים
                </Typography>
                {activeFiltersCount > 0 && (
                  <Chip 
                    label={activeFiltersCount}
                    size="small"
                    color="primary"
                    sx={{ minWidth: 24, height: 20, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
              <IconButton 
                onClick={() => onMobileDrawerToggle && onMobileDrawerToggle(false)}
                size="small"
                sx={{ p: 1 }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </Box>
          
          <Divider />
          
          {/* Drawer Content */}
          <Box sx={{ p: 3, pb: 4 }}>
            <MobileFilterControls
              filterOptions={filterOptions}
              selectedLines={selectedLines}
              selectedProductTypes={selectedProductTypes}
              selectedSkinTypes={selectedSkinTypes}
              selectedTypes={selectedTypes}
              onLinesChange={onLinesChange}
              onProductTypesChange={onProductTypesChange}
              onSkinTypesChange={onSkinTypesChange}
              onTypesChange={onTypesChange}
            />
            
            {/* Action Buttons */}
            {activeFiltersCount > 0 && (
              <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ClearAllIcon />}
                  onClick={handleClearAll}
                  sx={{ 
                    minHeight: 48,
                    fontSize: '1rem'
                  }}
                >
                  נקה הכל
                </Button>
              </Box>
            )}
          </Box>
        </SwipeableDrawer>
      </>
    );
  }

  // Desktop view - Modern Chip-based Filters
  const filterContent = (
    <DesktopFilterContent
      filterOptions={filterOptions}
      selectedLines={selectedLines}
      selectedProductTypes={selectedProductTypes}
      selectedSkinTypes={selectedSkinTypes}
      selectedTypes={selectedTypes}
      toggleLineSelection={toggleLineSelection}
      toggleProductTypeSelection={toggleProductTypeSelection}
      toggleSkinTypeSelection={toggleSkinTypeSelection}
      toggleTypeSelection={toggleTypeSelection}
      handleClearAll={handleClearAll}
      activeFiltersCount={activeFiltersCount}
      disabled={disabled}
      sidebarMode={sidebarMode}
    />
  );

  // Return wrapped content based on mode
  if (sidebarMode) {
    return filterContent;
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        height: 'fit-content'
      }}
    >
      {filterContent}
    </Paper>
  );
};

export default FilterPanel;
