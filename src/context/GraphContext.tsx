import React, { createContext, useContext, useReducer, useMemo, useState } from 'react';
import { Node, Edge, LayoutType, GraphState, GraphAction, GraphProviderProps, KVFilter } from '../types';
import { Stylesheet } from 'cytoscape';

// Initial state
const initialState: GraphState = {
  nodes: [],
  edges: [],
  nodeFilters: [{key: 'type', values: ['subject', 'resource', 'subjectAttributes', 'resourceAttributes']}],
  edgeFilters: [],
  selectedLayout: 'fcose' as LayoutType,
  stylesheet: []
};

// Create the reducer
const graphReducer = (state: GraphState, action: GraphAction): GraphState => {
  switch (action.type) {
    case 'SET_NODES':
      return { ...state, nodes: action.payload };
    case 'SET_EDGES':
      return { ...state, edges: action.payload };
    case 'SET_LAYOUT':
      return { ...state, selectedLayout: action.payload };
    case 'SET_STYLESHEET':
      return { ...state, stylesheet: action.payload };
    case 'SET_NODE_FILTERS':
      return { ...state, nodeFilters: action.payload };
    case 'SET_EDGE_FILTERS':
      return { ...state, edgeFilters: action.payload };
    case 'SET_FILTERS':
      // For backward compatibility, we'll update both filter types
      return { 
        ...state, 
        nodeFilters: action.payload,
        edgeFilters: action.payload
      };
    case 'UPDATE_GRAPH':
      return { 
        ...state, 
        nodes: action.payload.nodes, 
        edges: action.payload.edges 
      };
    default:
      return state;
  }
};

// Create the context
interface GraphContextType {
  state: GraphState;
  dispatch: React.Dispatch<GraphAction>;
  nodeElements: any[];
  edgeElements: any[];
  hasElements: boolean;
  limits: any;
  setLimits: (limits: any) => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

// Import GraphProviderProps from types

export const GraphProvider: React.FC<GraphProviderProps> = ({
  children,
  initialNodes = [],
  initialEdges = [],
  initialLayout = 'elk_layered' as LayoutType,
  initialStylesheet = []
}) => {
  const [state, dispatch] = useReducer(graphReducer, {
    ...initialState,
    nodes: initialNodes,
    edges: initialEdges,
    selectedLayout: initialLayout,
    stylesheet: initialStylesheet,
    nodeFilters: [{key: 'type', values: ['subject', 'resource', 'subject_attribute', 'resource_attribute']}],
    edgeFilters: []
  } as GraphState);

  const [limits, setLimits] = useState({});

  // Memoized derived state
  const nodeElements = useMemo(() => state.nodes.map((node: Node) => ({
    group: 'nodes' as const,
    data: node.data
  })), [state.nodes]);
  
  const edgeElements = useMemo(() => state.edges.map((edge: Edge) => ({
    group: 'edges' as const,
    data: {
      id: edge.data.id,
      source: edge.data.source,
      target: edge.data.target,
      type: edge.data.type,
      label: edge.data.label
    }
  })), [state.edges]);

  const hasElements = nodeElements.length > 0 || edgeElements.length > 0;

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    nodeElements,
    edgeElements,
    hasElements,
    limits,
    setLimits
  }), [state, nodeElements, edgeElements, hasElements, limits, setLimits]);

  return (
    <GraphContext.Provider value={contextValue}>
      {children}
    </GraphContext.Provider>
  );
};

// Create a custom hook for using the context
export const useGraphContext = (): GraphContextType => {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error('useGraphContext must be used within a GraphProvider');
  }
  return context;
};
