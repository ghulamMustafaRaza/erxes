import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { Alert } from 'modules/common/utils';

// get env config from process.env or window.env
export const getEnv = () => {
  const wenv = (window as any).env || {};

  const getItem = name => process.env[name] || wenv[name];

  const host = window.location.host;

  return {
    REACT_APP_API_URL: `http://${host.replace(
      'erxes.local:3000',
      'erxes-api.local:3300'
    )}`,
    REACT_APP_API_SUBSCRIPTION_URL: `ws://${host.replace(
      'erxes.local:3000',
      'erxes-api.local:3300'
    )}/subscriptions`,
    REACT_APP_CDN_HOST: getItem('REACT_APP_CDN_HOST')
  };
};

const { REACT_APP_API_URL, REACT_APP_API_SUBSCRIPTION_URL } = getEnv();

// Create an http link:
const httpLink = createHttpLink({
  uri: `${REACT_APP_API_URL}/graphql`,
  credentials: 'include'
});

// Network error
const errorLink = onError(({ networkError }) => {
  if (networkError) {
    Alert.error('Disconnect ...');
  }
});

// Combining httpLink and warelinks altogether
const httpLinkWithMiddleware = errorLink.concat(httpLink);

// Subscription config
export const wsLink = new WebSocketLink({
  uri: REACT_APP_API_SUBSCRIPTION_URL || '',
  options: {
    reconnect: true,
    timeout: 30000
  }
});

type Definintion = {
  kind: string;
  operation?: string;
};

// Setting up subscription with link
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation }: Definintion = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLinkWithMiddleware
);

// Creating Apollo-client
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link
});

export default client;
