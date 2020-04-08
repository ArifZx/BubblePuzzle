const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: "./src/app.ts",
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(tsx|ts)?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "production",
  plugins: [new TerserPlugin()],
  optimization: {
    minimizer: [new UglifyJsPlugin()],
  },
};
