const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundlessWebpackPlugin = require("bundlessdev/webpack");

module.exports = {
  mode: "production",
  entry: "./src/index.jsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "app.[contenthash].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { targets: "defaults" }],
              ["@babel/preset-react", { runtime: "automatic" }],
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./index.html" }),
    new BundlessWebpackPlugin({
      include: path.resolve(__dirname, "src"),
      prefetch: "webpack",
      stripHtmlRuntime: true,
    }),
  ],
};
