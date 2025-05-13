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
  const { setCyInstance, cyInstance, applyLayout, resetView } = useCytoscape();
  
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
  const applyCytoscapeFilterWithIDs = useCallback((actionKey: string, filters: string[]) => {
    if (!cyInstance) {
      console.warn('Cytoscape instance not available for filtering');
      return;
    }
    
    console.log('Applying filters:', filters);
    console.log('Total nodes:', cyInstance.nodes().length);
    console.log('Total edges:', cyInstance.edges().length);
    
    // If no filters, show everything
    if (filters.length === 0) {
      cyInstance.elements().style('display', 'element');
      console.log('No filters to apply, showing all elements');
      return;
    }
    
    // First hide all elements
    cyInstance.nodes().style('display', 'none');
    
    let nodesToShow = cyInstance.nodes();
    if (actionKey.includes('Node')) {
      // Create a collection of nodes that match the filter IDs
      const filteredNodes = filters.reduce((collection, id) => {
        const node = cyInstance.getElementById(id);
        return node.length > 0 ? collection.union(node) : collection;
      }, cyInstance.collection());
      
      // Intersect with the current nodes
      nodesToShow = nodesToShow.intersection(filteredNodes);
    }
    nodesToShow.forEach(node => {
      node.style('display', 'element');
      if (node.data('parent')) {
        cyInstance.nodes(`node[id = "${node.data('parent')}"]`).style('display', 'element');
      }
    });
  }, [cyInstance, resetView]);
  
  /**
   * Apply a filter to the Cytoscape instance
   * This uses Cytoscape's selector query syntax for efficient filtering
   */
  const applyCytoscapeFilter = useCallback((actionKey: string, filters: KVFilter[]) => {
    if (!cyInstance) {
      console.warn('Cytoscape instance not available for filtering');
      return;
    }
    
    console.log('Applying filters:', filters);
    console.log('Total nodes:', cyInstance.nodes().length);
    console.log('Total edges:', cyInstance.edges().length);
    
    // If no filters, show everything
    if (filters.length === 0) {
      cyInstance.elements().style('display', 'element');
      console.log('No filters to apply, showing all elements');
      return;
    }
    
    // First hide all elements
    cyInstance.nodes().style('display', 'none');
    
    let nodesToShow = cyInstance.nodes();
    if (actionKey.includes('Node')) {
      filters.forEach(filter => {
        let selector = ``;
        filter.values.forEach(value => {
          if (selector.length > 0) {
            selector = selector + ',';
          }
          selector = selector + `[${filter.key} = "${value}"]`;
        });
        selector = `node${selector}`;
        console.log('Using selector:', selector);
        nodesToShow = nodesToShow.filter(selector);
      });     
    }
    nodesToShow.forEach(node => {
      node.style('display', 'element');
      if (node.data('parent')) {
        cyInstance.nodes(`node[id = "${node.data('parent')}"]`).style('display', 'element');
      }
    });
  }, [cyInstance, resetView]);

  /**
   * Add a new filter
   */
  const addFilter = useCallback(async (key: string, values: string[], actionKey: string) => {
    if (!key || values.length === 0) return;
    
    // Create a new filter
    const newFilter: KVFilter = { key, values };
    if (key.toLowerCase() === 'label' || key.toLowerCase() === 'type') {
      applyCytoscapeFilter(key, [...nodeFilters, newFilter]);
    } else {
      // Fetch the list of property ids
      const propertyIds = await fetchPropertyIds(key, values);
      // Fetch the entity ids for the property ids
      const entityIds = await fetchEntityIds(propertyIds);
      applyCytoscapeFilterWithIDs(key, entityIds);
      // newFilter = { key, values };
      // applyCytoscapeFilterWithIDs(key, [...nodeFilterIDs, newFilter]);
      console.log("applying filter from network")
    }

    // Store the update state of filter in Redux
    if (actionKey.includes('Node')) {
      dispatch(setFilters({
        ...filters,
        node: {
          ...filters.node,
          filter: [...nodeFilters, newFilter]
        }
      }));
    } else if (actionKey.includes('Edge')) {
      dispatch(setFilters({
        ...filters,
        edge: {
          ...filters.edge,
          filter: [...edgeFilters, newFilter]
        }
      }));
    } else {
      dispatch(setFilters({
        ...filters,
        node: {
          ...filters.node,
          filter: [...nodeFilters, newFilter]
        },
        edge: {
          ...filters.edge,
          filter: [...edgeFilters, newFilter]
        }
      }));
    }
    
    // Reset UI state
    resetFilterForm();
  }, [nodeFilters, edgeFilters, applyCytoscapeFilter, filters, dispatch]);
  
  /**
   * Remove a filter
   */
  const removeFilter = useCallback((index: number, actionKey: string) => {
    if (actionKey.includes('Node')) {
      const updatedFilters = nodeFilters.filter((_, i) => i !== index);
      applyCytoscapeFilter('node', updatedFilters);
      
      // Update Redux store with the new filters
      dispatch(setFilters({
        ...filters,
        node: {
          ...filters.node,
          filter: updatedFilters
        }
      }));
    } else if (actionKey.includes('Edge')) {
      const updatedFilters = edgeFilters.filter((_, i) => i !== index);
      applyCytoscapeFilter('edge', updatedFilters);
      
      // Update Redux store with the new filters
      dispatch(setFilters({
        ...filters,
        edge: {
          ...filters.edge,
          filter: updatedFilters
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
    setSelectedValues([]);
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
    selectedValues,
    setSelectedValues,
    pendingFilter,
    setPendingFilter,
    
    // Filter actions
    addFilter,
    removeFilter,
    resetFilterForm,
    
    // Cytoscape integration
    applyCytoscapeFilter
  };
};
