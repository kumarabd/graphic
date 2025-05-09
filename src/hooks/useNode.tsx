import { useState, useEffect, useMemo, useCallback } from 'react';
import { useGraphContext } from '../context/GraphContext';
import { Node, KVFilter } from '../types';
import { useDispatch } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { fetchGraphDataThunk } from '../fetchGraphData';
import { AppDispatch } from '../store';

type NodeType = 'subjects' | 'resources' | 'resourceAttributes' | 'subjectAttributes';

interface NodeOption {
  id: string;
  label: string;
}

export const useNodeSelection = () => {
  // Get data and dispatch from context
  const { nodeElements, hasElements, state, dispatch } = useGraphContext();
  
  // Get Redux dispatch for data fetching
  const reduxDispatch = useDispatch<AppDispatch>();
  
  // Extract nodes from nodeElements for backward compatibility
  const nodes = state.nodes;

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

  // Function to refresh node data from the API
  const refreshNodes = useCallback(async () => {
    try {
      console.log('Refreshing nodes from API...');
      const resultAction = await reduxDispatch(fetchGraphDataThunk());
      
      if (resultAction.type.endsWith('/fulfilled')) {
        // Safely unwrap the result
        const payload = unwrapResult(resultAction);
        // Update the GraphContext with the new data
        dispatch({ type: 'SET_NODES', payload: payload.nodes });
        console.log('Nodes refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing nodes:', error);
      return false;
    }
  }, [reduxDispatch, dispatch]);

  return {
    nodesByType,
    nodeElements,
    hasElements,
    refreshNodes
  };
};
