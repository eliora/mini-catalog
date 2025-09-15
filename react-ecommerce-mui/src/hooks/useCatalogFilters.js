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
 * 
 * @returns {Object} Filter state and operations
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { getFilterOptions } from '../api/products';

export const useCatalogFilters = () => {
  // ===== FILTER STATE =====
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLines, setSelectedLines] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState([]);
  const [selectedGeneralTypes, setSelectedGeneralTypes] = useState([]);
  
  // ===== FILTER OPTIONS STATE =====
  const [filterOptions, setFilterOptions] = useState({
    lines: [],
    productTypes: [],
    skinTypes: [],
    types: []
  });

  // ===== FILTER OPERATIONS =====
  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedLines([]);
    setSelectedProductTypes([]);
    setSelectedSkinTypes([]);
    setSelectedGeneralTypes([]);
  }, []);

  const removeFilter = useCallback((filterType, value) => {
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
  const filters = useMemo(() => {
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

  const activeFilters = useMemo(() => {
    const filters = [];
    
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

  const activeFilterCount = useMemo(() => {
    return activeFilters.length;
  }, [activeFilters]);

  // ===== LOAD FILTER OPTIONS =====
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Failed to load filter options:', error);
        // Keep empty arrays as fallback
      }
    };

    loadFilterOptions();
  }, []);

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