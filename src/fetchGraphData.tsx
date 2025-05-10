// fetchGraphData.tsx
import { createAsyncThunk } from '@reduxjs/toolkit';
import { client } from './api/client';
import { getNodesQuery, getEdgesQuery } from './api/queries';
import { RootState, Node, Edge } from './store';

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface FetchGraphOptions {
  skipFilters?: boolean;
}

// This will return a thunk that fetches the data and dispatches to Redux
export const fetchGraphDataThunk = createAsyncThunk<GraphData, FetchGraphOptions | undefined, { state: RootState }>(
  'graph/fetchData',
  async (options = {}, { getState }) => {
    const { skipFilters = false } = options as FetchGraphOptions;
    const state = getState();

    try {
      // Fetch nodes and edges in parallel using separate queries
      const [nodesResponse, edgesResponse] = await Promise.all([
        client.query({
          query: getNodesQuery(state, skipFilters),
          fetchPolicy: 'network-only'
        }),
        client.query({
          query: getEdgesQuery(state, skipFilters),
          fetchPolicy: 'network-only'
        })
      ]);
      
      const nodesData = nodesResponse.data;
      const edgesData = edgesResponse.data;

      const nodes: any[] = [];
      const edges: any[] = [];
      const nodeIds = new Set<string>();
      const uniqueEntities = new Set<string>();

      // First collect all entity types
      nodesData.entities.forEach((entity: any) => {
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
      nodesData.entities.forEach((entity: any) => {
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
      edgesData.relationships.forEach((rel: any) => {
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

      return { nodes, edges };
    } catch (error) {
      console.error('Error fetching graph data:', error);
      throw error;
    }
  }
);
