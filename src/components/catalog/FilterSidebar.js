import React from 'react';
import {
  Box,
  Drawer,
  Typography,
  Chip,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import FilterPanel from './FilterPanel';

/**
 * Left sidebar containing all filters (except search)
 * Responsive: Drawer on mobile, fixed sidebar on desktop
 */
const FilterSidebar = ({
  filterOptions,
  selectedLines,
  selectedProductTypes,
  selectedSkinTypes,
  selectedTypes,
  onLinesChange,
  onProductTypesChange,
  onSkinTypesChange,
  onTypesChange,
  disabled = false,
  // Mobile drawer props
  mobileOpen = false,
  onMobileToggle
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Calculate active filters count
  const activeFiltersCount = selectedLines.length + selectedProductTypes.length + 
                           selectedSkinTypes.length + selectedTypes.length;

  // Clear all filters
  const handleClearAll = () => {
    onLinesChange([]);
    onProductTypesChange([]);
    onSkinTypesChange([]);
    onTypesChange([]);
  };

  // Sidebar content
  const sidebarContent = (
    <Box sx={{ 
      width: '100%',
      minWidth: 0,
      display: 'flex', 
      flexDirection: 'column',
      maxHeight: { xs: '100vh', md: '100vh' },
      overflow: 'hidden'
    }}>
      {/* Sidebar Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            מסננים
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip 
              label={activeFiltersCount} 
              color="primary" 
              size="small"
              sx={{ minWidth: 24, height: 20, '& .MuiChip-label': { px: 1 } }}
            />
          )}
        </Box>

        {/* Mobile close button */}
        {isMobile && (
          <IconButton onClick={onMobileToggle} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Clear All Button */}
      {activeFiltersCount > 0 && (
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Chip
            label="נקה הכל"
            onClick={handleClearAll}
            onDelete={handleClearAll}
            deleteIcon={<ClearIcon />}
            color="secondary"
            variant="outlined"
            size="small"
            sx={{ 
              borderRadius: '16px',
              '&:hover': {
                backgroundColor: 'secondary.light',
                color: 'secondary.contrastText'
              }
            }}
          />
        </Box>
      )}

      {/* Filter Panel Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <FilterPanel
          filterOptions={filterOptions}
          selectedLines={selectedLines}
          selectedProductTypes={selectedProductTypes}
          selectedSkinTypes={selectedSkinTypes}
          selectedTypes={selectedTypes}
          onLinesChange={onLinesChange}
          onProductTypesChange={onProductTypesChange}
          onSkinTypesChange={onSkinTypesChange}
          onTypesChange={onTypesChange}
          open={true}
          mobileDrawerOpen={false} // Not used in sidebar mode
          onMobileDrawerToggle={() => {}} // Not used in sidebar mode
          disabled={disabled}
          sidebarMode={true} // Tell FilterPanel it's in sidebar mode
        />
      </Box>

    </Box>
  );

  if (isMobile) {
    // Mobile: Use drawer
    return (
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={onMobileToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  // Desktop: Sticky sidebar that floats while scrolling
  return (
    <Box
      sx={{
        width: 300,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        height: 'fit-content',
        maxHeight: '100vh'
      }}
    >
      <Box
        sx={{
          width: 300,
          minWidth: 300,
          maxWidth: 300,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
          overflow: 'hidden',
          maxHeight: '100vh'
        }}
      >
        {sidebarContent}
      </Box>
    </Box>
  );
};

export default FilterSidebar;
