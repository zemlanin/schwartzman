var path = require('path');
var PROJECT_DEPS = process.env.PROJECT_DEPS || __dirname;

module.exports = {
  entry: {
    try: "src/try/main.js",
  },
  output: {
    path: 'examples/',
    pathinfo: true,
    filename: "out/[name].js",
  },
  module: {
    loaders: [
      {test: /\.jsx\.mustache$/, loader: "schwartzman"},
      {test: /\.jsx?$/, exclude: /(node_modules)|(baselib)/, loader: 'babel-loader'}
    ],
  },
  resolveLoader: {
    root: path.join(PROJECT_DEPS, 'node_modules'),
    modulesDirectories: [
      path.resolve(__dirname, "bin"),
    ],
  },
  resolve: {
    root: path.join(PROJECT_DEPS, 'node_modules'),
    modulesDirectories: [
      path.resolve(__dirname, "examples"),
      "node_modules",
    ],
    extensions: ['.js', '.jsx', '.jsx.mustache', ''],
  },
}
