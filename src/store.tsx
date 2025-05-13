import { configureStore, createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { fetchGraphDataThunk, fetchNodeDataThunk, fetchEdgeDataThunk, fetchFilterKeysThunk } from './fetchGraphData';
import { Node, Edge, Filters, GraphState, LayoutType } from './types';

// Re-export types for backward compatibility
export type { Node, Edge, Filters, LayoutType } from './types';

// Initial state for the graph
const initialState: GraphState = {
  nodes: [],
  edges: [],
  loading: false,
  error: null,
  filterKeys: [],
  filters: {
    node: {
      filter: new Map<string, string[]>(),
      limit: 5000
    },
    edge: {
      filter: new Map<string, string[]>(),
      limit: 5000
    }
  },
  selectedLayout: 'elk_layered' as LayoutType,
  stylesheet: []
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
      // Combined graph data thunk cases
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
        state.error = action.error.message || 'An error occurred fetching graph data';
      })
      
      // Node data thunk cases (for backward compatibility)
      .addCase(fetchNodeDataThunk.pending, (state) => {
        // We don't set loading here since it's handled by fetchGraphDataThunk
      })
      .addCase(fetchNodeDataThunk.fulfilled, (state, action) => {
        // Nodes are already updated by fetchGraphDataThunk
      })
      .addCase(fetchNodeDataThunk.rejected, (state, action) => {
        state.error = action.error.message || 'An error occurred fetching nodes';
      })
      
      // Edge data thunk cases (for backward compatibility)
      .addCase(fetchEdgeDataThunk.pending, (state) => {
        // We don't set loading here since it's handled by fetchGraphDataThunk
      })
      .addCase(fetchEdgeDataThunk.fulfilled, (state, action) => {
        // Edges are already updated by fetchGraphDataThunk
      })
      .addCase(fetchEdgeDataThunk.rejected, (state, action) => {
        state.error = action.error.message || 'An error occurred fetching edges';
      })
      
      // Filter keys thunk cases
      .addCase(fetchFilterKeysThunk.pending, (state) => {
        // We don't set loading to true here to avoid blocking the UI
        state.error = null;
      })
      .addCase(fetchFilterKeysThunk.fulfilled, (state, action) => {
        state.filterKeys = action.payload.filterKeys;
      })
      .addCase(fetchFilterKeysThunk.rejected, (state, action) => {
        state.error = action.error.message || 'An error occurred fetching filter keys';
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
      serializableCheck: false,
    }),
});

// Export the RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
