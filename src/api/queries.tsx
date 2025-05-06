// queries.ts
import { gql } from '@apollo/client';
import { RootState } from '../store';

// GraphQL queries for nodes and edges
export interface EntityFilters {
  subjects?: string[];
  resources?: string[];
  resourceAttributes?: string[];
  subjectAttributes?: string[];
  entityLimit: number;
  relationshipLimit: number;
}

export const getGraphQuery = (state: RootState) => {
  // Build individual where clauses for each filter type
  const buildWhereClause = (type: string, items?: string[]) => {
    if (!Array.isArray(items) || items.length === 0) {
      // If no items selected for this type, include all of this type
      return `{type: {equals: "${type}"}}`;
    }
    // If items selected, filter by hash_id for this type
    return `{and: [{type: {equals: "${type}"}}, {hash_id: {in: [${items.map(s => `"${s}"`).join(',')}]}}]}`;
  };

  const { filters } = state.graph;
  const whereClauses = [
    buildWhereClause("subject", filters.subjects),
    buildWhereClause("resource", filters.resources),
    buildWhereClause("resource_attribute", filters.resourceAttributes),
    buildWhereClause("subject_attribute", filters.subjectAttributes)
  ];

  // Always combine with OR since we want to show all types
  const entityWhereClause = `{or: [${whereClauses.join(',')}]}`;

  return gql`
    query GetGraph {
      entities(
        limit: ${filters.entityLimit}, 
        where: ${entityWhereClause}
      ) {
        hash_id
        name
        type
      }
      relationships(
        limit: ${filters.relationshipLimit}, 
        where: {or: [{type: {equals:"assignment"}},{type: {equals:"association"}}]}
      ) {
        hash_id
        from_id
        to_id
        type
      }
    }
  `;
};