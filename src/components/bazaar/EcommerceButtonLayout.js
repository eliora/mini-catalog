import React from 'react';
import {
  Box,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import {
  TuneRounded as FilterIcon,
  ViewModuleRounded as GridIcon,
  ViewListRounded as ListIcon
} from '@mui/icons-material';

/**
 * EcommerceButtonLayout
 * - Compact action bar for catalog page
 * - Replaces removed Bazaar dependency with MUI-only implementation
 */
export default function EcommerceButtonLayout({
  onFilterClick,
  viewMode = 'catalog',
  onViewModeChange,
  compact = true
}) {
  const handleViewChange = (_event, next) => {
    if (!next || next === viewMode) return;
    if (onViewModeChange) onViewModeChange(next);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title="סינון" arrow>
        <IconButton color="primary" onClick={onFilterClick} size={compact ? 'small' : 'medium'}>
          <FilterIcon />
        </IconButton>
      </Tooltip>

      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={handleViewChange}
        size={compact ? 'small' : 'medium'}
        sx={{ mr: 0.5 }}
      >
        <ToggleButton value="catalog" aria-label="תצוגת קטלוג">
          <GridIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="compact" aria-label="תצוגה קומפקטית">
          <ListIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Cart and checkout buttons removed as requested */}
    </Box>
  );
}




