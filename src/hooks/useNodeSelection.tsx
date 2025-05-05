import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, Node, setSelections } from '../store';

interface NodeOption {
  id: string;
  label: string;
}

export const useNodeSelection = () => {
  const dispatch = useDispatch();
  const nodes = useSelector((state: RootState) => state.graph.nodes);
  const selections = useSelector((state: RootState) => state.graph.selections);

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
        label: node.data.label
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

  // Update selections
  const updateSelections = (type: keyof typeof nodesByType, selectedIds: string[]) => {
    dispatch(setSelections({
      ...selections,
      [type]: selectedIds
    }));
  };

  return {
    nodesByType,
    selections,
    updateSelections
  };
};
