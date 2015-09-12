import React from 'react';
import Router, {HistoryLocation} from 'react-router';

import routes from './routes';
import PageBuilder from './components/PageBuilder';

if (typeof window !== 'undefined') {
  Router.run(routes, HistoryLocation, (Page) => {
      React.render(<Page/>, document.getElementById('app'));
  });
}

export function run(path, callback) {
  Router.run(routes, path, (Page) => {
    let markup = React.renderToString(<Page/>);

    callback(
      '<!DOCTYPE html>' +
      React.renderToStaticMarkup(<PageBuilder title="CrocoDillon" markup={markup} state={{}} />)
    );
  });
}
