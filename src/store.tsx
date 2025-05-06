import { configureStore, createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { fetchGraphDataThunk } from './fetchGraphData';

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
  type: string;
}

export interface Node {
  data: NodeData;
}

export interface Edge {
  data: EdgeData;
}

export interface Filters {
  nodeFilters: {
    subjects: string[];
    resources: string[];
    resourceAttributes: string[];
    subjectAttributes: string[];
  },
  edgeFilters: {
    assignment: boolean;
    association: boolean;
  };
  entityLimit: number;
  relationshipLimit: number;
}

interface GraphState {
  nodes: Node[];
  edges: Edge[];
  loading: boolean;
  error: string | null;
  filters: Filters;
}

// Initial state for the graph
const initialState: GraphState = {
  nodes: [],
  edges: [],
  loading: false,
  error: null,
  filters: {
    nodeFilters: {
      subjects: [],
      resources: [],
      resourceAttributes: [],
      subjectAttributes: [],
    },
    edgeFilters: {
      assignment: true,
      association: true
    },
    entityLimit: 5000,
    relationshipLimit: 5000
  }
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
    setFilters: (state, action: PayloadAction<Filters>) => {
      state.filters = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGraphDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGraphDataThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes = action.payload.nodes;
        state.edges = action.payload.edges;
      })
      .addCase(fetchGraphDataThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      });
  },
});

export const { setGraph, setFilters, setLoading, setError } = graphSlice.actions;

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
const selectNodeFilters = (state: RootState) => state.graph.filters.nodeFilters;
const selectEdgeFilters = (state: RootState) => state.graph.filters.edgeFilters;

// Selector to get filtered elements
export const selectFilteredElements = createSelector(
  [selectNodes, selectEdges, selectNodeFilters, selectEdgeFilters],
  (nodes, edges, nodeFilters, edgeFilters) => {
    let filteredNodes = nodes.filter(node => {
      const nodeType = node.data.type;
      switch (nodeType) {
        case 'subject':
          return nodeFilters.subjects.length === 0 || nodeFilters.subjects.includes(node.data.id);
        case 'resource':
          return nodeFilters.resources.length === 0 || nodeFilters.resources.includes(node.data.id);
        case 'resource_attribute':
          return nodeFilters.resourceAttributes.length === 0 || nodeFilters.resourceAttributes.includes(node.data.id);
        case 'subject_attribute':
          return nodeFilters.subjectAttributes.length === 0 || nodeFilters.subjectAttributes.includes(node.data.id);
        default:
          return true;
      }
    });

    let filteredEdges = edges.filter(edge => {
      // First check if source and target nodes are visible
      const sourceVisible = filteredNodes.find(node => node.data.id === edge.data.source);
      const targetVisible = filteredNodes.find(node => node.data.id === edge.data.target);
      if (!sourceVisible || !targetVisible) return false;

      // Then check edge type filters
      const edgeType = edge.data.type;
      if (edgeType === 'assignment' && !edgeFilters.assignment) return false;
      if (edgeType === 'association' && !edgeFilters.association) return false;
      return true;
    });

    return [...filteredNodes, ...filteredEdges];
  }
);

export default store;
