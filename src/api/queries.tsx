// queries.ts
import { gql } from '@apollo/client';

// GraphQL queries for nodes and edges
export const GET_GRAPH = gql`
  query GetGraph {
    entities(limit: 1000) {
      hash_id
      name
      type
    }
    relationships(limit: 1000) {
      hash_id
      from_id
      to_id
      type
    }
  }
`;