import createLocation from 'history/lib/createLocation';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { Provider } from 'react-redux';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';
import ReduxRouter from 'redux-router';
import { match } from 'redux-router/server';

import createStore from './store';
import Template from './Template';

if (typeof window !== 'undefined') {
  let initialState = window.__INITIAL_STATE__,
      store = createStore(initialState);

  ReactDOM.render(
    <div>
      <Provider store={store}>
        <ReduxRouter />
      </Provider>
      <DebugPanel top right bottom>
        <DevTools store={store} monitor={LogMonitor} />
      </DebugPanel>
    </div>,
  document.getElementById('app'));
}

export function run(path, callback) {
  let location = createLocation(path),
      store = createStore(),
      onMatch = store.dispatch(match(location));

  onMatch((error, redirectLocation) => {
    let markup = ReactDOMServer.renderToString(
          <div>
            <Provider store={store}>
              <ReduxRouter />
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
  });
};
