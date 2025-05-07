import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, Node, setFilters } from '../store';
import { AppDispatch } from '../store';
import { fetchGraphDataThunk } from '../fetchGraphData';

type NodeType = 'subjects' | 'resources' | 'resourceAttributes' | 'subjectAttributes';

interface NodeOption {
  id: string;
  label: string;
}

export const useNodeSelection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const nodes = useSelector((state: RootState) => state.graph.nodes);
  const filters = useSelector((state: RootState) => state.graph.filters);

  // Filter nodes by type
  const getNodesByType = useCallback((type: NodeType) => {
    return nodes
      .filter(node => {
        switch (type) {
          case 'subjects':
            return node.data.type === 'subject';
          case 'resources':
            return node.data.type === 'resource';
          case 'resourceAttributes':
            return node.data.type === 'resource_attribute';
          case 'subjectAttributes':
            return node.data.type === 'subject_attribute';
        }
      })
      .map(node => ({
        id: node.data.id,
        label: node.data.label,
        type: node.data.type
      }));
  }, [nodes]);

  // Memoize nodes by type to prevent unnecessary recalculations
  const nodesByType = useMemo(() => ({
    subjects: getNodesByType('subjects'),
    resources: getNodesByType('resources'),
    resourceAttributes: getNodesByType('resourceAttributes'),
    subjectAttributes: getNodesByType('subjectAttributes'),
  }), [getNodesByType]);

  // Update filters for a specific node type
  const updateFilters = useCallback((type: NodeType, selectedIds: string[]) => {
    // Only update the specific node type's filter
    const newFilters = {
      ...filters,
      nodeFilters: {
        ...filters.nodeFilters,
        [type]: selectedIds
      }
    };
    
    // Dispatch updates
    dispatch(setFilters(newFilters));
    dispatch(fetchGraphDataThunk() as any);
  }, [dispatch, filters]);

  // Get filtered nodes for a specific type
  const getFilteredNodes = useCallback((type: NodeType) => {
    const selectedIds = filters.nodeFilters[type];
    return nodesByType[type].filter(node => 
      selectedIds.length === 0 || selectedIds.includes(node.id)
    );
  }, [filters.nodeFilters, nodesByType]);

  return {
    nodesByType,
    filters,
    updateFilters
  };
};
