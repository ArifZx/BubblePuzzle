"use strict";

const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");

module.exports = {
  entry: "./src/app.ts",
  devtool: "source-map",
  externals: {
    phaser: {
      root: "phaser",
      commonjs2: "phaser",
    },
  },
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
  plugins: [
    new webpack.DefinePlugin({
      "typeof CANVAS_RENDERER": JSON.stringify(true),
      "typeof WEBGL_RENDERER": JSON.stringify(true),
      "typeof EXPERIMENTAL": JSON.stringify(false),
      "typeof PLUGIN_CAMERA3D": JSON.stringify(false),
      "typeof PLUGIN_FBINSTANT": JSON.stringify(false),
    }),
    new CleanWebpackPlugin(),
    new TerserPlugin(),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        warningsFilter: () => false,
        minify: (file, sourceMap) => {
          const extractedComments = [];

          const { error, map, code, warnings } = require("uglify-js") // Or require('./path/to/uglify-module')
            .minify(file, {
              compress: true,
              ie8: false,
              output: { comments: false },
              warnings: false,
              mangle: true,
            });

          return { error, map, code, warnings, extractedComments };
        },
      }),
    ],
  },
};
