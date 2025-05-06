import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, setFilters } from '../store';
import { AppDispatch } from '../store';
import { fetchGraphDataThunk } from '../fetchGraphData';

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
  const dispatch = useDispatch<AppDispatch>();
  const edges = useSelector((state: RootState) => state.graph.edges);
  const filters = useSelector((state: RootState) => state.graph.filters);

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
          if (filters.edgeFilters.assignment) {
            grouped.assignment.push(option);
          }
          break;
        case 'association':
          if (filters.edgeFilters.association) {
            grouped.association.push(option);
          }
          break;
      }
    });

    return grouped;
  }, [edges]);

  const updateEdgeTypeFilter = (type: keyof EdgesByType, enabled: boolean) => {
    const newFilters = {
      ...filters,
      edgeFilters: {
        ...filters.edgeFilters,
        [type]: enabled
      }
    };
    dispatch(setFilters(newFilters));
    // Trigger a new query when filters change
    dispatch(fetchGraphDataThunk());
  };

  return {
    edgesByType,         // All edges grouped by type
    filters: filters.edgeFilters,
    updateEdgeTypeFilter
  };
};
