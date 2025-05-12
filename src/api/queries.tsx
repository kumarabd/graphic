// queries.ts
import { gql } from '@apollo/client';
import { RootState } from '../store';

/**
 * Get query for fetching nodes/entities based on filters
 * @param state The Redux state
 * @param skipFilters If true, ignores filters and returns all nodes
 */
export const getNodesQuery = (state: RootState, skipFilters: boolean = false) => {
  const { filters } = state.graph;
  const { node } = filters;
  return gql`
    query GetNodes {
      entities(
        limit: ${node.limit}, 
      ) {
        hash_id
        name
        type
      }
    }
  `;
};

/**
 * Get query for fetching edges/relationships based on filters
 * @param state The Redux state
 * @param skipFilters If true, ignores filters and returns all edges
 */
export const getEdgesQuery = (state: RootState, skipFilters: boolean = false) => {
  const { filters } = state.graph;
  const { edge } = filters;

  return gql`
    query GetEdges {
      relationships(
        limit: ${edge.limit}, 
      ) {
        hash_id
        from_id
        to_id
        type
      }
    }
  `;
};

/**
 * Get query for fetching properties based on filters
 * @param state The Redux state
 * @param skipFilters If true, ignores filters and returns all edges
 */
export const getPropertiesQuery = () => {
  return gql`
    query GetProperties {
      properties(
        limit: 1000,
      ) {
        key
        value
      }
    }
  `;
};

/**
 * Get query for fetching properties based on filters
 * @param state The Redux state
 * @param skipFilters If true, ignores filters and returns all edges
 */
export const getFilterKeysQuery = () => {
  return gql`
    query GetFilterKeys {
      properties(
        distinctOn: "key",
        limit: 1000,
      ) {
        key
      }
    }
  `;
};

/**
 * Get query for fetching property values based on a key
 * @param key The property key to filter by
 */
export const getFilterValuesQuery = (key: string) => {
  return gql`
    query GetFilterValues($key: String!) {
      properties(where: {key: {equals: "${key}"}}) {
        value
      }
    }
  `;
};
