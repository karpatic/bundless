"use strict";

const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const DEFAULT_PARSER_PLUGINS = [
  "jsx",
  "dynamicImport",
  "importMeta",
  "topLevelAwait",
  "classProperties",
  "classPrivateProperties",
  "classPrivateMethods",
  "objectRestSpread",
  "optionalChaining",
  "nullishCoalescingOperator",
  "numericSeparator",
  "logicalAssignment",
  "importAttributes",
];

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function parserPluginsFor(resourcePath = "", options = {}) {
  const parserPlugins = [...DEFAULT_PARSER_PLUGINS];
  if (/\.[cm]?tsx?$/.test(resourcePath)) {
    parserPlugins.push("typescript");
  }
  return unique(parserPlugins.concat(options.parserPlugins || []));
}

function isNamedMember(member, objectName, propertyName) {
  if (!member || member.type !== "MemberExpression") {
    return false;
  }

  const objectMatches =
    member.object.type === "Identifier" && member.object.name === objectName;
  const propertyMatches = member.computed
    ? member.property.type === "StringLiteral" &&
      member.property.value === propertyName
    : member.property.type === "Identifier" &&
      member.property.name === propertyName;

  return objectMatches && propertyMatches;
}

function isWindowImportCall(node) {
  return isNamedMember(node.callee, "window", "import");
}

function isWindowBundlessPrefetchCall(node) {
  const callee = node.callee;
  if (!callee || callee.type !== "MemberExpression") {
    return false;
  }

  const propertyMatches = callee.computed
    ? callee.property.type === "StringLiteral" &&
      callee.property.value === "prefetch"
    : callee.property.type === "Identifier" &&
      callee.property.name === "prefetch";

  return (
    propertyMatches &&
    isNamedMember(callee.object, "window", "Bundless")
  );
}

function getPrefetchSpecifiers(argument) {
  if (!argument) {
    return [];
  }
  if (argument.type === "StringLiteral") {
    return [argument.value];
  }
  if (argument.type !== "ArrayExpression") {
    return [];
  }

  return argument.elements
    .filter((element) => element && element.type === "StringLiteral")
    .map((element) => element.value);
}

function makePromiseResolve() {
  return "Promise.resolve()";
}

function makeWebpackPrefetch(specifiers) {
  if (specifiers.length === 0) {
    return makePromiseResolve();
  }

  const imports = specifiers
    .map(
      (specifier) =>
        `import(/* webpackPrefetch: true */ ${JSON.stringify(specifier)});`
    )
    .join(" ");

  return `(function __bundlessWebpackPrefetch() { ${imports} }, ${makePromiseResolve()})`;
}

function addReplacement(replacements, start, end, value) {
  replacements.push({ start, end, value });
}

function applyReplacements(source, replacements) {
  return replacements
    .sort((a, b) => b.start - a.start)
    .reduce(
      (code, replacement) =>
        code.slice(0, replacement.start) +
        replacement.value +
        code.slice(replacement.end),
      source
    );
}

function transformBundlessWebpackSource(source, options = {}) {
  const ast = parser.parse(source, {
    allowReturnOutsideFunction: true,
    errorRecovery: false,
    sourceType: "unambiguous",
    plugins: parserPluginsFor(options.resourcePath, options),
  });

  const replacements = [];
  const prefetchMode = options.prefetch === "noop" ? "noop" : "webpack";

  traverse(ast, {
    CallExpression(path) {
      const { node } = path;
      if (path.scope.hasBinding("window")) {
        return;
      }

      if (isWindowImportCall(node)) {
        addReplacement(replacements, node.callee.start, node.callee.end, "import");
        return;
      }

      if (isWindowBundlessPrefetchCall(node)) {
        const specifiers = getPrefetchSpecifiers(node.arguments[0]);
        const replacement =
          prefetchMode === "webpack"
            ? makeWebpackPrefetch(specifiers)
            : makePromiseResolve();
        addReplacement(replacements, node.start, node.end, replacement);
      }
    },
  });

  if (replacements.length === 0) {
    return { code: source, changed: false };
  }

  return {
    code: applyReplacements(source, replacements),
    changed: true,
  };
}

module.exports = {
  transformBundlessWebpackSource,
};
