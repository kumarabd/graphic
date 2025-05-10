import { configureStore, createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { fetchGraphDataThunk } from './fetchGraphData';
import { Node, Edge, Filters, GraphState, LayoutType } from './types';

// Re-export types for backward compatibility
export type { Node, Edge, Filters, LayoutType } from './types';

// Initial state for the graph
const initialState: GraphState = {
  nodes: [],
  edges: [],
  loading: false,
  error: null,
  filters: {
    node: {
      filter: [],
      limit: 5000
    },
    edge: {
      filter: [],
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
      serializableCheck: false,
    }),
});

// Export the RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
