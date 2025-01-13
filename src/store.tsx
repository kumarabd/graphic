import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for Cytoscape elements
export interface Node {
  data: {
    id: string;
    label: string;
    type: string;
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
      const parentType = 'parent'; // or any dynamic logic for determining parent type

      // Check if the parent node already exists
      const parentNodeExists = state.elements.some(
        (el) => 'type' in el.data && el.data.type === parentType
      );

      // If the parent node doesn't exist, create it
      if (!parentNodeExists) {
        const parentNode: Node = {
          data: {
            id: parentType,
            label: parentType, // Parent node label can be dynamic
            type: parentType,
          },
        };

        // Add the parent node to the nodes list
        action.payload.nodes.unshift(parentNode); // Add it to the beginning of the node list
      }

      // Create the new elements by combining the nodes and edges
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
