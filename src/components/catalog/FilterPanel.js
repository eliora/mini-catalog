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
  const toggleLineSelection = (line) => {
    if (line === '') {
      onLinesChange([]);
    } else {
      const newSelection = selectedLines.includes(line) 
        ? selectedLines.filter(item => item !== line)
        : [...selectedLines, line];
      onLinesChange(newSelection);
    }
  };

  const toggleProductTypeSelection = (type) => {
    if (type === '') {
      onProductTypesChange([]);
    } else {
      const newSelection = selectedProductTypes.includes(type) 
        ? selectedProductTypes.filter(item => item !== type)
        : [...selectedProductTypes, type];
      onProductTypesChange(newSelection);
    }
  };

  const toggleSkinTypeSelection = (type) => {
    if (type === '') {
      onSkinTypesChange([]);
    } else {
      const newSelection = selectedSkinTypes.includes(type) 
        ? selectedSkinTypes.filter(item => item !== type)
        : [...selectedSkinTypes, type];
      onSkinTypesChange(newSelection);
    }
  };

  const toggleTypeSelection = (type) => {
    if (type === '') {
      onTypesChange([]);
    } else {
      const newSelection = selectedTypes.includes(type) 
        ? selectedTypes.filter(item => item !== type)
        : [...selectedTypes, type];
      onTypesChange(newSelection);
    }
  };

  // Clear all filters
  const handleClearAll = () => {
    onLinesChange([]);
    onProductTypesChange([]);
    onSkinTypesChange([]);
    onTypesChange([]);
  };

  // Mobile Filter controls component (keeps the original select-based design for mobile)
  const MobileFilterControls = () => (
    <Grid container spacing={3}>
      {/* Product Line Filter */}
      <Grid item xs={12}>
        <FormControl 
          fullWidth 
          size="medium"
          sx={{
            '& .MuiInputBase-root': {
              minHeight: 56,
            }
          }}
        >
          <InputLabel>קו מוצרים</InputLabel>
          <Select
            value={selectedLines[0] || ''}
            label="קו מוצרים"
            onChange={(e) => onLinesChange(e.target.value ? [e.target.value] : [])}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                  '& .MuiMenuItem-root': {
                    minHeight: 48,
                    fontSize: '1rem'
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
      <Grid item xs={12} sm={6}>
        <FormControl 
          fullWidth 
          size="medium"
          sx={{
            '& .MuiInputBase-root': {
              minHeight: 56,
            }
          }}
        >
          <InputLabel>סוג מוצר</InputLabel>
          <Select
            value={selectedProductTypes[0] || ''}
            label="סוג מוצר"
            onChange={(e) => onProductTypesChange(e.target.value ? [e.target.value] : [])}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                  '& .MuiMenuItem-root': {
                    minHeight: 48,
                    fontSize: '1rem'
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
      <Grid item xs={12} sm={6}>
        <FormControl 
          fullWidth 
          size="medium"
          sx={{
            '& .MuiInputBase-root': {
              minHeight: 56,
            }
          }}
        >
          <InputLabel>סוג עור</InputLabel>
          <Select
            value={selectedSkinTypes[0] || ''}
            label="סוג עור"
            onChange={(e) => onSkinTypesChange(e.target.value ? [e.target.value] : [])}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                  '& .MuiMenuItem-root': {
                    minHeight: 48,
                    fontSize: '1rem'
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
      <Grid item xs={12}>
        <FormControl 
          fullWidth 
          size="medium"
          sx={{
            '& .MuiInputBase-root': {
              minHeight: 56,
            }
          }}
        >
          <InputLabel>סוג אריזה</InputLabel>
          <Select
            value={selectedTypes[0] || ''}
            label="סוג אריזה"
            onChange={(e) => onTypesChange(e.target.value ? [e.target.value] : [])}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                  '& .MuiMenuItem-root': {
                    minHeight: 48,
                    fontSize: '1rem'
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
            <MobileFilterControls />
            
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
    <>
      {/* Header - only show when not in sidebar mode */}
      {!sidebarMode && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            סינון מוצרים
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip 
              label={`${activeFiltersCount} פעיל`}
              size="small"
              color="primary"
              variant="filled"
              sx={{ 
                fontSize: '0.75rem',
                height: 24,
                borderRadius: '12px'
              }}
            />
          )}
        </Box>
        {activeFiltersCount > 0 && (
          <Button
            size="small"
            startIcon={<ClearAllIcon />}
            onClick={handleClearAll}
            variant="outlined"
            sx={{ 
              fontSize: '0.875rem',
              borderRadius: '20px',
              px: 2
            }}
          >
            נקה הכל
          </Button>
        )}
      </Stack>
      )}
      
      {/* Product Line Row */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h7" sx={{ fontWeight: 500, mb: 2 }}>
          קו מוצרים
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label="הכל"
            onClick={disabled ? undefined : () => toggleLineSelection('')}
            variant={selectedLines.length === 0 ? 'filled' : 'outlined'}
            color={selectedLines.length === 0 ? 'primary' : 'default'}
            size="small"
            disabled={disabled}
            sx={{
              borderRadius: '20px',
              fontWeight: selectedLines.length === 0 ? 600 : 400,
              fontSize: '0.75rem',
              height: 28,
              opacity: disabled ? 0.6 : 1,
              '&:hover': {
                backgroundColor: disabled ? 'transparent' : (selectedLines.length === 0 ? 'primary.dark' : 'action.hover')
              }
            }}
          />
          {filterOptions.lines.map((line) => (
            <Chip
              key={line}
              label={line}
              onClick={disabled ? undefined : () => toggleLineSelection(line)}
              variant={selectedLines.includes(line) ? 'filled' : 'outlined'}
              color={selectedLines.includes(line) ? 'primary' : 'default'}
              size="small"
              disabled={disabled}
              sx={{
                borderRadius: '20px',
                fontWeight: selectedLines.includes(line) ? 600 : 400,
                fontSize: '0.75rem',
                height: 28,
                opacity: disabled ? 0.6 : 1,
                '&:hover': {
                  backgroundColor: disabled ? 'transparent' : (selectedLines.includes(line) ? 'primary.dark' : 'action.hover')
                }
              }}
            />
          ))}
        </Stack>
      </Box>
      {/* Product Type Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h7" sx={{ fontWeight: 500, mb: 2 }}>
          סוג מוצר
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              <Chip
                label="הכל"
                onClick={() => toggleProductTypeSelection('')}
                variant={selectedProductTypes.length === 0 ? 'filled' : 'outlined'}
                color={selectedProductTypes.length === 0 ? 'secondary' : 'default'}
                size="small"
                sx={{
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  height: 28,
                  fontWeight: selectedProductTypes.length === 0 ? 600 : 400
                }}
              />
              {filterOptions.productTypes.map((type) => (
                <Chip
                  key={type}
                  label={getProductTypeDisplay(type)}
                  onClick={() => toggleProductTypeSelection(type)}
                  variant={selectedProductTypes.includes(type) ? 'filled' : 'outlined'}
                  color={selectedProductTypes.includes(type) ? 'secondary' : 'default'}
                  size="small"
                  sx={{
                    borderRadius: '16px',
                    fontSize: '0.75rem',
                    height: 28,
                    fontWeight: selectedProductTypes.includes(type) ? 600 : 400
                  }}
                />
              ))}
        </Stack>
      </Box>

      {/* Skin Type Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h7" sx={{ fontWeight: 500, mb: 2 }}>
          סוג עור
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              <Chip
                label="הכל"
                onClick={() => toggleSkinTypeSelection('')}
                variant={selectedSkinTypes.length === 0 ? 'filled' : 'outlined'}
                color={selectedSkinTypes.length === 0 ? 'success' : 'default'}
                size="small"
                sx={{
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  height: 28,
                  fontWeight: selectedSkinTypes.length === 0 ? 600 : 400
                }}
              />
              {filterOptions.skinTypes.map((skinType) => (
                <Chip
                  key={skinType}
                  label={skinType}
                  onClick={() => toggleSkinTypeSelection(skinType)}
                  variant={selectedSkinTypes.includes(skinType) ? 'filled' : 'outlined'}
                  color={selectedSkinTypes.includes(skinType) ? 'success' : 'default'}
                  size="small"
                  sx={{
                    borderRadius: '16px',
                    fontSize: '0.75rem',
                    height: 28,
                    fontWeight: selectedSkinTypes.includes(skinType) ? 600 : 400
                  }}
                />
              ))}
        </Stack>
      </Box>

      {/* Package Type Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h7" sx={{ fontWeight: 500, mb: 2 }}>
          סוג אריזה
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              <Chip
                label="הכל"
                onClick={() => toggleTypeSelection('')}
                variant={selectedTypes.length === 0 ? 'filled' : 'outlined'}
                color={selectedTypes.length === 0 ? 'warning' : 'default'}
                size="small"
                sx={{
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  height: 28,
                  fontWeight: selectedTypes.length === 0 ? 600 : 400
                }}
              />
              {filterOptions.types.map((type) => (
                <Chip
                  key={type}
                  label={getTypeDisplayText(type)}
                  onClick={() => toggleTypeSelection(type)}
                  variant={selectedTypes.includes(type) ? 'filled' : 'outlined'}
                  color={selectedTypes.includes(type) ? 'warning' : 'default'}
                  size="small"
                  sx={{
                    borderRadius: '16px',
                    fontSize: '0.75rem',
                    height: 28,
                    fontWeight: selectedTypes.includes(type) ? 600 : 400
                  }}
                />
              ))}
        </Stack>
      </Box>
    </>
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
