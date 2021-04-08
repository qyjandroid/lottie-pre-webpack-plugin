const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const LottieWebpackPlugin=require("./src/plugins/index");

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'lottie-pre-webpack-plugin'
    }),
    new CleanWebpackPlugin(),
    new LottieWebpackPlugin({msg:"good body"})
  ]
}