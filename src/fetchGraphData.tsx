// fetchGraphData.tsx
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { setGraph, setLoading, setError } from "./store";
import { GET_GRAPH } from "./api/queries";
import { NodeData, EdgeData } from "./store";

// Initialize Apollo Client
const client = new ApolloClient({
  uri: "http://localhost:8001/graphql",
  cache: new InMemoryCache(),
});

// This will return a thunk that fetches the data and dispatches to Redux
export const fetchGraphDataThunk = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const graphResponse = await client.query({
      query: GET_GRAPH,
      variables: {},
    });

    const nodes: any[] = [];
    const edges: any[] = [];
    const nodeIds = new Set<string>();
    const uniqueEntities = new Set<string>();

    // First collect all entity types
    graphResponse.data.entities.forEach((entity: any) => {
      uniqueEntities.add(entity.type);
    });

    // Add parent nodes first
    uniqueEntities.forEach((type) => {
      nodes.push({
        group: 'nodes',
        data: {
          id: type as string,
          label: type as string,
          type: "parent"
        }
      });
      nodeIds.add(type as string);
    });

    // Then add child nodes
    graphResponse.data.entities.forEach((entity: any) => {
      nodes.push({
        group: 'nodes',
        data: {
          id: entity.hash_id,
          label: entity.name,
          type: entity.type,
          parent: entity.type  // Reference to parent node
        }
      });
      nodeIds.add(entity.hash_id);
    });

    // Process relationships as edges
    graphResponse.data.relationships.forEach((rel: any) => {
      if (nodeIds.has(rel.from_id) && nodeIds.has(rel.to_id)) {
        edges.push({
          group: 'edges',
          data: {
            id: rel.hash_id,
            source: rel.from_id,
            target: rel.to_id,
            label: rel.type
          }
        });
      } else {
        console.warn('Missing node for relationship:', rel);
      }
    });

    // Dispatch the graph data to Redux store
    dispatch(setGraph({ nodes, edges }));
    dispatch(setLoading(false));
  } catch (error) {
    console.error('Error fetching graph data:', error);
    dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
    dispatch(setLoading(false));
  }
};
