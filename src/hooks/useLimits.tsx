import { useState, useCallback, useRef } from 'react';
import { useNodeSelection } from './useNodeSelection';
import { useEdgeSelection } from './useEdgeSelection';

export type Limits = {
  nodeLimit: number;
  edgeLimit: number;
};

/**
 * Hook for managing node and edge limits
 * Returns current limits, a setter function, and change tracking
 */
export const useLimits = (initialLimits: Limits = { nodeLimit: 5000, edgeLimit: 5000 }) => {
  const [limits, setLimitsState] = useState<Limits>(initialLimits);
  const [hasChanges, setHasChanges] = useState(false);
  const originalLimits = useRef<Limits>(initialLimits);
  const { refreshNodes } = useNodeSelection();
  const { refreshEdges } = useEdgeSelection();
  
  // Custom setter that tracks changes
  const setLimits = useCallback((newLimits: Limits) => {
    setLimitsState(newLimits);
    
    // Check if any values differ from original values
    const hasAnyChanges = 
      newLimits.nodeLimit !== originalLimits.current.nodeLimit || 
      newLimits.edgeLimit !== originalLimits.current.edgeLimit;
    
    setHasChanges(hasAnyChanges);
  }, []);
  
  // Apply changes and reset change tracking
  const applyChanges = useCallback(async () => {
    // Update the reference to current values
    originalLimits.current = { ...limits };
    setHasChanges(false);

    // Apply the limits to the graph
    // Refresh data from the API
    const nodesPromise = refreshNodes();
    const edgesPromise = refreshEdges();
    
    try {
      const [nodesResult, edgesResult] = await Promise.all([nodesPromise, edgesPromise]);
      
      if (nodesResult && edgesResult) {
        console.log('Graph data successfully refreshed');
      } else {
        console.error('Failed to refresh some graph data');
      }
    } catch (error) {
      console.error('Error during sync operation:', error);
    }
    
    // Return the current limits for convenience
    return limits;
  }, [limits]);
  
  return { 
    limits, 
    setLimits, 
    hasLimitChanges: hasChanges, 
    applyLimitChanges: applyChanges 
  };
};
