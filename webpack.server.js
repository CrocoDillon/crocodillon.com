var webpack = require('webpack'),
    WebpackDevServer = require('webpack-dev-server'),
    config = require('./webpack.config.js');

var compiler = webpack(config),
    server = new WebpackDevServer(compiler, config.devServer),
    port = config.devServer.port;

server.listen(port, 'localhost', function () {
  console.log('Webpack development server listening on port ' + port);
});
