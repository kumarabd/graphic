// queries.ts
import { gql } from '@apollo/client';

// GraphQL queries for nodes and edges
export const GET_GRAPH = gql`
  query RenderGraph($filter: String!) {
    subjects {
      id
      name
      entity_type
    }
    subject_attributes {
        id
        name
        entity_type
        assignment {
          id
        }
    }
    resource_attributes {
        id
        name
        entity_type
        assignment {
          id
        }
    }
    resources {
      id
      name
      entity_type
    }
    associations {
      id
      from_id
      to_id
    }
  }
`;