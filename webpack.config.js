var webpack = require('webpack'),
    path = require('path');

module.exports = {
  entry: {
    app: './public/js/src/app.jsx'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: path.join(__dirname, './public/js/build'),
    filename: 'bundle.js',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {test: /\.jsx$/, loader: 'babel-loader?stage=0'}
    ]
  },
  externals: {
    'react': {
      root: 'React',
      commonjs2: 'react'
    },
    'react-router': {
      root: 'ReactRouter',
      commonjs2: 'react-router'
    }
  }
};
