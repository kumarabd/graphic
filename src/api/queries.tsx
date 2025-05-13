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
      properties(
        distinctOn: "value",
        limit: 1000,
        where: {key: {equals: "${key}"}}
      ) {
        value
      }
    }
  `;
};

/**
 * Get query for fetching property values based on a key
 * @param key The property key to filter by
 */
export const getPropertyIdsQuery = (key: string, values: string[]) => {
  let query = '';
  if (values.length === 0) {
    query = '{key: {equals: "'+key+'"}}'
  } else if (values.length === 1) {
    query = '{key: {equals: "'+key+'"}, value: {equals: "'+values[0]+'"}}'
  } else {
    const valuesString = values.map(value => '{value: {equals: "'+value+'"}}').join(', ');
    query = '{key: {equals: "'+key+'"}, value: {or: ['+valuesString+']}}'
  }    
  console.log(query);
  return gql`
    query GetPropertyIds($key: String!) {
      properties(
        distinctOn: "value",
        limit: 1000,
        where: ${query}
      ) {
        id
      }
    }
  `;
};

/**
 * Get query for fetching entity IDs based on property IDs
 * @param propertyIds The property IDs to filter by
 */
 export const getEntityIdsQuery = (propertyIds: string[]) => {
  let query = '';
  propertyIds.forEach((propertyId) => {
    if (query.length > 0) {
      query += ', '
    }
    query += '{equals: "'+propertyId+'"}'
  });

  if (propertyIds.length === 1) {
    query = '{property_id: '+query+'}'
  } else{
    query = '{property_id: {or: ['+query+']}}'
  }

  console.log(query);
  return gql`
    query GetEntityIds($propertyIds: [String!]!) {
      subject_properties(
        where: ${query}
      ) {
        subject_entity_id
      }
      resource_properties(
        where: ${query}
      ) {
        resource_entity_id
      }
      attribute_properties(
        where: ${query}
      ) {
        attribute_entity_id
      }
    }
  `;
};