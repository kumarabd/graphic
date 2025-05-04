// queries.ts
import { gql } from '@apollo/client';

// GraphQL queries for nodes and edges
export const GET_GRAPH = gql`
  query RenderGraph($filter: String!) {
    subjects {
      id
      name
      type
    }
    attributes {
      id
      name
      type
    }
    resources {
      id
      name
      type
    }
    assignments {
      id
      from_id
      to_id
      type
    }
    associations {
      id
      from_id
      to_id
      type
      verbs {
        id
        action
      }
    }
  }
`;