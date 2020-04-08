const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: "./src/app.ts",
  devtool: "source-map",
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
  plugins: [new CleanWebpackPlugin(), new TerserPlugin()],
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
