var webpack = require('webpack'),
    path = require('path');

module.exports = [
  {
    entry: {
      app: './public/js/src/app.jsx'
    },
    resolve: {
      extensions: ['', '.js', '.jsx']
    },
    output: {
      path: path.join(__dirname, './public/js/build'),
      filename: 'server.js',
      libraryTarget: 'commonjs2'
    },
    module: {
      loaders: [
        {test: /\.jsx$/, loader: 'babel-loader?stage=0'}
      ]
    },
    externals: [
      'react',
      'react-router'
    ],
    cache: true
  }, {
    entry: {
      app: './public/js/src/app.jsx'
    },
    resolve: {
      extensions: ['', '.js', '.jsx']
    },
    output: {
      path: path.join(__dirname, './public/js/build'),
      filename: 'client.js',
    },
    module: {
      loaders: [
        {test: /\.jsx$/, loader: 'babel-loader?stage=0'}
      ]
    },
    externals: {
      'react': 'React',
      'react-router': 'ReactRouter'
    },
    cache: true
  }
];
