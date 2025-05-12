import { useCallback } from 'react';
import { useGraphContext } from '../context/GraphContext';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { fetchGraphDataThunk } from '../fetchGraphData';
import { AppDispatch, RootState } from '../store';

/**
 * Hook for edge selection and management
 * @returns Object containing edge elements, elements status, edge types, and refresh function
 */
export const useEdgeSelection = () => {
  // Get edge elements and hasElements from GraphContext
  const { edgeElements, hasElements } = useGraphContext();
  
  // Get Redux dispatch for data fetching
  const dispatch = useDispatch<AppDispatch>();
  
  // Get edges from Redux store
  const edges = useSelector((state: RootState) => state.graph.edges);
  
  // Function to refresh edge data from the API
  const refreshEdges = useCallback(async () => {
    try {
      console.log('Refreshing graph data (edges)...');
      const resultAction = await dispatch(fetchGraphDataThunk());
      
      if (resultAction.type.endsWith('/fulfilled')) {
        // Safely unwrap the result
        const payload = unwrapResult(resultAction);
        console.log('Graph data (edges) refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing graph data (edges):', error);
      return false;
    }
  }, [dispatch]);

  return {
    edgeElements,        // Cytoscape-formatted edge elements
    hasElements,         // Whether there are any elements in the graph
    refreshEdges,        // Function to refresh edge data from the API
  };
};
