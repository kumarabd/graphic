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
  const buildWhereClauseForEntity = (type: string, items?: string[]) => {
    if (!Array.isArray(items) || items.length === 0) {
      // If no items selected for this type, include all of this type
      return `{type: {equals: "${type}"}}`;
    }
    // If items selected, filter by hash_id for this type
    return `{and: [{type: {equals: "${type}"}}, {hash_id: {in: [${items.map(s => `"${s}"`).join(',')}]}}]}`;
  };

  const buildWhereClauseForRelationship = (type: string, enable: boolean) => {
    if (enable) {
      return `${type}`;
    }
    return null;
  };
  
  const { filters } = state.graph;

  const { nodeFilters } = filters;
  const entityClauses = [
    buildWhereClauseForEntity("subject", nodeFilters.subjects),
    buildWhereClauseForEntity("resource", nodeFilters.resources),
    buildWhereClauseForEntity("resource_attribute", nodeFilters.resourceAttributes),
    buildWhereClauseForEntity("subject_attribute", nodeFilters.subjectAttributes)
  ];
  
  // Build relationship clauses only for enabled edge types
  const { edgeFilters } = filters;
  const relationshipClauses = [
    buildWhereClauseForRelationship("assignment", edgeFilters.assignment),
    buildWhereClauseForRelationship("association", edgeFilters.association),
  ].filter(Boolean); // Remove null values

  // Always combine entities with OR since we want to show all types
  const entityWhereClause = `{or: [{deleted_at:{isNull:true}}, ${entityClauses.join(',')}]}`;
  
  // Only include relationship types that are enabled
  const relationshipWhereClause = relationshipClauses.length > 0 
    ? `{and: [{deleted_at:{isNull:true}}, {type: {regex: "${relationshipClauses.join('|')}"}}]}`
    : `{type: {notRegex: "assignment|association"}}`; // No edge types enabled, return no edges

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