/**
 * SimpleQuantityInput - Ultra-lightweight quantity control
 * 
 * Optimized for ProductDetailsDialog with minimal overhead.
 * No complex styling or animations for maximum performance.
 * 
 * @param {number} value - Current quantity
 * @param {Function} onIncrement - Increment handler
 * @param {Function} onDecrement - Decrement handler
 * @param {Function} onChange - Direct value change handler
 */

import React, { useState, useEffect } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

const SimpleQuantityInput = React.memo(({ 
  value = 0, 
  onIncrement, 
  onDecrement, 
  onChange 
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    const numValue = parseInt(newValue, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      onChange?.(numValue);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        onClick={onDecrement}
        disabled={value <= 0}
        size="small"
        sx={{ bgcolor: 'action.hover' }}
      >
        <RemoveIcon />
      </IconButton>

      <TextField
        value={inputValue}
        onChange={handleInputChange}
        size="small"
        sx={{ width: 80, '& input': { textAlign: 'center' } }}
        inputProps={{ min: 0, max: 99 }}
      />

      <IconButton
        onClick={onIncrement}
        size="small"
        sx={{ bgcolor: 'action.hover' }}
      >
        <AddIcon />
      </IconButton>
    </Box>
  );
});

export default SimpleQuantityInput;
