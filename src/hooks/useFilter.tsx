import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { KVFilter, Filters } from '../types';
import { setFilters } from '../store';
import { RootState } from '../store';
import { useGraphContext } from '../context/GraphContext';

/**
 * Types of filters that can be applied
 */
export type FilterType = 'node' | 'edge' | 'both';

/**
 * Filter action to be taken when a filter is applied
 */
export type FilterAction = {
  type: FilterType;
  handler: (filters: KVFilter[]) => void;
  description: string;
};

/**
 * Hook for managing and applying filters
 * This provides a centralized way to handle filters across the application
 * Integrates both GraphContext and Redux store for state management
 */
export const useFilter = () => {
  // Get Redux dispatch and state
  const dispatch = useDispatch();
  const graphState = useSelector((state: RootState) => state.graph);
  
  // Get graph context
  const { state, dispatch: contextDispatch, limits, setLimits } = useGraphContext();
  
  // Get filter state from GraphContext
  const nodeFilters = state.nodeFilters;
  const edgeFilters = state.edgeFilters;
  const nodeLimit = limits?.nodeLimit || graphState.filters.nodeLimit || 100;
  const edgeLimit = limits?.edgeLimit || graphState.filters.edgeLimit || 100;
  
  // State for filter form UI (keeping this as local state since it's UI-specific)
  const [filterFormVisible, setFilterFormVisible] = useState(false);
  const [newFilterKey, setNewFilterKey] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [pendingFilter, setPendingFilter] = useState(false);
  
  // Track if there are unsaved limit changes
  const [hasLimitChanges, setHasLimitChanges] = useState(false);
  const [pendingLimits, setPendingLimits] = useState<{nodeLimit: number, edgeLimit: number}>({ 
    nodeLimit: nodeLimit, 
    edgeLimit: edgeLimit 
  });
  
  // Update pending limits when context values change
  useEffect(() => {
    setPendingLimits({
      nodeLimit: nodeLimit,
      edgeLimit: edgeLimit
    });
  }, [nodeLimit, edgeLimit]);
  
  /**
   * Helper function to check if two filter arrays are equivalent
   * Implements deep comparison for optimized filter application
   */
  const areFiltersEqual = useCallback((filtersA: KVFilter[], filtersB: KVFilter[]): boolean => {
    if (filtersA.length !== filtersB.length) return false;
    
    // Create a deep copy for comparison
    const sortedA = [...filtersA].sort((a, b) => a.key.localeCompare(b.key));
    const sortedB = [...filtersB].sort((a, b) => a.key.localeCompare(b.key));
    
    // Compare each filter
    for (let i = 0; i < sortedA.length; i++) {
      const filterA = sortedA[i];
      const filterB = sortedB[i];
      
      // Compare keys
      if (filterA.key !== filterB.key) return false;
      
      // Compare values (order-independent)
      const valuesA = [...filterA.values].sort();
      const valuesB = [...filterB.values].sort();
      
      if (valuesA.length !== valuesB.length) return false;
      
      for (let j = 0; j < valuesA.length; j++) {
        if (valuesA[j] !== valuesB[j]) return false;
      }
    }
    
    return true;
  }, []);
  
  // Define filter actions
  const filterActions: Record<string, FilterAction> = useMemo(() => ({
    // Node filter actions
    filterNodesByType: {
      type: 'node',
      handler: (newFilters: KVFilter[]) => {
        if (!areFiltersEqual(nodeFilters, newFilters)) {
          contextDispatch({ type: 'SET_NODE_FILTERS', payload: newFilters });
        }
      },
      description: 'Filter nodes by their type attribute'
    },
    filterNodesByName: {
      type: 'node',
      handler: (newFilters: KVFilter[]) => {
        if (!areFiltersEqual(nodeFilters, newFilters)) {
          contextDispatch({ type: 'SET_NODE_FILTERS', payload: newFilters });
        }
      },
      description: 'Filter nodes by their name attribute'
    },
    
    // Edge filter actions
    filterEdgesByType: {
      type: 'edge',
      handler: (newFilters: KVFilter[]) => {
        if (!areFiltersEqual(edgeFilters, newFilters)) {
          contextDispatch({ type: 'SET_EDGE_FILTERS', payload: newFilters });
        }
      },
      description: 'Filter edges by their type attribute'
    },
    filterEdgesBySource: {
      type: 'edge',
      handler: (newFilters: KVFilter[]) => {
        if (!areFiltersEqual(edgeFilters, newFilters)) {
          contextDispatch({ type: 'SET_EDGE_FILTERS', payload: newFilters });
        }
      },
      description: 'Filter edges by their source node'
    },
    
    // Combined filter actions
    filterByRelationship: {
      type: 'both',
      handler: (newFilters: KVFilter[]) => {
        if (!areFiltersEqual(nodeFilters, newFilters) || !areFiltersEqual(edgeFilters, newFilters)) {
          contextDispatch({ type: 'SET_FILTERS', payload: newFilters });
        }
      },
      description: 'Filter both nodes and edges based on their relationships'
    }
  }), [nodeFilters, edgeFilters, contextDispatch, areFiltersEqual]);
  
  /**
   * Apply a filter with a specific action
   */
  const applyFilter = useCallback((actionKey: string, newFilters: KVFilter[]) => {
    const action = filterActions[actionKey];
    if (!action) {
      console.error(`Filter action "${actionKey}" not found`);
      return;
    }
    
    // Apply the filter using the handler defined in the action
    action.handler(newFilters);
    
    // Also update Redux store for backward compatibility
    const updatedStoreFilters: Filters = { 
      ...graphState.filters,
      nodeFilters: action.type === 'node' || action.type === 'both' ? [...newFilters] : graphState.filters.nodeFilters,
      edgeFilters: action.type === 'edge' || action.type === 'both' ? [...newFilters] : graphState.filters.edgeFilters
    };
    
    dispatch(setFilters(updatedStoreFilters));
  }, [filterActions, dispatch, graphState.filters]);
  
  /**
   * Add a new filter
   */
  const addFilter = useCallback((key: string, values: string[], actionKey: string) => {
    if (!key || values.length === 0 || !actionKey) return;
    
    const action = filterActions[actionKey];
    if (!action) {
      console.error(`Filter action "${actionKey}" not found`);
      return;
    }
    
    // Determine which filters to update based on the action type
    let filtersToUpdate: KVFilter[] = [];
    if (action.type === 'node' || action.type === 'both') {
      filtersToUpdate = [...nodeFilters];
    } else if (action.type === 'edge') {
      filtersToUpdate = [...edgeFilters];
    }
    
    // Check if the filter already exists
    const existingFilterIndex = filtersToUpdate.findIndex(f => f.key === key);
    
    if (existingFilterIndex >= 0) {
      // Update existing filter
      const updatedFilter = { ...filtersToUpdate[existingFilterIndex] };
      // Use Array.from() instead of spread operator with Set to avoid TS error
      const uniqueValues = Array.from(new Set([...updatedFilter.values, ...values]));
      updatedFilter.values = uniqueValues;
      
      const updatedFilters = [...filtersToUpdate];
      updatedFilters[existingFilterIndex] = updatedFilter;
      
      applyFilter(actionKey, updatedFilters);
    } else {
      // Add new filter
      const newFilter: KVFilter = { key, values };
      const updatedFilters = [...filtersToUpdate, newFilter];
      
      applyFilter(actionKey, updatedFilters);
    }
    
    // Reset UI state
    setNewFilterKey('');
    setSelectedValues([]);
    setPendingFilter(false);
  }, [nodeFilters, edgeFilters, filterActions, applyFilter]);
  
  /**
   * Remove a filter
   */
  const removeFilter = useCallback((key: string, actionKey: string) => {
    const action = filterActions[actionKey];
    if (!action) {
      console.error(`Filter action "${actionKey}" not found`);
      return;
    }
    
    // Determine which filters to update based on the action type
    let filtersToUpdate: KVFilter[] = [];
    if (action.type === 'node' || action.type === 'both') {
      filtersToUpdate = [...nodeFilters];
    } else if (action.type === 'edge') {
      filtersToUpdate = [...edgeFilters];
    }
    
    const updatedFilters = filtersToUpdate.filter(filter => filter.key !== key);
    applyFilter(actionKey, updatedFilters);
  }, [nodeFilters, edgeFilters, filterActions, applyFilter]);
  
  /**
   * Clear all filters for a specific action
   */
  const clearActionFilters = useCallback((actionKey: string) => {
    const action = filterActions[actionKey];
    if (!action) {
      console.error(`Filter action "${actionKey}" not found`);
      return;
    }
    
    applyFilter(actionKey, []);
  }, [filterActions, applyFilter]);
  
  /**
   * Apply pending limit changes
   */
  const applyLimits = useCallback(() => {
    if (!hasLimitChanges) return;
    
    // Update context limits
    setLimits(pendingLimits);
    
    // Update Redux store limits for backward compatibility
    const updatedStoreFilters = {
      ...graphState.filters,
      nodeLimit: pendingLimits.nodeLimit,
      edgeLimit: pendingLimits.edgeLimit
    };
    
    dispatch(setFilters(updatedStoreFilters));
    setHasLimitChanges(false);
  }, [hasLimitChanges, pendingLimits, setLimits, graphState.filters, dispatch]);
  
  /**
   * Update a pending limit value
   */
  const updatePendingLimit = useCallback((type: 'node' | 'edge', value: number) => {
    if (value < 0) return;
    
    setPendingLimits(prev => {
      const updated = type === 'node' 
        ? { ...prev, nodeLimit: value }
        : { ...prev, edgeLimit: value };
      
      // Check if there are actual changes
      const hasChanges = 
        updated.nodeLimit !== nodeLimit ||
        updated.edgeLimit !== edgeLimit;
      
      setHasLimitChanges(hasChanges);
      return updated;
    });
  }, [nodeLimit, edgeLimit]);
  
  /**
   * Reset pending limit changes
   */
  const resetLimits = useCallback(() => {
    setPendingLimits({
      nodeLimit: nodeLimit,
      edgeLimit: edgeLimit
    });
    setHasLimitChanges(false);
  }, [nodeLimit, edgeLimit]);
  
  /**
   * Clear all filters
   */
  const clearAllFilters = useCallback(() => {
    // Clear GraphContext filters
    contextDispatch({ type: 'SET_NODE_FILTERS', payload: [] });
    contextDispatch({ type: 'SET_EDGE_FILTERS', payload: [] });
    
    // Clear Redux store filters
    const updatedStoreFilters = {
      ...graphState.filters,
      nodeFilters: [],
      edgeFilters: []
    };
    
    dispatch(setFilters(updatedStoreFilters));
  }, [contextDispatch, graphState.filters, dispatch]);
  
  /**
   * Reset filter form state
   */
  const resetFilterForm = useCallback(() => {
    setFilterFormVisible(false);
    setNewFilterKey('');
    setSelectedValues([]);
    setPendingFilter(false);
  }, []);
  
  /**
   * For backward compatibility with components using the old API
   */
  const setFilter = useCallback((actionKey: string, newFilters: KVFilter[]) => {
    applyFilter(actionKey, newFilters);
  }, [applyFilter]);
  
  return {
    // Filter state
    nodeFilters,
    edgeFilters,
    nodeLimit,
    edgeLimit,
    
    // UI state
    filterFormVisible,
    setFilterFormVisible,
    newFilterKey,
    setNewFilterKey,
    selectedValues,
    setSelectedValues,
    pendingFilter,
    setPendingFilter,
    
    // Limit state
    pendingLimits,
    hasLimitChanges,
    
    // Filter actions
    filterActions,
    applyFilter,
    addFilter,
    removeFilter,
    clearActionFilters,
    clearAllFilters,
    resetFilterForm,
    
    // Limit actions
    updatePendingLimit,
    applyLimits,
    resetLimits
  };
};
