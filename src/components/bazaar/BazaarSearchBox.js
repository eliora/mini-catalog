import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import BazaarButton from './BazaarButton';

// Enhanced Search Input based on Bazaar Pro
const StyledSearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: theme.palette.grey[50],
    border: `1px solid ${theme.palette.grey[200]}`,
    transition: 'all 0.2s ease-in-out',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      backgroundColor: '#fff',
      borderColor: theme.palette.grey[300],
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '14px 16px',
    fontSize: 14,
    fontWeight: 500,
    '&::placeholder': {
      color: theme.palette.grey[500],
      opacity: 1,
    },
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(1.5),
  },
}));

const SearchSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  flex: 1,
  minWidth: 300,
  
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    width: '100%',
  },
}));

const ActionSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'stretch',
    '& > *': {
      flex: 1,
    },
  },
}));

const FilterButton = styled(Button)(({ theme }) => ({
  minWidth: 44,
  width: 44,
  height: 44,
  borderRadius: 12,
  color: theme.palette.grey[600],
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.grey[200]}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main + '08',
    borderColor: theme.palette.primary.main,
  },
}));

const ClearButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.grey[500],
  '&:hover': {
    color: theme.palette.error.main,
    backgroundColor: theme.palette.error.main + '08',
  },
}));

const BazaarSearchBox = ({
  placeholder = "Search...",
  value = "",
  onChange,
  onClear,
  onSearch,
  buttonText = "Add New",
  buttonIcon = <AddIcon />,
  onButtonClick,
  buttonHref,
  showFilter = true,
  onFilterClick,
  fullWidth = false,
  disabled = false,
  size = "medium",
  ...props
}) => {
  const [searchValue, setSearchValue] = useState(value);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSearchChange = (event) => {
    const newValue = event.target.value;
    setSearchValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    if (onClear) {
      onClear();
    }
    if (onChange) {
      onChange("");
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <SearchContainer>
      <SearchSection>
        <StyledSearchField
          fullWidth
          size={size}
          value={searchValue}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'grey.500', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <ClearButton size="small" onClick={handleClear}>
                  <ClearIcon sx={{ fontSize: 18 }} />
                </ClearButton>
              </InputAdornment>
            ),
          }}
          {...props}
        />
        
        {showFilter && (
          <FilterButton onClick={onFilterClick}>
            <FilterIcon sx={{ fontSize: 20 }} />
          </FilterButton>
        )}
      </SearchSection>

      <ActionSection>
        {buttonText && (
          <BazaarButton
            variant="contained"
            color="primary"
            startIcon={buttonIcon}
            onClick={onButtonClick}
            href={buttonHref}
            fullWidth={isMobile}
            sx={{ 
              minHeight: 44,
              whiteSpace: 'nowrap',
            }}
          >
            {buttonText}
          </BazaarButton>
        )}
      </ActionSection>
    </SearchContainer>
  );
};

// Alternative compact search input
const CompactSearchBox = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 25,
    backgroundColor: theme.palette.grey[50],
    height: 40,
    transition: 'all 0.2s ease-in-out',
    '& fieldset': {
      border: `1px solid ${theme.palette.grey[200]}`,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.grey[300],
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      '& fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '8px 16px',
    fontSize: 14,
    '&::placeholder': {
      color: theme.palette.grey[500],
      opacity: 1,
    },
  },
}));

// Filter chips component
const FilterChips = ({ filters, onRemoveFilter, onClearAll }) => {
  if (!filters || filters.length === 0) return null;

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
      {filters.map((filter, index) => (
        <Chip
          key={index}
          label={filter.label}
          onDelete={() => onRemoveFilter(filter.key)}
          size="small"
          sx={{
            borderRadius: 2,
            '& .MuiChip-deleteIcon': {
              fontSize: 16,
            },
          }}
        />
      ))}
      {filters.length > 1 && (
        <Button
          size="small"
          variant="text"
          onClick={onClearAll}
          sx={{ 
            minHeight: 'auto',
            padding: '4px 8px',
            fontSize: 12,
          }}
        >
          Clear All
        </Button>
      )}
    </Stack>
  );
};

export default BazaarSearchBox;
export { CompactSearchBox, FilterChips };
