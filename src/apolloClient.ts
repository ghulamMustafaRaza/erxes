import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { Alert } from 'modules/common/utils';

const splitHostname = (): {
  domain: string;
  type: string;
  subdomain: string;
} => {
  const result = {
    domain: '',
    type: '',
    subdomain: ''
  };

  const regexParse = new RegExp('([a-z-0-9]{2,63}).([a-z.]{2,5})$');
  const urlParts = regexParse.exec(window.location.hostname);

  if (!urlParts || urlParts.length < 2) {
    return result;
  }

  result.domain = urlParts[1];
  result.type = urlParts[2];
  result.subdomain = window.location.hostname
    .replace(result.domain + '.' + result.type, '')
    .slice(0, -1);

  return result;
};

// get env config from process.env or window.env
export const getEnv = () => {
  const {
    REACT_APP_CDN_HOST = '',
    REACT_APP_API_URL = '',
    REACT_APP_API_SUBSCRIPTION_URL = ''
  } = process.env;
  const { subdomain } = splitHostname();

  return {
    CDN_HOST: REACT_APP_CDN_HOST.replace('<subdomain>', subdomain),
    API_URL: REACT_APP_API_URL.replace('<subdomain>', subdomain),
    API_SUBSCRIPTION_URL: REACT_APP_API_SUBSCRIPTION_URL.replace(
      '<subdomain>',
      subdomain
    )
  };
};

const { API_URL, API_SUBSCRIPTION_URL } = getEnv();

// Create an http link:
const httpLink = createHttpLink({
  uri: `${API_URL}/graphql`,
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
  uri: API_SUBSCRIPTION_URL || '',
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
