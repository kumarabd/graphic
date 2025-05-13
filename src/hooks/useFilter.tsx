import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { KVFilter } from '../types';
import { RootState, setFilters } from '../store';
import cytoscape from 'cytoscape';
import { FilterType } from '../types';
import { useCytoscape } from '../context/CytoscapeContext';
import { fetchPropertyIds, fetchEntityIds } from '../fetchGraphData';

/**
 * Hook for managing and applying filters using Cytoscape's built-in filtering capabilities
 * Focused specifically on Cytoscape-based filtering operations
 */
export const useFilter = () => {
  // Initialize Redux dispatch
  const dispatch = useDispatch();
  
  // Get filter state from Redux
  const { filters } = useSelector((state: RootState) => state.graph);
  
  // Get the Cytoscape instance directly from context each time
  // This ensures we always have the latest instance
  const { cyInstance, applyLayout, resetView } = useCytoscape();
  
  // Extract node and edge filters from Redux state
  const nodeFilters = filters.node.filter;
  const edgeFilters = filters.edge.filter;
  
  // State for filter form UI (keeping most UI state local except filterKey)
  const [filterFormVisible, setFilterFormVisible] = useState(false);
  const [newFilterKey, setNewFilterKey] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [pendingFilter, setPendingFilter] = useState(false);

  /**
   * Apply a filter to the Cytoscape instance
   * This uses Cytoscape's selector query syntax for efficient filtering
   */
  const applyCytoscapeFilter = useCallback(async (actionKey: string, filters: KVFilter) => {
    if (!cyInstance) {
      console.warn('Cytoscape instance not available for filtering');
      return;
    }
    
    console.log('Applying filters:', filters);
    console.log('Total nodes:', cyInstance.nodes().length);
    console.log('Total edges:', cyInstance.edges().length);
    
    // If no filters, show everything
    if (filters.size === 0) {
      cyInstance.elements().style('display', 'element');
      console.log('No filters to apply, showing all elements');
      return;
    }
    
    // First hide all elements
    cyInstance.nodes().style('display', 'none');
    
    if (actionKey.includes('Node')) {
      // Convert Map entries to array for compatibility
      for (const [key, values] of Array.from(filters.entries())) {
      if (key.toLowerCase() === 'label' || key.toLowerCase() === 'type') {
          let selector = ``;
          console.log("applying legacy filter")
          values.forEach(value => {
            if (selector.length > 0) {
              selector = selector + ',';
            }
            selector = selector + `[${key} = "${value}"]`;
          });
          selector = `node${selector}`;
          console.log('Using selector:', selector);
          cyInstance.filter(selector).style('display', 'element');
        } else {
          console.log("applying filter from network")
          // Fetch the list of property ids
          const propertyIds = await fetchPropertyIds(key, values);
          // Fetch the entity ids for the property ids
          const entityIds = await fetchEntityIds(propertyIds);
          entityIds.forEach(id => {
            cyInstance.getElementById(id).style('display', 'element');
          });
        }
      }     
    }
    cyInstance.nodes().forEach(node => {
      if (node.data('parent')) {
        node.parent().style('display', 'element');
      }
    });
  }, [cyInstance]);

  /**
   * Add a new filter
   */
  const addFilter = useCallback(async (key: string, values: string[], actionKey: string) => {
    if (!key || values.length === 0) return;
    
    // Create a new Map with the existing filters plus the new one
    const newNodeFilters = new Map(nodeFilters);
    newNodeFilters.set(key, values);
    
    // Apply the filters using the new Map
    await applyCytoscapeFilter(actionKey, newNodeFilters);

    // Store the update state of filter in Redux
    if (actionKey.includes('Node')) {
      dispatch(setFilters({
        ...filters,
        node: {
          ...filters.node,
          filter: newNodeFilters
        }
      }));
    } else if (actionKey.includes('Edge')) {
      // Create a new Map for edge filters
      const newEdgeFilters = new Map(edgeFilters);
      newEdgeFilters.set(key, values);
      
      dispatch(setFilters({
        ...filters,
        edge: {
          ...filters.edge,
          filter: newEdgeFilters
        }
      }));
    } else {
      // Create new Maps for both node and edge filters
      const newNodeFilters = new Map(nodeFilters);
      const newEdgeFilters = new Map(edgeFilters);
      newNodeFilters.set(key, values);
      newEdgeFilters.set(key, values);
      
      dispatch(setFilters({
        ...filters,
        node: {
          ...filters.node,
          filter: newNodeFilters
        },
        edge: {
          ...filters.edge,
          filter: newEdgeFilters
        }
      }));
    }
    
    // Reset UI state
    resetFilterForm();
  }, [nodeFilters, edgeFilters, applyCytoscapeFilter, filters, dispatch]);
  
  /**
   * Remove a filter
   */
  const removeFilter = useCallback(async (key: string, actionKey: string) => {
    if (actionKey.includes('Node')) {
      // Create a new Map without the filter to be removed
      const newNodeFilters = new Map(nodeFilters);
      newNodeFilters.delete(key);
      
      // Apply the updated filters
      await applyCytoscapeFilter('node', newNodeFilters);
      
      // Update Redux store with the new filters
      dispatch(setFilters({
        ...filters,
        node: {
          ...filters.node,
          filter: newNodeFilters
        }
      }));
    } else if (actionKey.includes('Edge')) {
      // Create a new Map without the filter to be removed
      const newEdgeFilters = new Map(edgeFilters);
      newEdgeFilters.delete(key);
      
      // Apply the updated filters
      await applyCytoscapeFilter('edge', newEdgeFilters);
      
      // Update Redux store with the new filters
      dispatch(setFilters({
        ...filters,
        edge: {
          ...filters.edge,
          filter: newEdgeFilters
        }
      }));
    }
  }, [nodeFilters, edgeFilters, applyCytoscapeFilter, filters, dispatch]);
  
  /**
   * Reset filter form state
   */
  const resetFilterForm = useCallback(() => {
    setFilterFormVisible(false);
    setNewFilterKey('');
    setPendingFilter(false);
  }, []);
  
  return {
    // Filter state
    nodeFilters,
    edgeFilters,
    
    // UI state
    filterFormVisible,
    setFilterFormVisible,
    newFilterKey,
    setNewFilterKey,
    pendingFilter,
    setPendingFilter,
    
    // Filter actions
    addFilter,
    removeFilter,
    resetFilterForm,
    
    // Cytoscape integration
    applyCytoscapeFilter,
  };
};
