var webpack = require("webpack");
var path = require('path');

module.exports = {
  entry: {
    schwartzman: "schwartzman"
  },
  output: {
    path: 'dist/',
    filename: "[name].js",
    library: 'schwartzman',
    libraryTarget: 'umd',
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, exclude: /(node_modules)|(baselib)/, loader: 'babel-loader'}
    ],
  },
  resolve: {
    root: path.join(__dirname, 'src'),
    modulesDirectories: [
      path.resolve(__dirname, 'src'),
    ],
    extensions: ['.js', ''],
  },
  externals: [
    'loader-utils',
  ],
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(process.env.npm_package_version)
    }),
  ],
}
