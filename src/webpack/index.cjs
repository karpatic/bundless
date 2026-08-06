"use strict";

const path = require("node:path");

const PLUGIN_NAME = "BundlessWebpackPlugin";
const loaderPath = path.join(__dirname, "bundless.webpack-loader.cjs");

const RUNTIME_ALIASES = {
  bundlessdev$: false,
  "bundlessdev/acorn$": false,
  "bundlessdev/acorn/dev$": false,
  "bundlessdev/babel$": false,
  "bundlessdev/meriyah$": false,
  "bundlessdev/sucrase$": false,
};

class BundlessWebpackPlugin {
  constructor(options = {}) {
    this.options = {
      exclude: /node_modules/,
      prefetch: "webpack",
      runtime: false,
      stripHtmlRuntime: true,
      test: /\.[cm]?[jt]sx?$/,
      ...options,
    };
  }

  apply(compiler) {
    if (this.options.loader !== false) {
      addBundlessLoader(compiler.options, this.options);
    }

    if (this.options.runtime === false) {
      excludeBundlessRuntime(compiler.options, this.options.runtimeAliases);
    }

    if (this.options.stripHtmlRuntime !== false) {
      stripHtmlRuntimeTags(compiler);
    }
  }
}

function addBundlessLoader(webpackOptions, options) {
  webpackOptions.module = webpackOptions.module || {};
  webpackOptions.module.rules = webpackOptions.module.rules || [];

  const rule = {
    enforce: "pre",
    test: options.test,
    use: [
      {
        loader: loaderPath,
        options: {
          parserPlugins: options.parserPlugins,
          prefetch: options.prefetch,
        },
      },
    ],
  };

  if (options.include) {
    rule.include = options.include;
  }
  if (options.exclude) {
    rule.exclude = options.exclude;
  }

  webpackOptions.module.rules.push(rule);
}

function excludeBundlessRuntime(webpackOptions, runtimeAliases) {
  webpackOptions.resolve = webpackOptions.resolve || {};
  webpackOptions.resolve.alias = webpackOptions.resolve.alias || {};
  webpackOptions.resolve.alias = {
    ...(runtimeAliases || RUNTIME_ALIASES),
    ...webpackOptions.resolve.alias,
  };
}

function getHtmlWebpackPluginConstructor(compiler) {
  return (compiler.options.plugins || [])
    .map((plugin) => plugin && plugin.constructor)
    .find(
      (constructor) =>
        constructor && typeof constructor.getHooks === "function"
    );
}

function stripHtmlRuntimeTags(compiler) {
  compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
    const HtmlWebpackPlugin = getHtmlWebpackPluginConstructor(compiler);
    if (!HtmlWebpackPlugin) {
      return;
    }

    HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tap(
      PLUGIN_NAME,
      (data) => {
        data.headTags = data.headTags.filter(isNotBundlessBootstrapTag);
        data.bodyTags = data.bodyTags.filter(isNotBundlessBootstrapTag);
        return data;
      }
    );
  });
}

function isNotBundlessBootstrapTag(tag) {
  if (tag.tagName !== "script") {
    return true;
  }

  const attrs = tag.attributes || {};
  const src = String(attrs.src || "");
  const type = String(attrs.type || "").toLowerCase();

  const isBundlessRuntime =
    /bundless\.(acorn|babel|meriyah|sucrase).*\.(m?js)([?#].*)?$/i.test(src);
  const isBundlessSourceScript = /^(text|application)\/(jsx|tsx|babel)$/i.test(
    type
  );

  return !isBundlessRuntime && !isBundlessSourceScript;
}

function bundlessWebpack(config = {}, options = {}) {
  return {
    ...config,
    plugins: [...(config.plugins || []), new BundlessWebpackPlugin(options)],
  };
}

module.exports = BundlessWebpackPlugin;
module.exports.BundlessWebpackPlugin = BundlessWebpackPlugin;
module.exports.bundlessWebpack = bundlessWebpack;
module.exports.loader = loaderPath;
