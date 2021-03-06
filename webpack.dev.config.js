"use strict";

const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");

module.exports = {
  devServer: {
    port: 8085,
  },
  entry: {
    pageLoading: path.resolve(__dirname, "src/pageLoading.ts"),
    game: path.resolve(__dirname, "src/app.ts"),
  },
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
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: "file-loader",
        options: {
          outputPath: "assets/images",
          publicPath: "assets/images",
        },
      },
      {
        test: /\.(ogg|mp3)$/i,
        loader: "file-loader",
        options: {
          outputPath: "assets/audio",
          publicPath: "assets/audio",
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  output: {
    filename: "[name].[hash].js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development",
  plugins: [
    new webpack.DefinePlugin({
      "typeof CANVAS_RENDERER": JSON.stringify(true),
      "typeof WEBGL_RENDERER": JSON.stringify(true),
      "typeof EXPERIMENTAL": JSON.stringify(false),
      "typeof PLUGIN_CAMERA3D": JSON.stringify(false),
      "typeof PLUGIN_FBINSTANT": JSON.stringify(false),
    }),
    new CleanWebpackPlugin(),
    new HTMLWebpackPlugin({
      title: "Bubble Puzzle",
      template: path.resolve(__dirname, "src/index.html"),
      chunks: ["game", "pageLoading"],
    }),
    new ScriptExtHtmlWebpackPlugin({
      preload: ["pageLoading"],
      defer: ["game"],
    }),
  ],
};
