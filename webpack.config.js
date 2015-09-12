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
    publicPath: '/js/build/',
    filename: 'bundle.js',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        loader: 'babel-loader?stage=0',
        exclude: /node_modules/
      }
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
  },
  devServer: {
    publicPath: '/js/build/',
    proxy: {
      '*': 'http://localhost:8080'
    },
    hot: true,
    inline: true,
    noInfo: true,
    stats: {
      colors: true
    },
    port: 9090
  }
};
