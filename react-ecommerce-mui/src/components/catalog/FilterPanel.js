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

const FilterPanel = ({
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
  const createToggleHandler = (selectedArray, onChange) => (value) => {
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
    <Paper elevation={1} sx={{ mb: 2, p: 3 }}>
      {filterContent}
    </Paper>
  );
};

// Export a function to open mobile drawer (to be used by parent component)
FilterPanel.openMobileDrawer = (setOpen) => setOpen(true);

export default FilterPanel;

// Export mobile drawer state hook for parent component
export const useMobileFilterDrawer = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return { 
    open, 
    setOpen, 
    isMobile,
    openDrawer: () => setOpen(true),
    closeDrawer: () => setOpen(false)
  };
};
