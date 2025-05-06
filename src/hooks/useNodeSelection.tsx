import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, Node, setFilters } from '../store';
import { AppDispatch } from '../store';
import { fetchGraphDataThunk } from '../fetchGraphData';

interface NodeOption {
  id: string;
  label: string;
}

export const useNodeSelection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const nodes = useSelector((state: RootState) => state.graph.nodes);
  const filters = useSelector((state: RootState) => state.graph.filters);

  // Group nodes by type
  const nodesByType = useMemo(() => {
    const grouped = {
      subjects: [] as NodeOption[],
      resources: [] as NodeOption[],
      resourceAttributes: [] as NodeOption[],
      subjectAttributes: [] as NodeOption[],
    };

    nodes.forEach(node => {
      const option = {
        id: node.data.id,
        label: node.data.label || node.data.id,
        type: node.data.type
      };

      switch (node.data.type) {
        case 'subject':
          grouped.subjects.push(option);
          break;
        case 'resource':
          grouped.resources.push(option);
          break;
        case 'resource_attribute':
          grouped.resourceAttributes.push(option);
          break;
        case 'subject_attribute':
          grouped.subjectAttributes.push(option);
          break;
      }
    });

    return grouped;
  }, [nodes]);

  // Update filters and fetch new data
  const updateFilters = (type: keyof typeof nodesByType, selectedIds: string[]) => {
    const newFilters = {
      ...filters,
      [type]: selectedIds
    };
    dispatch(setFilters(newFilters));
    dispatch(fetchGraphDataThunk() as any);
  };

  return {
    nodesByType,
    filters,
    updateFilters
  };
};
