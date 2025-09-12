import React, { useState } from 'react';
import {
  Box,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

/**
 * Compact mobile filter solution using chips and modal
 * Supports multi-choice selections in a compact format
 */
const MobileFilterChips = ({
  filterOptions,
  selectedLines,
  selectedProductTypes,
  selectedSkinTypes,
  selectedTypes,
  onLinesChange,
  onProductTypesChange,
  onSkinTypesChange,
  onTypesChange,
  disabled = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [dialogOpen, setDialogOpen] = useState(false);

  // Only show on mobile
  if (!isMobile) return null;

  const activeFiltersCount = selectedLines.length + selectedProductTypes.length + 
                           selectedSkinTypes.length + selectedTypes.length;

  const handleClearAll = () => {
    onLinesChange([]);
    onProductTypesChange([]);
    onSkinTypesChange([]);
    onTypesChange([]);
  };

  // Toggle selection helpers
  const toggleLineSelection = (line) => {
    const newSelection = selectedLines.includes(line)
      ? selectedLines.filter(item => item !== line)
      : [...selectedLines, line];
    onLinesChange(newSelection);
  };

  const toggleProductTypeSelection = (type) => {
    const newSelection = selectedProductTypes.includes(type)
      ? selectedProductTypes.filter(item => item !== type)
      : [...selectedProductTypes, type];
    onProductTypesChange(newSelection);
  };

  const toggleSkinTypeSelection = (type) => {
    const newSelection = selectedSkinTypes.includes(type)
      ? selectedSkinTypes.filter(item => item !== type)
      : [...selectedSkinTypes, type];
    onSkinTypesChange(newSelection);
  };

  const toggleTypeSelection = (type) => {
    const newSelection = selectedTypes.includes(type)
      ? selectedTypes.filter(item => item !== type)
      : [...selectedTypes, type];
    onTypesChange(newSelection);
  };

  return (
    <>
      {/* Compact Filter Bar */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        mb: 2
      }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
          {/* Filter Button */}
          <Chip
            icon={<FilterIcon />}
            label={`מסננים${activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}`}
            onClick={() => setDialogOpen(true)}
            color={activeFiltersCount > 0 ? "primary" : "default"}
            variant={activeFiltersCount > 0 ? "filled" : "outlined"}
            disabled={disabled}
            sx={{ 
              borderRadius: '20px',
              fontWeight: 600,
              minWidth: 'fit-content'
            }}
          />

          {/* Clear All Button */}
          {activeFiltersCount > 0 && (
            <Chip
              label="נקה הכל"
              onClick={handleClearAll}
              onDelete={handleClearAll}
              deleteIcon={<ClearIcon />}
              color="error"
              variant="outlined"
              size="small"
              sx={{ borderRadius: '16px' }}
            />
          )}

          {/* Active Filter Preview Chips */}
          {selectedLines.slice(0, 2).map(line => (
            <Chip
              key={`preview-line-${line}`}
              label={line}
              size="small"
              color="secondary"
              onDelete={() => toggleLineSelection(line)}
              sx={{ fontSize: '0.7rem', height: 24 }}
            />
          ))}
          {selectedProductTypes.slice(0, 1).map(type => (
            <Chip
              key={`preview-type-${type}`}
              label={type}
              size="small"
              color="success"
              onDelete={() => toggleProductTypeSelection(type)}
              sx={{ fontSize: '0.7rem', height: 24 }}
            />
          ))}
          {(selectedLines.length > 2 || selectedProductTypes.length > 1 || 
            selectedSkinTypes.length > 0 || selectedTypes.length > 0) && (
            <Chip
              label={`+${activeFiltersCount - selectedLines.slice(0, 2).length - selectedProductTypes.slice(0, 1).length}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 24 }}
            />
          )}
        </Stack>
      </Box>

      {/* Full Filter Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          pb: 1
        }}>
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
        </DialogTitle>

        <DialogContent>
          {/* Product Lines */}
          {filterOptions?.lines && filterOptions.lines.length > 0 && (
            <>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                קו מוצרים
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 2 }}>
                {filterOptions.lines.map(line => (
                  <Chip
                    key={line}
                    label={line}
                    onClick={() => toggleLineSelection(line)}
                    color={selectedLines.includes(line) ? "secondary" : "default"}
                    variant={selectedLines.includes(line) ? "filled" : "outlined"}
                    size="small"
                    sx={{ borderRadius: '20px' }}
                  />
                ))}
              </Stack>
            </>
          )}

          {/* Product Types */}
          {filterOptions?.productTypes && filterOptions.productTypes.length > 0 && (
            <>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                סוג מוצר
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 2 }}>
                {filterOptions.productTypes.map(type => (
                  <Chip
                    key={type}
                    label={type}
                    onClick={() => toggleProductTypeSelection(type)}
                    color={selectedProductTypes.includes(type) ? "success" : "default"}
                    variant={selectedProductTypes.includes(type) ? "filled" : "outlined"}
                    size="small"
                    sx={{ borderRadius: '16px' }}
                  />
                ))}
              </Stack>
            </>
          )}

          {/* Skin Types */}
          {filterOptions?.skinTypes && filterOptions.skinTypes.length > 0 && (
            <>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                סוג עור
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 2 }}>
                {filterOptions.skinTypes.map(type => (
                  <Chip
                    key={type}
                    label={type}
                    onClick={() => toggleSkinTypeSelection(type)}
                    color={selectedSkinTypes.includes(type) ? "warning" : "default"}
                    variant={selectedSkinTypes.includes(type) ? "filled" : "outlined"}
                    size="small"
                    sx={{ borderRadius: '16px' }}
                  />
                ))}
              </Stack>
            </>
          )}

          {/* General Types */}
          {filterOptions?.types && filterOptions.types.length > 0 && (
            <>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                סוג אריזה
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 2 }}>
                {filterOptions.types.map(type => (
                  <Chip
                    key={type}
                    label={type}
                    onClick={() => toggleTypeSelection(type)}
                    color={selectedTypes.includes(type) ? "info" : "default"}
                    variant={selectedTypes.includes(type) ? "filled" : "outlined"}
                    size="small"
                    sx={{ borderRadius: '16px' }}
                  />
                ))}
              </Stack>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          {activeFiltersCount > 0 && (
            <Button
              onClick={handleClearAll}
              color="error"
              variant="outlined"
              startIcon={<ClearIcon />}
            >
              נקה הכל
            </Button>
          )}
          <Button
            onClick={() => setDialogOpen(false)}
            variant="contained"
            color="primary"
          >
            סגור
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MobileFilterChips;
