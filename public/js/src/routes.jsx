import React from 'react';
import {Route} from 'react-router';

import Page from './components/Page';
import PageHome from './components/PageHome';
import PageAbout from './components/PageAbout';

const routes = (
  <Route handler={Page}>
    <Route name="home" path="/" handler={PageHome}/>
    <Route name="about" path="/about" handler={PageAbout}/>
  </Route>
);

export default routes;
