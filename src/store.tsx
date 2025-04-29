import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for Cytoscape elements
export interface NodeData {
  id: string;
  label: string;
  type: string;
  parent?: string;
  entity_type?: string;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface Node {
  data: NodeData;
}

export interface Edge {
  data: EdgeData;
}

export interface Filters {
  showSubjects: boolean;
  showResources: boolean;
  showSubjectAttributes: boolean;
  showResourceAttributes: boolean;
}

interface GraphState {
  elements: (Node | Edge)[];
  filters: Filters;
}

// Initial state for the graph
const initialState: GraphState = {
  elements: [],
  filters: {
    showSubjects: true,
    showResources: true,
    showSubjectAttributes: true,
    showResourceAttributes: true,
  }
};

// Create slice for graph data
const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    setGraph: (state, action: PayloadAction<{ nodes: Node[]; edges: Edge[] }>) => {
      // Create the new elements by combining the nodes and edges
      state.elements = [
        ...action.payload.nodes,
        ...action.payload.edges,
      ];
    },
    setFilters: (state, action: PayloadAction<Filters>) => {
      state.filters = action.payload;
    },
  },
});

export const { setGraph, setFilters } = graphSlice.actions;

// Create and configure the Redux store
const store = configureStore({
  reducer: {
    graph: graphSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
