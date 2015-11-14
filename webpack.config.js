var webpack = require('webpack'),
    path = require('path');

module.exports = {
  entry: {
    app: './public/js/src/app.jsx',
    // vendor: [
    //   'history',
    //   'react',
    //   'react-dom',
    //   'react-redux',
    //   'react-router',
    //   'redux',
    //   'redux-router',
    //   'redux-thunk'
    // ]
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
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['react', 'es2015']
        }
      }
    ]
  },
  // plugins: [
  //   new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js')
  // ],
  devtool: 'eval',
  // externals: {
  //   'history': {
  //     root: 'History',
  //     commonjs2: 'history',
  //     commonjs: 'history',
  //     amd: 'history'
  //   },
  //   'react': {
  //     root: 'React',
  //     commonjs2: 'react',
  //     commonjs: 'react',
  //     amd: 'react'
  //   },
  //   'react-dom': {
  //     root: 'ReactDOM',
  //     commonjs2: 'react-dom',
  //     commonjs: 'react-dom',
  //     amd: 'react-dom'
  //   },
  //   'react-router': {
  //     root: 'ReactRouter',
  //     commonjs2: 'react-router',
  //     commonjs: 'react-router',
  //     amd: 'react-router'
  //   }
  // },
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
