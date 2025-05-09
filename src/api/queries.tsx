// queries.ts
import { gql } from '@apollo/client';
import { KVFilter } from '../types';
import { RootState } from '../store';

/**
 * Helper function to build where clauses for GraphQL queries
 */
const buildWhereClause = (key: string, values?: string[]) => {
  if (!Array.isArray(values) || values.length === 0) {
    // If no items selected for this type, include all of this type
    return null;
  }
  // If items selected, filter by hash_id for this type
  return `{${key}: {in: [${values.map(s => `"${s}"`).join(',')}]}}`;
};

/**
 * Get query for fetching nodes/entities based on filters
 */
export const getNodesQuery = (state: RootState) => {
  const { filters } = state.graph;
  const { nodeFilters } = filters;
  
  // Build filter clauses for each node filter type
  const entityClauses = nodeFilters
    .map((filter: KVFilter) => buildWhereClause(filter.key, filter.values))
    .filter(Boolean); // Remove null values
  
  // Always combine entities with AND for deletion check and OR for types
  const entityWhereClause = entityClauses.length > 0
    ? `where: {and: [{deleted_at:{isNull:true}}, ${entityClauses.join(',')}]}`
    : `where: {deleted_at:{isNull:true}}`;

  return gql`
    query GetNodes {
      entities(
        limit: ${filters.nodeLimit}, 
        ${entityWhereClause}
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
 */
export const getEdgesQuery = (state: RootState) => {
  const { filters } = state.graph;
  const { edgeFilters } = filters;
  
  // Build relationship clauses only for enabled edge types
  const relationshipClauses = edgeFilters
    .map((filter: KVFilter) => buildWhereClause(filter.key, filter.values))
    .filter(Boolean); // Remove null values
  
  // Only include relationship types that are enabled
  const relationshipWhereClause = relationshipClauses.length > 0 
    ? `{and: [{deleted_at:{isNull:true}}, {type: {regex: "${relationshipClauses.join('|')}"}}]}`
    : `{deleted_at:{isNull:true}}`; // Default to just checking for non-deleted

  return gql`
    query GetEdges {
      relationships(
        limit: ${filters.edgeLimit}, 
        where: ${relationshipWhereClause}
      ) {
        hash_id
        from_id
        to_id
        type
      }
    }
  `;
};
