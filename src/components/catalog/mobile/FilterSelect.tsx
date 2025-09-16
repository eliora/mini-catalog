'use client';

/**
 * FilterSelect Component
 * 
 * Reusable filter dropdown component for mobile catalog filters.
 * Provides consistent styling and behavior across all filter types.
 */

import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, SelectChangeEvent } from '@mui/material';

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (event: SelectChangeEvent) => void;
  options?: string[];
  getDisplayText?: (option: string) => string;
  fullWidth?: boolean;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  value,
  onChange,
  options = [],
  getDisplayText = (option) => option,
  fullWidth = true
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <FormControl 
        fullWidth={fullWidth}
        size="medium"
        sx={{
          '& .MuiInputBase-root': {
            minHeight: 56,
          }
        }}
      >
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          label={label}
          onChange={onChange}
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
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {getDisplayText(option)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default FilterSelect;
