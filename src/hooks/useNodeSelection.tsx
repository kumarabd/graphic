import { useCallback } from 'react';
import { useGraphContext } from '../context/GraphContext';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { fetchGraphDataThunk } from '../fetchGraphData';
import { AppDispatch, RootState } from '../store';

/**
 * Hook for node selection and management
 * @returns Object containing node elements, elements status, node types, and refresh function
 */
export const useNodeSelection = () => {
  // Get node elements and hasElements from GraphContext
  const { nodeElements, hasElements } = useGraphContext();
  
  // Get Redux dispatch for data fetching
  const dispatch = useDispatch<AppDispatch>();
  
  // Get nodes from Redux store
  const nodes = useSelector((state: RootState) => state.graph.nodes);
  
  // Function to refresh node data from the API
  const refreshNodes = useCallback(async () => {
    try {
      console.log('Refreshing nodes from API...');
      const resultAction = await dispatch(fetchGraphDataThunk());
      
      if (resultAction.type.endsWith('/fulfilled')) {
        // Safely unwrap the result
        const payload = unwrapResult(resultAction);
        console.log('Nodes refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing nodes:', error);
      return false;
    }
  }, [dispatch]);

  return {
    nodeElements,       // Cytoscape-formatted node elements
    hasElements,        // Whether there are any elements in the graph
    refreshNodes        // Function to refresh node data from the API
  };
};
