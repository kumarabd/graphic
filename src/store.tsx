import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for Cytoscape elements
export interface Node {
  data: {
    id: string;
    label: string;
  };
}

export interface Edge {
  data: {
    id: string;
    source: string;
    target: string;
    label: string;
  };
}

interface GraphState {
  elements: (Node | Edge)[];
}

// Initial state for the graph
const initialState: GraphState = {
  elements: [],
};

// Create slice for graph data
const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    setGraph: (state, action: PayloadAction<{ nodes: Node[]; edges: Edge[] }>) => {
      state.elements = [
        ...action.payload.nodes,
        ...action.payload.edges,
      ];
    },
  },
});

export const { setGraph } = graphSlice.actions;

// Create and configure the Redux store
const store = configureStore({
  reducer: {
    graph: graphSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
