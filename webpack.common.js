const webpack = require('webpack'); 
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'browser-bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'cheap-module-eval-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
            loader: 'babel-loader',
            options: {
              presets: ['es2015', 'react'],
              plugins: ['lodash']
            }
        },
        exclude: /node_modules/
      }, {
        test: /\.css$/,
        use: [
            {
                loader: 'style-loader'
            },
            {
                loader: 'css-loader'
            }
        ]
      }
    ]
  },
  plugins: [
    /*new webpack.ProvidePlugin({
        Popper: ['popper.js', 'default'],
    }),*/
    new BundleAnalyzerPlugin()
   ]
};