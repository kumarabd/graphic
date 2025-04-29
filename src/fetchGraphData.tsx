// fetchGraphData.tsx
import { ApolloClient, InMemoryCache } from "@apollo/client";
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
      uniqueEntities.add(subject.entity_type);
      const nodeData = {
        id: subject.id,
        label: subject.name,
        type: subject.entity_type,
        parent: subject.entity_type,
        entity_type: subject.entity_type,
      };
      nodes.push({ data: nodeData });
      nodeIds.add(subject.id);
    });

    // Process subject attributes
    graphResponse.data.subject_attributes.forEach((attr: any) => {
      uniqueEntities.add(attr.entity_type);
      const nodeData = {
        id: attr.id,
        label: attr.name,
        type: attr.entity_type,
        parent: attr.entity_type,
        entity_type: attr.entity_type,
      };
      nodes.push({ data: nodeData });
      nodeIds.add(attr.id);
    });

    // Process resource attributes
    graphResponse.data.resource_attributes.forEach((attr: any) => {
      uniqueEntities.add(attr.entity_type);
      const nodeData = {
        id: attr.id,
        label: attr.name,
        type: attr.entity_type,
        parent: attr.entity_type,
        entity_type: attr.entity_type,
      };
      nodes.push({ data: nodeData });
      nodeIds.add(attr.id);
    });

    // Process resources
    graphResponse.data.resources.forEach((resource: any) => {
      uniqueEntities.add(resource.entity_type);
      const nodeData = {
        id: resource.id,
        label: resource.name,
        type: resource.entity_type,
        parent: resource.entity_type,
        entity_type: resource.entity_type,
      };
      nodes.push({ data: nodeData });
      nodeIds.add(resource.id);
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

    // // Process associations only if both source and target nodes exist
    // graphResponse.data.associations.forEach((assoc: any) => {
    //   // Debug: Log each association attempt
    //   console.log('Processing association:', {
    //     id: assoc.id,
    //     from: assoc.from_id,
    //     to: assoc.to_id,
    //     fromExists: nodeIds.has(assoc.from_id),
    //     toExists: nodeIds.has(assoc.to_id)
    //   });

    //   if (nodeIds.has(assoc.from_id) && nodeIds.has(assoc.to_id)) {
    //     edges.push({
    //       data: {
    //         id: assoc.id,
    //         source: assoc.from_id,
    //         target: assoc.to_id,
    //         label: "association",
    //       }
    //     });
    //   } else {
    //     // console.warn(`Skipping edge ${assoc.id} - missing nodes:`, {
    //     //   from: assoc.from_id,
    //     //   to: assoc.to_id,
    //     //   fromExists: nodeIds.has(assoc.from_id),
    //     //   toExists: nodeIds.has(assoc.to_id)
    //     // });
    //     console.warn(assoc.to_id)
    //   }
    // });

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
