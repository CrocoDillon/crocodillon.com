import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { Provider } from 'react-redux';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';
import { ReduxRouter } from 'redux-router';
import { match } from 'redux-router/server';

import configureStore from './store';
import routes from './routes';
import Template from './Template';

if (typeof window !== 'undefined') {
  let initialState = window.__INITIAL_STATE__,
      store = configureStore(initialState);

  ReactDOM.render(
    <div>
      <Provider store={store}>
        <ReduxRouter routes={routes} />
      </Provider>
      <DebugPanel top right bottom>
        <DevTools store={store} monitor={LogMonitor} />
      </DebugPanel>
    </div>,
  document.getElementById('app'));
}

export function run(path, callback) {
  let store = configureStore(),
      onMatch = (error, redirectLocation, routerState) => {
        let markup = ReactDOMServer.renderToString(
              <div>
                <Provider store={store}>
                  <ReduxRouter routes={routes} />
                </Provider>
                <DebugPanel top right bottom>
                  <DevTools store={store} monitor={LogMonitor} />
                </DebugPanel>
              </div>
            ),
            state = store.getState();

        callback(
          '<!DOCTYPE html>\n' +
          ReactDOMServer.renderToStaticMarkup(<Template title="CrocoDillon" markup={markup} state={state} />)
        );
      },
      action = match(path, onMatch);

  store.dispatch(action);
};
