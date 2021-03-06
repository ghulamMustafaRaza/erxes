import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { Profile } from './containers';

const profile = ({ location }) => {
  const queryParams = queryString.parse(location.search);
  return <Profile queryParams={queryParams} />;
};

const routes = () => (
  <React.Fragment>
    <Route path="/profile" exact={true} key="/profile" component={profile} />
  </React.Fragment>
);

export default routes;
