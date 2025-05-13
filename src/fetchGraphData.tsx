// fetchGraphData.tsx
import { createAsyncThunk } from '@reduxjs/toolkit';
import { client } from './api/client';
import { getNodesQuery, getEdgesQuery, getFilterKeysQuery, getFilterValuesQuery, getPropertyIdsQuery, getEntityIdsQuery } from './api/queries';
import { RootState, Node, Edge } from './store';

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface NodeData {
  nodes: Node[];
}

interface EdgeData {
  edges: Edge[];
}

interface FilterKeysData {
  filterKeys: string[];
}

interface FilterValuesData {
  filterValues: string[];
}

interface FetchGraphOptions {
  skipFilters?: boolean;
}

// Combined thunk for fetching both nodes and edges data
export const fetchGraphDataThunk = createAsyncThunk<GraphData, FetchGraphOptions | undefined, { state: RootState }>(
  'graph/fetchGraphData',
  async (options = {}, { getState }) => {
    const { skipFilters = false } = options as FetchGraphOptions;
    const state = getState();

    try {
      // Fetch nodes and edges in parallel
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

      // Process edges after all nodes are processed
      const edges: any[] = [];
      
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
          console.warn('Missing node for relationship:', rel, nodeIds.has(rel.from_id), nodeIds.has(rel.to_id));
        }
      });

      return { nodes, edges };
    } catch (error) {
      console.error('Error fetching graph data:', error);
      throw error;
    }
  }
);

// For backward compatibility - fetch only nodes
export const fetchNodeDataThunk = createAsyncThunk<NodeData, FetchGraphOptions | undefined, { state: RootState }>(
  'graph/fetchNodeData',
  async (options = {}, { dispatch }) => {
    try {
      const result = await dispatch(fetchGraphDataThunk(options)).unwrap();
      return { nodes: result.nodes };
    } catch (error) {
      console.error('Error fetching node data:', error);
      throw error;
    }
  }
);

// For backward compatibility - fetch only edges
export const fetchEdgeDataThunk = createAsyncThunk<EdgeData, FetchGraphOptions | undefined, { state: RootState }>(
  'graph/fetchEdgeData',
  async (options = {}, { dispatch }) => {
    try {
      const result = await dispatch(fetchGraphDataThunk(options)).unwrap();
      return { edges: result.edges };
    } catch (error) {
      console.error('Error fetching edge data:', error);
      throw error;
    }
  }
);

// Thunk for fetching filter keys
export const fetchFilterKeysThunk = createAsyncThunk<FilterKeysData, void, { state: RootState }>(
  'graph/fetchFilterKeys',
  async (_, { getState }) => {
    try {
      // Fetch filter keys
      const response = await client.query({
        query: getFilterKeysQuery(),
        fetchPolicy: 'network-only'
      });
      
      const data = response.data;
      
      // Extract unique keys from properties
      const keys = data.properties ? data.properties.map((prop: any) => prop.key) : [];
      keys.push('type');
      const uniqueKeys = Array.from(new Set(keys)) as string[];
      
      return { filterKeys: uniqueKeys };
    } catch (error) {
      console.error('Error fetching filter keys:', error);
      throw error;
    }
  }
);

/**
 * Function to fetch filter values without persisting in Redux state
 * @param key The filter key to fetch values for
 * @returns A promise that resolves to an array of filter values
 */
export const fetchFilterValues = async (key: string): Promise<string[]> => {
  try {
    // Fetch filter values
    const response = await client.query({
      query: getFilterValuesQuery(key),
      fetchPolicy: 'network-only'
    });
    
    const data = response.data;
    
    // Extract unique values from properties
    const values = data.properties ? data.properties.map((prop: any) => prop.value) : [];
    const uniqueValues = Array.from(new Set(values)) as string[];
    
    return uniqueValues;
  } catch (error) {
    console.error('Error fetching filter values:', error);
    return [];
  }
};

export const fetchPropertyIds = async (key: string, values: string[]): Promise<string[]> => {
  try {
    // Fetch property IDs
    const response = await client.query({
      query: getPropertyIdsQuery(key, values),
      fetchPolicy: 'network-only'
    });
    
    const data = response.data;
    
    // Extract unique IDs from properties
    const ids = data.properties ? data.properties.map((prop: any) => prop.id) : [];
    const uniqueIds = Array.from(new Set(ids)) as string[];
    
    return uniqueIds;
  } catch (error) {
    console.error('Error fetching property IDs:', error);
    return [];
  }
};

export const fetchEntityIds = async (propertyIds: string[]): Promise<string[]> => {
  try {
    // Fetch entity IDs
    const response = await client.query({
      query: getEntityIdsQuery(propertyIds),
      fetchPolicy: 'network-only'
    });
    
    const data = response.data;
    
    // Extract unique IDs from entities
    let ids = data.subject_properties ? data.subject_properties.map((entity: any) => entity.subject_entity_id) : [];
    ids = ids.concat(data.resource_properties ? data.resource_properties.map((entity: any) => entity.resource_entity_id) : []);
    ids = ids.concat(data.attribute_properties ? data.attribute_properties.map((entity: any) => entity.attribute_entity_id) : []);
    const uniqueIds = Array.from(new Set(ids)) as string[];
    
    return uniqueIds;
  } catch (error) {
    console.error('Error fetching entity IDs:', error);
    return [];
  }
};
  