import createHistory from 'history/lib/createBrowserHistory';
import { compose, createStore, applyMiddleware } from 'redux';
import { devTools } from 'redux-devtools';
import { reduxReactRouter as clientRouter } from 'redux-router';
import { reduxReactRouter as serverRouter } from 'redux-router/server';
import thunk from 'redux-thunk';

import reducer from './reducers';
import routes from './routes';

let router = typeof window !== 'undefined' ?
  clientRouter({routes, createHistory}):
  serverRouter({routes});

const composedStore = compose(
  applyMiddleware(thunk),
  router,
  devTools()
)(createStore);

export default function (initialState) {
  return composedStore(reducer, initialState);
}
