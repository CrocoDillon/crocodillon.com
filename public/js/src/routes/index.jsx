import React from 'react';
import { IndexRoute, Route } from 'react-router';

import App from './App';
import HomeRoute from './HomeRoute';
import AboutRoute from './AboutRoute';

const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={HomeRoute}/>
    <Route path="about" component={AboutRoute}/>
    <Route path="*" component={HomeRoute}/>
  </Route>
);

export default routes;
