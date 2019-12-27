var webpack = require("webpack");
var path = require("path");

module.exports = {
  mode: "production",
  entry: {
    schwartzman: path.resolve(__dirname, "src", "schwartzman.js")
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    library: "schwartzman",
    libraryTarget: "umd",
    globalObject: "this"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)|(baselib)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["babel-preset-es2015"]
          }
        }
      }
    ]
  },
  externals: ["loader-utils"],
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(process.env.npm_package_version)
    })
  ]
};
