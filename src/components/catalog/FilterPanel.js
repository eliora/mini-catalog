import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Typography,
  SwipeableDrawer,
  Box,
  IconButton,
  Divider,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material';
import { getProductTypeDisplay } from '../../utils/imageHelpers';

// Helper function to display type in Hebrew
const getTypeDisplayText = (type) => {
  return getProductTypeDisplay(type);
};

const FilterPanel = ({
  filterOptions,
  selectedLine,
  selectedProductType,
  selectedSkinType,
  selectedType,
  onLineChange,
  onProductTypeChange,
  onSkinTypeChange,
  onTypeChange,
  open = true,
  mobileDrawerOpen = false,
  onMobileDrawerToggle
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Count active filters
  const activeFiltersCount = [selectedLine, selectedProductType, selectedSkinType, selectedType]
    .filter(Boolean).length;

  // Clear all filters
  const handleClearAll = () => {
    onLineChange('');
    onProductTypeChange('');
    onSkinTypeChange('');
    onTypeChange('');
  };

  // Filter controls component
  const FilterControls = ({ isMobileView = false }) => (
    <Grid container spacing={isMobileView ? 3 : 2}>
      {/* Product Line Filter */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl 
          fullWidth 
          size={isMobileView ? "medium" : "small"}
          sx={{
            '& .MuiInputBase-root': {
              minHeight: isMobileView ? 56 : 40,
            }
          }}
        >
          <InputLabel>קו מוצרים</InputLabel>
          <Select
            value={selectedLine}
            label="קו מוצרים"
            onChange={(e) => onLineChange(e.target.value)}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: isMobileView ? 300 : 250,
                  '& .MuiMenuItem-root': {
                    minHeight: isMobileView ? 48 : 36,
                    fontSize: isMobileView ? '1rem' : '0.875rem'
                  }
                }
              }
            }}
          >
            <MenuItem value="">
              <em>הכל</em>
            </MenuItem>
            {filterOptions.lines.map((line) => (
              <MenuItem key={line} value={line}>
                {line}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Product Type Filter */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl 
          fullWidth 
          size={isMobileView ? "medium" : "small"}
          sx={{
            '& .MuiInputBase-root': {
              minHeight: isMobileView ? 56 : 40,
            }
          }}
        >
          <InputLabel>סוג מוצר</InputLabel>
          <Select
            value={selectedProductType}
            label="סוג מוצר"
            onChange={(e) => onProductTypeChange(e.target.value)}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: isMobileView ? 300 : 250,
                  '& .MuiMenuItem-root': {
                    minHeight: isMobileView ? 48 : 36,
                    fontSize: isMobileView ? '1rem' : '0.875rem'
                  }
                }
              }
            }}
          >
            <MenuItem value="">
              <em>הכל</em>
            </MenuItem>
            {filterOptions.productTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {getProductTypeDisplay(type)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Skin Type Filter */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl 
          fullWidth 
          size={isMobileView ? "medium" : "small"}
          sx={{
            '& .MuiInputBase-root': {
              minHeight: isMobileView ? 56 : 40,
            }
          }}
        >
          <InputLabel>סוג עור</InputLabel>
          <Select
            value={selectedSkinType}
            label="סוג עור"
            onChange={(e) => onSkinTypeChange(e.target.value)}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: isMobileView ? 300 : 250,
                  '& .MuiMenuItem-root': {
                    minHeight: isMobileView ? 48 : 36,
                    fontSize: isMobileView ? '1rem' : '0.875rem'
                  }
                }
              }
            }}
          >
            <MenuItem value="">
              <em>הכל</em>
            </MenuItem>
            {filterOptions.skinTypes.map((skinType) => (
              <MenuItem key={skinType} value={skinType}>
                {skinType}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Type Filter */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl 
          fullWidth 
          size={isMobileView ? "medium" : "small"}
          sx={{
            '& .MuiInputBase-root': {
              minHeight: isMobileView ? 56 : 40,
            }
          }}
        >
          <InputLabel>סוג אריזה</InputLabel>
          <Select
            value={selectedType}
            label="סוג אריזה"
            onChange={(e) => onTypeChange(e.target.value)}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: isMobileView ? 300 : 250,
                  '& .MuiMenuItem-root': {
                    minHeight: isMobileView ? 48 : 36,
                    fontSize: isMobileView ? '1rem' : '0.875rem'
                  }
                }
              }
            }}
          >
            <MenuItem value="">
              <em>הכל</em>
            </MenuItem>
            {filterOptions.types.map((type) => (
              <MenuItem key={type} value={type}>
                {getTypeDisplayText(type)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

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
            <FilterControls isMobileView={true} />
            
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

  // Desktop view
  return (
    <Paper elevation={1} sx={{ mb: 2, p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            סינון מוצרים
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip 
              label={`${activeFiltersCount} פעיל`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        {activeFiltersCount > 0 && (
          <Button
            size="small"
            startIcon={<ClearAllIcon />}
            onClick={handleClearAll}
            sx={{ fontSize: '0.75rem' }}
          >
            נקה הכל
          </Button>
        )}
      </Stack>
      
      <FilterControls isMobileView={false} />
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
