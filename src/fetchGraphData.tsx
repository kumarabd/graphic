// fetchGraphData.tsx
import { useDispatch } from "react-redux";
import { gql } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { setGraph } from "./store"; // Action creator for setting graph data
import { GET_NODES, GET_EDGES } from "./api/queries";
import { StringMap } from "./api/model";
import { Node, Edge } from "./store";

// Initialize Apollo Client
const client = new ApolloClient({
  uri: "http://localhost:8000/graphql", // Your GraphQL server URI
  cache: new InMemoryCache(),
});

// This will return a thunk that fetches the data and dispatches to Redux
export const fetchGraphDataThunk = () => async (dispatch: any) => {
  try {
    const filter: StringMap = {
      status: "active", // Example key-value pair (adjust as needed)
      // Other filter conditions can be added here if required by the server
    };

    // Fetch both nodes and edges concurrently using Promise.all
    const [nodesResponse, edgesResponse] = await Promise.all([
      client.query({
        query: GET_NODES,
        variables: { filter }, // Pass the required filter
      }),
      client.query({
        query: GET_EDGES,
        variables: { filter }, // Pass the required filter
      }),
    ]);

    const nodes: Node[] = nodesResponse.data.listNodes.map((node: { ID: string; Label: string; Type: string }) => ({
      data: {
        id: node.ID,
        label: node.Label,
        type: node.Type,
      }
    }));

    const edges: Edge[] = edgesResponse.data.listEdges.map((edge: { ID: string; From: string; To: string; Type: string }) => ({
      data: {
        id: edge.ID,
        source: edge.From,
        target: edge.To,
        label: edge.Type,
      }
    }));

    console.log("nodes: ", nodes)
    console.log("edges: ", edges)

    // Dispatch the graph data (nodes and edges) in Cytoscape format to Redux store
    dispatch(setGraph({ nodes, edges }));

  } catch (error) {
    console.error("Error fetching graph data:", error);
  }
};
