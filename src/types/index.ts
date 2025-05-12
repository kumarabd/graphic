import { Stylesheet } from 'cytoscape';

// Node and Edge types
export interface NodeData {
  id: string;
  label: string;
  type: string;
  parent?: string;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
}

export interface Node {
  data: NodeData;
}

export interface Edge {
  data: EdgeData;
}

/**
 * Types of filters that can be applied
 */
export interface KVFilter {
  key: string;
  values: string[];
}

export type FilterType = 'node' | 'edge' | 'both';

export interface Filters {
  node: {
    filter: KVFilter[];
    limit: number;
  }
  edge: {
    filter: KVFilter[];
    limit: number;
  }
}

// Layout types
export type LayoutType = 
  | 'breadthfirst' 
  | 'circle' 
  | 'concentric' 
  | 'cose' 
  | 'fcose' 
  | 'grid'
  | 'klay'
  | 'cola'
  | 'dagre'
  | 'elk_box'
  | 'elk_disco'
  | 'elk_force'
  | 'elk_layered'
  | 'elk_mrtree'
  | 'elk_random'
  | 'elk_stress';

// Graph state types
export interface GraphState {
  nodes: Node[];
  edges: Edge[];
  filterKeys: string[];
  filters: Filters;
  loading: boolean;
  error: string | null;
  selectedLayout: LayoutType;
  stylesheet: Stylesheet[];
}

// Redux state types
export interface RootState {
  graph: GraphState;
}

// Graph context action types
export type GraphAction = 
  | { type: 'SET_NODES'; payload: Node[] }
  | { type: 'SET_EDGES'; payload: Edge[] }
  | { type: 'SET_FILTERS'; payload: KVFilter[] }
  | { type: 'SET_NODE_FILTERS'; payload: KVFilter[] }
  | { type: 'SET_EDGE_FILTERS'; payload: KVFilter[] }
  | { type: 'SET_LAYOUT'; payload: LayoutType }
  | { type: 'SET_STYLESHEET'; payload: Stylesheet[] }
  | { type: 'UPDATE_GRAPH'; payload: { nodes: Node[], edges: Edge[] } };

// Component prop types
export interface GraphViewProps {
  stylesheet: Stylesheet[];
  selectedLayout: LayoutType;
}

export interface GraphProviderProps {
  children: React.ReactNode;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  initialLayout?: LayoutType;
  initialStylesheet?: Stylesheet[];
}
