import { configureStore, createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { fetchGraphDataThunk } from './fetchGraphData';
import { Node, Edge, Filters, KVFilter } from './types';

// Re-export types for backward compatibility
export type { NodeData, EdgeData, Node, Edge, KVFilter, Filters } from './types';

// Define the store-specific state structure
interface GraphStateStore {
  nodes: Node[];
  edges: Edge[];
  loading: boolean;
  error: string | null;
  filters: Filters;
}

// Initial state for the graph
const initialState: GraphStateStore = {
  nodes: [],
  edges: [],
  loading: false,
  error: null,
  filters: {
    nodeFilters: [],
    edgeFilters: [],
    nodeLimit: 5000,
    edgeLimit: 5000
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

// Export the RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Helper function to compile GraphQL query from filters
export const compileGraphQLQuery = (nodeFilters: KVFilter[], edgeFilters: KVFilter[]) => {
  // Start building the GraphQL query
  let queryFilters: string[] = [];
  
  // Process node filters
  if (nodeFilters.length > 0) {
    nodeFilters.forEach(filter => {
      const { key, values } = filter;
      if (values.length > 0) {
        queryFilters.push(`${key}: [${values.map(v => `"${v}"`).join(', ')}]`);
      }
    });
  }
  
  // Process edge filters
  if (edgeFilters.length > 0) {
    edgeFilters.forEach(filter => {
      const { key, values } = filter;
      if (values.length > 0) {
        queryFilters.push(`${key}: [${values.map(v => `"${v}"`).join(', ')}]`);
      }
    });
  }
  
  // Construct the final query
  const graphqlQuery = `
    query FilteredGraph {
      graph(filters: {
        ${queryFilters.join(',\n        ')}
      }) {
        nodes {
          id
          type
          label
        }
        edges {
          id
          source
          target
          type
        }
      }
    }
  `;
  
  console.log('Compiled GraphQL Query:', graphqlQuery);
  return graphqlQuery;
};

export default store;
