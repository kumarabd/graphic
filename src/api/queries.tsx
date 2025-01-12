// queries.ts
import { gql } from '@apollo/client';

// GraphQL queries for nodes and edges
export const GET_NODES = gql`
  query GetNodes($filter: StringMap!) {
    listNodes(filter: $filter)
  }
`;

export const GET_EDGES = gql`
  query GetEdges($filter: StringMap!) {
    listEdges(filter: $filter)
  }
`;