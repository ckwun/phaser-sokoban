const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    index: path.resolve(__dirname, 'src', 'index.js'),
  },
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'assets'),
      publicPath: '/assets',
    },
    hot: true,
  },
  resolve: {
    alias: {
      Scenes: path.resolve(__dirname, 'src', 'scenes'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Sokoban',
    }),
  ],
  output: {
    asyncChunks: true,
    filename: '[name].[contenthash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
};
