/**
 * useCatalogFilters Hook - Catalog Filter State Management
 * 
 * Custom hook for managing catalog filter state including search terms,
 * filter selections, and filter operations.
 * 
 * Features:
 * - Search term management with debouncing
 * - Multi-category filter management (lines, types, skin types)
 * - Active filter tracking and display
 * - Filter removal and clearing operations
 * - Real filter options from product data
 */

import React, { useState, useCallback, useMemo } from 'react';
import { getFilterOptions } from '@/api/products';

interface FilterOptions {
  lines: string[];
  productTypes: string[];
  skinTypes: string[];
  types: string[];
}

interface ActiveFilter {
  type: string;
  value: string;
  label: string;
}

interface Filters {
  searchTerm: string;
  lines: string[];
  productTypes: string[];
  skinTypes: string[];
  generalTypes: string[];
}

interface UseCatalogFiltersResult {
  // Filter state
  filters: Filters;
  searchTerm: string;
  selectedLines: string[];
  selectedProductTypes: string[];
  selectedSkinTypes: string[];
  selectedGeneralTypes: string[];
  
  // Filter options
  filterOptions: FilterOptions;
  
  // Filter operations
  setSearchTerm: (term: string) => void;
  setSelectedLines: (lines: string[]) => void;
  setSelectedProductTypes: (types: string[]) => void;
  setSelectedSkinTypes: (types: string[]) => void;
  setSelectedGeneralTypes: (types: string[]) => void;
  clearAllFilters: () => void;
  removeFilter: (filterType: string, value: string) => void;
  
  // Computed values
  activeFilters: ActiveFilter[];
  activeFilterCount: number;
}

export const useCatalogFilters = (): UseCatalogFiltersResult => {
  
  // ===== FILTER STATE =====
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [selectedGeneralTypes, setSelectedGeneralTypes] = useState<string[]>([]);
  
  // ===== FILTER OPTIONS STATE =====
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    lines: [],
    productTypes: [],
    skinTypes: [],
    types: []
  });
  
  // ===== LOAD FILTER OPTIONS =====
  React.useLayoutEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };

    loadFilterOptions();
  }, []);

  // ===== FILTER OPERATIONS =====
  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedLines([]);
    setSelectedProductTypes([]);
    setSelectedSkinTypes([]);
    setSelectedGeneralTypes([]);
  }, []);

  const removeFilter = useCallback((filterType: string, value: string) => {
    switch (filterType) {
      case 'search':
        setSearchTerm('');
        break;
      case 'line':
        setSelectedLines(prev => prev.filter(item => item !== value));
        break;
      case 'productType':
        setSelectedProductTypes(prev => prev.filter(item => item !== value));
        break;
      case 'skinType':
        setSelectedSkinTypes(prev => prev.filter(item => item !== value));
        break;
      case 'generalType':
        setSelectedGeneralTypes(prev => prev.filter(item => item !== value));
        break;
      default:
        break;
    }
  }, []);

  // ===== COMPUTED VALUES =====
  const filters = useMemo((): Filters => {
    const filterObj = {
      searchTerm: searchTerm.trim(),
      lines: selectedLines,
      productTypes: selectedProductTypes,
      skinTypes: selectedSkinTypes,
      generalTypes: selectedGeneralTypes
    };
    
    // Debug: Log filter changes
    console.log('🔍 Filter state updated:', filterObj);
    
    return filterObj;
  }, [searchTerm, selectedLines, selectedProductTypes, selectedSkinTypes, selectedGeneralTypes]);

  const activeFilters = useMemo((): ActiveFilter[] => {
    const filters: ActiveFilter[] = [];
    
    if (searchTerm.trim()) {
      filters.push({ type: 'search', value: searchTerm.trim(), label: `חיפוש: ${searchTerm.trim()}` });
    }
    
    selectedLines.forEach(line => {
      filters.push({ type: 'line', value: line, label: `קו: ${line}` });
    });
    
    selectedProductTypes.forEach(type => {
      filters.push({ type: 'productType', value: type, label: `סוג: ${type}` });
    });
    
    selectedSkinTypes.forEach(type => {
      filters.push({ type: 'skinType', value: type, label: `עור: ${type}` });
    });
    
    selectedGeneralTypes.forEach(type => {
      filters.push({ type: 'generalType', value: type, label: `כללי: ${type}` });
    });
    
    return filters;
  }, [searchTerm, selectedLines, selectedProductTypes, selectedSkinTypes, selectedGeneralTypes]);

  const activeFilterCount = useMemo((): number => {
    return activeFilters.length;
  }, [activeFilters]);

  // ===== RETURN OBJECT =====
  
  return {
    // Filter state
    filters,
    searchTerm,
    selectedLines,
    selectedProductTypes,
    selectedSkinTypes,
    selectedGeneralTypes,
    
    // Filter options
    filterOptions,
    
    // Filter operations
    setSearchTerm,
    setSelectedLines,
    setSelectedProductTypes,
    setSelectedSkinTypes,
    setSelectedGeneralTypes,
    clearAllFilters,
    removeFilter,
    
    // Computed values
    activeFilters,
    activeFilterCount
  };
};

export default useCatalogFilters;
