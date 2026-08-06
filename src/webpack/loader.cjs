"use strict";

const { transformBundlessWebpackSource } = require("./transform.cjs");

module.exports = function bundlessWebpackLoader(source) {
  if (this.cacheable) {
    this.cacheable();
  }

  if (!source.includes("window")) {
    return source;
  }

  if (!source.includes("import") && !source.includes("Bundless")) {
    return source;
  }

  const options = this.getOptions ? this.getOptions() : {};

  try {
    const result = transformBundlessWebpackSource(source, {
      ...options,
      resourcePath: this.resourcePath,
    });
    return result.code;
  } catch (error) {
    error.message = `Bundless Webpack loader failed in ${this.resourcePath}: ${error.message}`;
    throw error;
  }
};
