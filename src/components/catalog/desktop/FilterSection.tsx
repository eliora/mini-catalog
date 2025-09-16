'use client';

/**
 * FilterSection Component
 * 
 * Reusable filter section that displays a multi-select dropdown
 * with chips showing selected values and clear functionality.
 */

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Stack,
  SelectChangeEvent
} from '@mui/material';

interface FilterSectionProps {
  title: string;
  options?: string[];
  selectedValues?: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  getDisplayText?: (value: string) => string;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  options = [],
  selectedValues = [],
  onChange,
  disabled = false,
  getDisplayText = (value) => value
}) => {
  const handleSelectChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onChange(typeof value === 'string' ? value.split(',') : value);
  };

  const handleChipDelete = (valueToDelete: string) => {
    onChange(selectedValues.filter(value => value !== valueToDelete));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Section Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1
      }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            fontSize: '1rem'
          }}
        >
          {title}
        </Typography>
        {selectedValues.length > 0 && (
          <Typography
            variant="caption"
            onClick={clearAll}
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            נקה הכל
          </Typography>
        )}
      </Box>

      {/* Multi-Select Dropdown */}
      <FormControl fullWidth size="small" disabled={disabled}>
        <InputLabel>{title}</InputLabel>
        <Select
          multiple
          value={selectedValues}
          onChange={handleSelectChange}
          label={title}
          renderValue={() => `נבחרו ${selectedValues.length}`}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300,
              },
            },
          }}
        >
          {options.map((option) => (
            <MenuItem 
              key={option} 
              value={option}
              sx={{
                backgroundColor: selectedValues.includes(option) 
                  ? 'action.selected' 
                  : 'transparent'
              }}
            >
              {getDisplayText(option)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Selected Values as Chips */}
      {selectedValues.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
          {selectedValues.map((value) => (
            <Chip
              key={value}
              label={getDisplayText(value)}
              onDelete={() => handleChipDelete(value)}
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                '& .MuiChip-deleteIcon': {
                  fontSize: '16px'
                }
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default FilterSection;
