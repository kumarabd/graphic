// fetchGraphData.tsx
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { useDispatch } from "react-redux";
import { setGraph } from "./store"; // Action creator for setting graph data
import { GET_GRAPH } from "./api/queries";
import { Node, Edge } from "./store";

// Initialize Apollo Client
const client = new ApolloClient({
  uri: "http://localhost:8001/graphql",
  cache: new InMemoryCache(),
});

// This will return a thunk that fetches the data and dispatches to Redux
export const fetchGraphDataThunk = () => async (dispatch: any) => {
  try {
    const graphResponse = await client.query({
      query: GET_GRAPH,
      variables: {},
    });

    let uniqueEntities = new Set();
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeIds = new Set(); // Track existing node IDs

    // Debug: Log raw response
    console.log('Raw GraphQL Response:', JSON.stringify(graphResponse.data, null, 2));

    // Process subjects
    graphResponse.data.subjects.forEach((subject: any) => {
      uniqueEntities.add(subject.type);
      const nodeData = {
        id: subject.id.toString(),
        label: subject.name,
        type: subject.type,
        parent: subject.type,
        entity_type: subject.type,
      };
      nodes.push({ data: nodeData });
      nodeIds.add(subject.id.toString());
    });

    // Process attributes
    graphResponse.data.attributes.forEach((attr: any) => {
      uniqueEntities.add(attr.type);
      const nodeData = {
        id: attr.id.toString(),
        label: attr.name,
        type: attr.type,
        parent: attr.type,
        entity_type: attr.type,
      };
      nodes.push({ data: nodeData });
      nodeIds.add(attr.id.toString());
    });

    // Process resources
    graphResponse.data.resources.forEach((resource: any) => {
      uniqueEntities.add(resource.type);
      const nodeData = {
        id: resource.id.toString(),
        label: resource.name,
        type: resource.type,
        parent: resource.type,
        entity_type: resource.type,
      };
      nodes.push({ data: nodeData });
      nodeIds.add(resource.id.toString());
    });

    // Add parent nodes for entity types
    uniqueEntities.forEach((type) => {
      const nodeData = {
        id: type as string,
        label: type as string,
        type: "parent",
      };
      nodes.push({ data: nodeData });
      nodeIds.add(type as string);
    });

    // Debug: Log all node IDs
    console.log('All Node IDs:', Array.from(nodeIds));

    // Process assignments (these are the main edges)
    graphResponse.data.assignments.forEach((assignment: any) => {
      // Debug: Log each assignment attempt
      console.log('Processing assignment:', {
        id: assignment.id,
        from: assignment.from_id,
        to: assignment.to_id,
        fromExists: nodeIds.has(assignment.from_id.toString()),
        toExists: nodeIds.has(assignment.to_id.toString())
      });

      if (nodeIds.has(assignment.from_id.toString()) && nodeIds.has(assignment.to_id.toString())) {
        edges.push({
          data: {
            id: assignment.id.toString(),
            source: assignment.from_id.toString(),
            target: assignment.to_id.toString(),
            label: "assignment",
            type: assignment.type
          }
        });
      } else {
        console.warn(`Skipping assignment ${assignment.id} - missing nodes:`, {
          from: assignment.from_id,
          to: assignment.to_id,
          fromExists: nodeIds.has(assignment.from_id.toString()),
          toExists: nodeIds.has(assignment.to_id.toString())
        });
      }
    });

    // Process associations (these are special edges with verbs)
    graphResponse.data.associations.forEach((assoc: any) => {
      // Debug: Log each association attempt
      console.log('Processing association:', {
        id: assoc.id,
        from: assoc.from_id,
        to: assoc.to_id,
        verbs: assoc.verbs,
        fromExists: nodeIds.has(assoc.from_id.toString()),
        toExists: nodeIds.has(assoc.to_id.toString())
      });

      if (nodeIds.has(assoc.from_id.toString()) && nodeIds.has(assoc.to_id.toString())) {
        edges.push({
          data: {
            id: assoc.id.toString(),
            source: assoc.from_id.toString(),
            target: assoc.to_id.toString(),
            label: "association",
            type: assoc.type,
            verbs: assoc.verbs?.map((v: any) => v.action).join(", ")
          }
        });
      } else {
        console.warn(`Skipping association ${assoc.id} - missing nodes:`, {
          from: assoc.from_id,
          to: assoc.to_id,
          fromExists: nodeIds.has(assoc.from_id.toString()),
          toExists: nodeIds.has(assoc.to_id.toString())
        });
      }
    });

    // Debug: Log final graph data
    console.log('Final nodes count:', nodes.length);
    console.log('Final edges count:', edges.length);
    // console.log('Skipped edges count:', graphResponse.data.associations.length - edges.length);

    // Dispatch the graph data to Redux store
    dispatch(setGraph({ nodes, edges }));

  } catch (error) {
    console.error("Error fetching graph data:", error);
  }
};
