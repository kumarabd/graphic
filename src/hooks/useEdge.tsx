import { useState, useEffect, useMemo, useCallback } from 'react';
import { useGraphContext } from '../context/GraphContext';
import { KVFilter } from '../types';
import { useDispatch } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { fetchGraphDataThunk } from '../fetchGraphData';
import { AppDispatch } from '../store';

export interface EdgeOption {
  id: string;
  label: string;
  type: string;
  source: string;
  target: string;
}

export interface EdgesByType {
  assignment: EdgeOption[];
  association: EdgeOption[];
}

export const useEdgeSelection = () => {
  // Get data and dispatch from context
  const { edgeElements, hasElements, state, dispatch } = useGraphContext();
  
  // Get Redux dispatch for data fetching
  const reduxDispatch = useDispatch<AppDispatch>();
  
  // Extract edges from edgeElements for backward compatibility
  const edges = state.edges;

  // Group edges by their type
  const edgesByType = useMemo(() => {
    const grouped = {
      assignment: [] as EdgeOption[],
      association: [] as EdgeOption[],
    };

    edges.forEach(edge => {
      if (!edge.data) return;
      
      const option = {
        id: edge.data.id,
        label: edge.data.type,
        type: edge.data.type,
        source: edge.data.source,
        target: edge.data.target
      };

      // Add edges to their respective groups
      switch (edge.data.type) {
        case 'assignment':
          // if (filters.edgeFilters.assignment) {
            grouped.assignment.push(option);
          // }
          break;
        case 'association':
          // if (filters.edgeFilters.association) {
            grouped.association.push(option);
          // }
          break;
      }
    });

    return grouped;
  }, [edges]);

  // Function to refresh edge data from the API
  const refreshEdges = useCallback(async () => {
    try {
      console.log('Refreshing edges from API...');
      const resultAction = await reduxDispatch(fetchGraphDataThunk());
      
      if (resultAction.type.endsWith('/fulfilled')) {
        // Safely unwrap the result
        const payload = unwrapResult(resultAction);
        // Update the GraphContext with the new data
        dispatch({ type: 'SET_EDGES', payload: payload.edges });
        console.log('Edges refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing edges:', error);
      return false;
    }
  }, [reduxDispatch, dispatch]);

  return {
    edgesByType,         // All edges grouped by type
    edgeElements,        // Cytoscape-formatted edge elements
    hasElements,         // Whether there are any elements in the graph
    refreshEdges         // Function to refresh edge data from the API
  };
};
