var webpack = require('webpack'),
    path = require('path');

module.exports = {
  entry: {
    app: './public/js/src/app.jsx',
    // vendors: ['react', 'react-dom', 'react-router']
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: path.join(__dirname, './public/js/build'),
    publicPath: '/js/build/',
    filename: 'app.js',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader?stage=0'
      }
    ]
  },
  // plugins: [
  //   new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
  // ],
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
