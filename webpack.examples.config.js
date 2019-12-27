var path = require("path");
var PROJECT_DEPS = process.env.PROJECT_DEPS || __dirname;

module.exports = {
  entry: {
    demo: "src/demo/main.js"
  },
  output: {
    path: "examples/",
    pathinfo: false,
    filename: "out/[name].js"
  },
  module: {
    loaders: [
      {
        test: /\.jsx\.mustache$/,
        loader: "schwartzman",
        query: { lambdas: true }
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)|(baselib)/,
        loader: "babel-loader"
      }
    ]
  },
  resolveLoader: {
    root: path.join(PROJECT_DEPS, "node_modules"),
    modulesDirectories: [path.resolve(__dirname, "dist")]
  },
  resolve: {
    root: path.join(PROJECT_DEPS, "node_modules"),
    modulesDirectories: [
      path.resolve(__dirname, "examples"),
      path.resolve(__dirname, "dist"),
      "node_modules"
    ],
    extensions: [".js", ".jsx", ".jsx.mustache", ""]
  },
  plugins: [
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     NODE_ENV: '"production"',
    //   }
    // }),
    // new webpack.optimize.UglifyJsPlugin({output: {comments: false}}),
  ]
};
