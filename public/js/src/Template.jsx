import React from 'react';

class HtmlTemplate extends React.Component {
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
          <script id="app-initial-state" type="application/json" dangerouslySetInnerHTML={getAppState()} />
          <script src="/js/build/app.js"></script>
        </body>
      </html>
    );
  }
}

export default HtmlTemplate;
