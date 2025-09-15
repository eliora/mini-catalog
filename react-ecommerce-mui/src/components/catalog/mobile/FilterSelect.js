/**
 * FilterSelect Component
 * 
 * Reusable filter dropdown component for mobile catalog filters.
 * Provides consistent styling and behavior across all filter types.
 * 
 * @param {string} label - Filter label text
 * @param {string} value - Currently selected value  
 * @param {Function} onChange - Change handler function
 * @param {Array} options - Array of option values
 * @param {Function} getDisplayText - Optional function to transform option display
 * @param {Object} gridProps - Props for Grid item wrapper
 */

import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';

const FilterSelect = ({
  label,
  value,
  onChange,
  options = [],
  getDisplayText = (option) => option,
  gridProps = { xs: 12 }
}) => {
  return (
    <Grid item {...gridProps}>
      <FormControl 
        fullWidth 
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
    </Grid>
  );
};

export default FilterSelect;
