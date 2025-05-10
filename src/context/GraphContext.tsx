import React, { createContext, useContext, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Node, Edge, LayoutType, GraphState, GraphProviderProps } from '../types';
import { Stylesheet } from 'cytoscape';
import { RootState } from '../store';
import { setGraph, setFilters } from '../store';

// Create the context for UI-specific state that doesn't belong in Redux
interface GraphContextType {
  nodeElements: any[];
  edgeElements: any[];
  hasElements: boolean;
  limits: any;
  setLimits: (limits: any) => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

// GraphProvider now focuses on UI transformations and local UI state
export const GraphProvider: React.FC<GraphProviderProps> = ({
  children,
  initialNodes = [],
  initialEdges = [],
}) => {
  // Get graph state from Redux
  const graphState = useSelector((state: RootState) => state.graph);
  const dispatch = useDispatch();
  
  // Initialize graph with provided data if available
  React.useEffect(() => {
    if (initialNodes.length > 0 || initialEdges.length > 0) {
      dispatch(setGraph({ nodes: initialNodes, edges: initialEdges }));
    }
  }, []);

  // Local UI state that doesn't need to be in Redux
  const [limits, setLimits] = useState({});

  // Memoized derived state - transform Redux data for Cytoscape
  const nodeElements = useMemo(() => graphState.nodes.map((node: Node) => ({
    group: 'nodes' as const,
    data: node.data
  })), [graphState.nodes]);
  
  const edgeElements = useMemo(() => graphState.edges.map((edge: Edge) => ({
    group: 'edges' as const,
    data: {
      id: edge.data.id,
      source: edge.data.source,
      target: edge.data.target,
      type: edge.data.type,
      label: edge.data.label
    }
  })), [graphState.edges]);

  const hasElements = nodeElements.length > 0 || edgeElements.length > 0;

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    nodeElements,
    edgeElements,
    hasElements,
    limits,
    setLimits
  }), [nodeElements, edgeElements, hasElements, limits]);

  return (
    <GraphContext.Provider value={contextValue}>
      {children}
    </GraphContext.Provider>
  );
};

// Custom hook for using the context
export const useGraphContext = (): GraphContextType => {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error('useGraphContext must be used within a GraphProvider');
  }
  return context;
};
