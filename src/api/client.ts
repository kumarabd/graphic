import { ApolloClient, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
  uri: 'http://localhost:8001/graphql',
  cache: new InMemoryCache(),
});
