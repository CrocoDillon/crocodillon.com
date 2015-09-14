import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import Router, { RoutingContext, match } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import createLocation from 'history/lib/createLocation';

import routes from './routes';
import Template from './Template';

if (typeof window !== 'undefined') {
  let history = createBrowserHistory();
  ReactDOM.render(<Router routes={routes} history={history} />, document.getElementById('app'));
}

export function run(path, callback) {
    let location = createLocation(path);

    match({routes, location}, (err, redirectLocation, renderProps) => {
      let markup = ReactDOMServer.renderToString(<RoutingContext {...renderProps} />);

      callback(
        '<!DOCTYPE html>\n' +
        ReactDOMServer.renderToStaticMarkup(<Template title="CrocoDillon" markup={markup} state={{}} />)
      );
    });
};
