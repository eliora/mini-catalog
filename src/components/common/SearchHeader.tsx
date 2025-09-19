'use client';

import React from 'react';
import {
  Box,
  TextField,
  Chip,
  InputAdornment,
  IconButton,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

interface ActiveFilter {
  type: string;
  value: string;
  label: string;
}

interface SearchHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearSearch: () => void;
  placeholder?: string;
  filteredCount?: number;
  countLabel?: string;
  activeFilters?: ActiveFilter[];
  onFilterRemove?: (type: string, value: string) => void;
  actions?: React.ReactNode;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  placeholder = "חיפוש...",
  filteredCount: _filteredCount, // eslint-disable-line @typescript-eslint/no-unused-vars
  countLabel: _countLabel = "פריטים", // eslint-disable-line @typescript-eslint/no-unused-vars
  activeFilters = [],
  onFilterRemove,
  actions
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      {/* Search Bar */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 2,
        flexWrap: { xs: 'wrap', md: 'nowrap' }
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'background.paper',
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={onClearSearch}
                  edge="end"
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        {/* Actions (Filter button, view mode, etc.) */}
        {actions && (
          <Box sx={{ 
            flexShrink: 0,
            width: { xs: '100%', md: 'auto' }
          }}>
            {actions}
          </Box>
        )}
      </Box>

      {/* Active Filters */}
      {activeFilters && activeFilters.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mt: 1
        }}>
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              flexWrap: 'wrap', 
              gap: 1,
              marginRight: 'auto' // In RTL layout, this pushes to the right side
            }}
          >
            {activeFilters.map((filter, index) => (
              <Chip
                key={index}
                label={filter.label}
                onDelete={onFilterRemove ? () => onFilterRemove(filter.type, filter.value) : undefined}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  '& .MuiChip-deleteIcon': {
                    fontSize: '18px'
                  }
                }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(SearchHeader);

