var webpack = require("webpack");
var path = require('path');
var PROJECT_DEPS = process.env.PROJECT_DEPS || __dirname;

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
    root: path.join(PROJECT_DEPS, 'src'),
    modulesDirectories: [
      path.resolve(__dirname, "src"),
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
