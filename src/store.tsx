import { configureStore, createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

// Define types for Cytoscape elements
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
}

export interface Node {
  group: 'nodes';
  data: NodeData;
}

export interface Edge {
  group: 'edges';
  data: EdgeData;
}

export interface NodeSelections {
  subjects: string[];
  resources: string[];
  resourceAttributes: string[];
  subjectAttributes: string[];
}

interface GraphState {
  nodes: Node[];
  edges: Edge[];
  selections: NodeSelections;
  loading: boolean;
  error: string | null;
}

// Initial state for the graph
const initialState: GraphState = {
  nodes: [],
  edges: [],
  selections: {
    subjects: [],
    resources: [],
    resourceAttributes: [],
    subjectAttributes: []
  },
  loading: false,
  error: null
};

// Create slice for graph data
const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    setGraph: (state, action: PayloadAction<{ nodes: Node[]; edges: Edge[] }>) => {
      state.nodes = action.payload.nodes;
      state.edges = action.payload.edges;
    },
    setSelections: (state, action: PayloadAction<NodeSelections>) => {
      state.selections = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { setGraph, setSelections, setLoading, setError } = graphSlice.actions;

// Create and configure the Redux store
const store = configureStore({
  reducer: {
    graph: graphSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for Cytoscape objects
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Memoized selectors
const selectNodes = (state: RootState) => state.graph.nodes;
const selectEdges = (state: RootState) => state.graph.edges;
const selectSelections = (state: RootState) => state.graph.selections;

// Selector to get filtered elements
export const selectFilteredElements = createSelector(
  [selectNodes, selectEdges, selectSelections],
  (nodes, edges, selections) => {
    let filteredNodes = nodes.filter(node => {
      const nodeType = node.data.type;
      switch (nodeType) {
        case 'subject':
          return selections.subjects.length == 0 || selections.subjects.includes(node.data.id);
        case 'resource':
          return selections.resources.length == 0 || selections.resources.includes(node.data.id);
        case 'resource_attribute':
          return selections.resourceAttributes.length == 0 || selections.resourceAttributes.includes(node.data.id);
        case 'subject_attribute':
          return selections.subjectAttributes.length == 0 || selections.subjectAttributes.includes(node.data.id);
        default:
          return true;
      }
    });

    let filteredEdges = edges.filter(edge => 
      filteredNodes.find(node => node.data.id === edge.data.source) && 
      filteredNodes.find(node => node.data.id === edge.data.target)
    );

    return [...filteredNodes, ...filteredEdges];
  }
);

export default store;
