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
import FilterPanel from '../FilterPanel';

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

  // Sidebar content - simplified structure
  const sidebarContent = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      maxHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* Header with filter count */}
      <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent="space-between"
        sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <FilterIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            מסננים
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip 
              label={activeFiltersCount} 
              color="primary" 
              size="small"
              sx={{ minWidth: 24, height: 20 }}
            />
          )}
        </Stack>

        {isMobile && (
          <IconButton onClick={onMobileToggle} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Stack>

      {/* Clear all - simplified */}
      {activeFiltersCount > 0 && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Chip
            label="נקה הכל"
            onClick={handleClearAll}
            onDelete={handleClearAll}
            deleteIcon={<ClearIcon />}
            color="secondary"
            variant="outlined"
            size="small"
          />
        </Box>
      )}

      {/* Filter content */}
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
          disabled={disabled}
          sidebarMode={true}
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

  // Desktop: Sticky sidebar - simplified
  return (
    <Box
      sx={{
        width: 300,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        maxHeight: '100vh',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        overflow: 'hidden'
      }}
    >
      {sidebarContent}
    </Box>
  );
};

export default FilterSidebar;
