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

    const hooks = HtmlWebpackPlugin.getHooks(compilation);

    hooks.alterAssetTagGroups.tap(
      PLUGIN_NAME,
      (data) => {
        data.headTags = data.headTags.filter(isNotBundlessBootstrapTag);
        data.bodyTags = data.bodyTags.filter(isNotBundlessBootstrapTag);
        return data;
      }
    );

    if (hooks.beforeEmit && typeof hooks.beforeEmit.tap === "function") {
      hooks.beforeEmit.tap(PLUGIN_NAME, (data) => {
        data.html = stripBundlessPrefetchScriptBlocks(data.html);
        return data;
      });
    }
  });
}

function getHtmlAttributeValue(attributes, name) {
  const normalizedName = name.toLowerCase();
  const key = Object.keys(attributes || {}).find(
    (attributeName) => attributeName.toLowerCase() === normalizedName
  );

  return key ? attributes[key] : undefined;
}

function hasHtmlAttribute(attributes, name) {
  return getHtmlAttributeValue(attributes, name) !== undefined;
}

function isNotBundlessBootstrapTag(tag) {
  if (String(tag.tagName).toLowerCase() !== "script") {
    return true;
  }

  const attrs = tag.attributes || {};
  const src = String(getHtmlAttributeValue(attrs, "src") || "");
  const type = String(getHtmlAttributeValue(attrs, "type") || "").toLowerCase();

  const isBundlessRuntime =
    /bundless\.(acorn|babel|meriyah|sucrase).*\.(m?js)([?#].*)?$/i.test(src);
  const isBundlessSourceScript = /^(text|application)\/(jsx|tsx|babel)$/i.test(
    type
  );
  const isBundlessPrefetchScript = hasHtmlAttribute(
    attrs,
    "data-bundless-prefetch"
  );
  const isWebpackIgnored = hasHtmlAttribute(attrs, "data-webpack-ignore");

  if (isBundlessPrefetchScript && !isWebpackIgnored) {
    return false;
  }

  return !isBundlessRuntime && !isBundlessSourceScript;
}

function getHtmlAttributeNames(attributeSource) {
  const names = [];
  const attributePattern =
    /([^\s"'<>\/=]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;
  let match;

  while ((match = attributePattern.exec(attributeSource))) {
    names.push(match[1].toLowerCase());
  }

  return names;
}

function hasHtmlAttributeName(attributeSource, name) {
  return getHtmlAttributeNames(attributeSource).includes(name.toLowerCase());
}

function shouldStripBundlessPrefetchScript(attributeSource) {
  return (
    hasHtmlAttributeName(attributeSource, "data-bundless-prefetch") &&
    !hasHtmlAttributeName(attributeSource, "data-webpack-ignore")
  );
}

function stripBundlessPrefetchScriptBlocks(html) {
  if (typeof html !== "string" || !/data-bundless-prefetch/i.test(html)) {
    return html;
  }

  return html.replace(
    /<script\b((?:"[^"]*"|'[^']*'|[^'">])*)>[\s\S]*?<\/script\s*>/gi,
    (scriptBlock, attributeSource) =>
      shouldStripBundlessPrefetchScript(attributeSource) ? "" : scriptBlock
  );
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
