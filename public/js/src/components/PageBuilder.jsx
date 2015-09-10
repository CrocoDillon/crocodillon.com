import React from 'react';

class PageBuilderComponent extends React.Component {
  render() {
    let getAppMarkup = () => {
          return {__html: this.props.markup};
        },
        getAppState = () => {
          let json = JSON.stringify(this.props.state).replace('</', '<\\/');
          return {__html: json};
        };

    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>{this.props.title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body>
          <div id="app" dangerouslySetInnerHTML={getAppMarkup()} />
          <script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.13.3/react.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/react-router/0.13.3/ReactRouter.min.js"></script>
          <script id="app-state" type="application/json" dangerouslySetInnerHTML={getAppState()} />
          <script src="/js/build/bundle.js"></script>
        </body>
      </html>
    );
  }
}

export default PageBuilderComponent;
