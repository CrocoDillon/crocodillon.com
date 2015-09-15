import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import Router, { RoutingContext, match } from 'react-router';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import createLocation from 'history/lib/createLocation';

import reducers from './reducers';
import { routerStateChange } from './actions/router';
import routes from './routes';
import Template from './Template';

if (typeof window !== 'undefined') {
  let initialState = window.__INITIAL_STATE__,
      store = createStore(reducers, initialState),
      history = createBrowserHistory();

  ReactDOM.render(
    <Provider store={store}>
      <Router routes={routes} history={history} onUpdate={function () {
        store.dispatch(routerStateChange(this.state));
      }} />
    </Provider>,
  document.getElementById('app'));
}

export function run(path, callback) {
    let location = createLocation(path),
        store = createStore(reducers);

    match({routes, location}, (err, redirectLocation, renderProps) => {
      store.dispatch(routerStateChange(renderProps))

      let markup = ReactDOMServer.renderToString(
            <Provider store={store}>
              <RoutingContext {...renderProps} />
            </Provider>
          ),
          state = store.getState();

      callback(
        '<!DOCTYPE html>\n' +
        ReactDOMServer.renderToStaticMarkup(<Template title="CrocoDillon" markup={markup} state={state} />)
      );
    });
};
