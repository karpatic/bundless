// transpile.js

const STATIC_IMPORT_PATTERN = /^([ \t]*)import\s+(?:(['"])([^'"]+)\2|(?:([\s\S]*?)\s+from\s*(['"])([^'"]+)\5))[ \t]*;?[ \t]*(?=\r?\n|$)/gm;
const LOCAL_MODULE_IMPORT_PATTERN = /^(?:\.{1,2}\/|\/)/;
const MODULE_FILE_EXTENSION_PATTERN = /\.(?:mjs|jsx?|tsx?)$/i;
const IDENTIFIER_PROPERTY_PATTERN = /^[A-Za-z_$][\w$]*$/;

function splitImportSpecifiers(specifiers) {
  return specifiers
    .split(",")
    .map((specifier) => specifier.trim())
    .filter(Boolean);
}

function normalizeImportName(name) {
  const trimmed = name.trim();
  const quote = trimmed[0];
  if ((quote === "'" || quote === '"') && trimmed[trimmed.length - 1] === quote) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseNamedImportSpecifiers(specifiers) {
  return splitImportSpecifiers(specifiers)
    .map((specifier) => {
      if (/^type\s+/.test(specifier)) {
        return false;
      }

      const alias = specifier.match(/^(.+?)\s+as\s+(.+)$/);
      const imported = normalizeImportName(alias ? alias[1] : specifier);
      const local = normalizeImportName(alias ? alias[2] : specifier);
      return { imported, local };
    })
    .filter(Boolean);
}

function parseImportClause(importClause) {
  const imports = {
    defaultImport: false,
    namespaceImport: false,
    namedImports: [],
    typeOnly: false,
  };

  if (!importClause) {
    return imports;
  }

  const clause = importClause.trim();
  if (/^type\b/.test(clause)) {
    imports.typeOnly = true;
    return imports;
  }

  let remainingClause = clause;
  const namedImportMatch = remainingClause.match(/\{([\s\S]*)\}/);
  if (namedImportMatch) {
    imports.namedImports = parseNamedImportSpecifiers(namedImportMatch[1]);
    remainingClause = remainingClause.replace(namedImportMatch[0], "");
  }

  const namespaceImportMatch = remainingClause.match(/\*\s+as\s+([^,\s]+)/);
  if (namespaceImportMatch) {
    imports.namespaceImport = namespaceImportMatch[1];
    remainingClause = remainingClause.replace(namespaceImportMatch[0], "");
  }

  const defaultImport = remainingClause.replace(/,/g, " ").trim();
  if (defaultImport) {
    imports.defaultImport = defaultImport.split(/\s+/)[0];
  }

  return imports;
}

function getModuleUrlBase(currentFilePath) {
  const basePath = currentFilePath || location.href;
  const normalizedBasePath = /\/$/.test(basePath) ? basePath : `${basePath}/`;
  return new URL(normalizedBasePath, location.href);
}

function isTransformableLocalModuleImport(specifier) {
  if (!LOCAL_MODULE_IMPORT_PATTERN.test(specifier)) {
    return false;
  }

  try {
    return MODULE_FILE_EXTENSION_PATTERN.test(new URL(specifier, location.href).pathname);
  } catch (error) {
    return MODULE_FILE_EXTENSION_PATTERN.test(specifier.split(/[?#]/)[0]);
  }
}

function resolveLocalModuleImport(specifier, currentFilePath) {
  const url = new URL(specifier, getModuleUrlBase(currentFilePath));
  if (!window.Bundless.cache) {
    url.searchParams.set("cachebust", Date.now());
  }
  return url.href;
}

function getModuleProperty(imported) {
  if (IDENTIFIER_PROPERTY_PATTERN.test(imported)) {
    return `.${imported}`;
  }
  return `[${JSON.stringify(imported)}]`;
}

function getDefaultImportInterop(moduleImportExpression) {
  return `${moduleImportExpression}.then((mod) => Object.prototype.hasOwnProperty.call(mod, "default") ? mod.default : mod)`;
}

function getNamedImport(moduleImportExpression, imported, modulePath) {
  const importName = JSON.stringify(imported);
  const importPath = JSON.stringify(modulePath);
  return `${moduleImportExpression}.then((mod) => { if (!Object.prototype.hasOwnProperty.call(mod, ${importName})) { throw new SyntaxError("The requested module " + ${importPath} + " does not provide an export named " + ${importName} + "."); } return mod${getModuleProperty(imported)}; })`;
}

function addImportBinding(importState, local) {
  if (importState.importedLocals.has(local)) {
    return false;
  }
  importState.importedLocals.add(local);
  return true;
}

function isPreactReactPackageImport(specifier) {
  return window.Bundless?.to === "preact" && /^(?:react|react-dom)(?:\/.*)?$/.test(specifier);
}

function nativeImport(specifier) {
  return import(specifier);
}

// This transforms local static import statements into dynamic import expressions.
function transformStaticImportsToDynamic(importClause, imports, moduleImportExpression, modulePath, importState) {
  if (imports.typeOnly) {
    return "";
  }

  const statements = [];

  if (imports.defaultImport && addImportBinding(importState, imports.defaultImport)) {
    statements.push(`const ${imports.defaultImport} = await ${getDefaultImportInterop(moduleImportExpression)};`);
  }

  if (imports.namespaceImport && addImportBinding(importState, imports.namespaceImport)) {
    statements.push(`const ${imports.namespaceImport} = await ${moduleImportExpression};`);
  }

  for (const namedImport of imports.namedImports) {
    if (addImportBinding(importState, namedImport.local)) {
      statements.push(`const ${namedImport.local} = await ${getNamedImport(moduleImportExpression, namedImport.imported, modulePath)};`);
    }
  }

  if (statements.length === 0 && !importClause) {
    statements.push(`await ${moduleImportExpression};`);
  }

  return statements.join(" ");
}

function getStaticImportTarget(specifier, currentFilePath, imports) {
  if (isPreactReactPackageImport(specifier)) {
    return false;
  }

  if (isTransformableLocalModuleImport(specifier)) {
    const moduleUrl = resolveLocalModuleImport(specifier, currentFilePath);
    return {
      moduleImportExpression: `window.import(${JSON.stringify(moduleUrl)})`,
      modulePath: moduleUrl,
    };
  }

  if (imports.defaultImport) {
    return {
      moduleImportExpression: `window.Bundless.nativeImport(${JSON.stringify(specifier)})`,
      modulePath: specifier,
    };
  }

  return false;
}


// Ran On Start
async function handleScriptTag(scriptTag) {
  let jsxCode;
  if (scriptTag.src) {
    const response = await fetch(scriptTag.src);
    if (!response.ok) throw new Error(`Failed to load ${scriptTag.src}`);
    jsxCode = await response.text();
  } else {
    jsxCode = scriptTag.textContent;
  }
  const filename = scriptTag.src ? scriptTag.src.split("/").slice(-1)[0] : 'inline script';
  let pathTo = scriptTag.src
    ? scriptTag.src.split("/").slice(0, -1).join("/")
    : location.href.split("/").slice(0, -1).join("/");
  // add
  if (pathTo && !filename.match(/^(http|\.|\/)/)) {
    pathTo += "/";
  }

  const transpiledCode = await window.Bundless.transpileCode(jsxCode, pathTo, filename);

  // Insert the transpiled code into a new script tag
  const script = document.createElement("script");
  script.type = "module";
  script.textContent = transpiledCode;
  document.body.appendChild(script);
}

function isInImportMap(moduleName) {
  const scriptTag = document.querySelector('script[type="importmap"]');
  if (!scriptTag) return false;

  try {
    const importMap = JSON.parse(scriptTag.textContent);
    return importMap.imports && importMap.imports[moduleName];
  } catch (error) {
    console.warning("Bundless: Import map not found:", error);
    return false;
  }
}

const moduleImportCache = new Map();
const moduleSourceCache = new Map();
const modulePreparedCodeCache = new Map();

function normalizeModuleImportPath(path) {
  const modulePath = String(path);
  try {
    return new URL(modulePath, location.href).href;
  } catch (error) {
    return modulePath;
  }
}

function splitModuleImportPath(normalizedPath) {
  return {
    basePath: normalizedPath.split("/").slice(0, -1).join("/") + "/",
    filename: normalizedPath.split("/").slice(-1)[0],
  };
}

async function fetchModuleSource(normalizedPath) {
  // console.log('fetching', normalizedPath);
  const response = await fetch(normalizedPath);
  if (!response.ok) {
    console.error(`Failed to load ${normalizedPath}: ${response.statusText}`);
    throw new Error(`Failed to load ${normalizedPath}`);
  }

  const code = await response.text();
  return { code, ...splitModuleImportPath(normalizedPath) };
}

function getModuleSource(normalizedPath) {
  const cachedSource = moduleSourceCache.get(normalizedPath);
  if (cachedSource) {
    return cachedSource;
  }

  const sourcePromise = fetchModuleSource(normalizedPath).catch((error) => {
    moduleSourceCache.delete(normalizedPath);
    throw error;
  });
  moduleSourceCache.set(normalizedPath, sourcePromise);
  return sourcePromise;
}

async function prepareModuleImport(normalizedPath) {
  const { code, basePath, filename } = await getModuleSource(normalizedPath);
  return await window.Bundless.transpileCode(code, basePath, filename);
}

function prepareModuleImportFromList(normalizedPath) {
  const cachedPreparation = modulePreparedCodeCache.get(normalizedPath);
  if (cachedPreparation) {
    return cachedPreparation;
  }

  const preparationPromise = prepareModuleImport(normalizedPath).catch((error) => {
    modulePreparedCodeCache.delete(normalizedPath);
    throw error;
  });
  modulePreparedCodeCache.set(normalizedPath, preparationPromise);
  return preparationPromise;
}

async function getImportTranspiledCode(normalizedPath) {
  const preparedCode = modulePreparedCodeCache.get(normalizedPath);
  if (preparedCode) {
    return await preparedCode;
  }

  const { code, basePath, filename } = await getModuleSource(normalizedPath);
  return await window.Bundless.transpileCode(code, basePath, filename);
}

function toModulePathList(paths) {
  if (paths == null) {
    throw new TypeError("Bundless.prefetch() requires a module URL or iterable of module URLs.");
  }
  if (typeof paths === "string") {
    return [paths];
  }
  if (typeof paths[Symbol.iterator] === "function") {
    return Array.from(paths);
  }
  return [paths];
}

async function prefetchModules(paths) {
  const modulePaths = toModulePathList(paths);
  await Promise.all(
    modulePaths.map((path) => getModuleSource(normalizeModuleImportPath(path)))
  );
}

async function prepareModulesFromPrefetchList(paths) {
  const modulePaths = toModulePathList(paths);
  await Promise.all(
    modulePaths.map((path) => prepareModuleImportFromList(normalizeModuleImportPath(path)))
  );
}

const BUNDLESS_PREFETCH_SELECTOR = "script[data-bundless-prefetch]";

function isApplicationJsonScriptTag(scriptTag) {
  const type = scriptTag.type || scriptTag.getAttribute?.("type") || "";
  return String(type).toLowerCase() === "application/json";
}

function findBundlessPrefetchScriptTags() {
  return Array.from(document.querySelectorAll(BUNDLESS_PREFETCH_SELECTOR))
    .filter(isApplicationJsonScriptTag);
}

function hasBundlessPrefetchScriptTags() {
  return findBundlessPrefetchScriptTags().length > 0;
}

function getBundlessPrefetchScriptLabel(scriptTag, index) {
  return scriptTag.id
    ? `script#${scriptTag.id}[data-bundless-prefetch]`
    : `script[data-bundless-prefetch] at index ${index}`;
}

function parseBundlessPrefetchScriptTag(scriptTag, index) {
  const label = getBundlessPrefetchScriptLabel(scriptTag, index);
  let value;

  try {
    value = JSON.parse(scriptTag.textContent || "");
  } catch (error) {
    console.warn(`Bundless prefetch: Ignoring ${label} because it contains malformed JSON.`, error);
    return [];
  }

  if (!Array.isArray(value)) {
    console.warn(`Bundless prefetch: Ignoring ${label}; expected a JSON array of module URL strings.`);
    return [];
  }

  return value.filter((modulePath, moduleIndex) => {
    if (typeof modulePath === "string") {
      return true;
    }
    console.warn(`Bundless prefetch: Ignoring ${label} item ${moduleIndex}; expected a module URL string.`);
    return false;
  });
}

async function handleBundlessPrefetchScriptTags() {
  const modulePaths = findBundlessPrefetchScriptTags()
    .flatMap((scriptTag, index) => parseBundlessPrefetchScriptTag(scriptTag, index));

  if (modulePaths.length === 0) {
    return;
  }

  await prepareModulesFromPrefetchList(modulePaths);
}

function startBundlessPrefetches() {
  const prefetchPromise = handleBundlessPrefetchScriptTags();
  prefetchPromise.catch((error) => {
    console.warn("Bundless prefetch: Failed to prepare one or more modules. A later window.import() call will retry normally.", error);
  });
  return prefetchPromise;
}

function runWhenDocumentReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
    return;
  }
  callback();
}

window.Bundless = {
  ...window.Bundless,
  nativeImport,
  prefetch: prefetchModules,
};

async function loadModuleImport(normalizedPath) {
  const transpiledCode = await getImportTranspiledCode(normalizedPath);

  const blob = new Blob([transpiledCode], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);

  try {
    const module = await import(url);
    return module;
  } catch (error) {
    console.error(`Failed to import module from ${url}: ${error.message}`);

    // Add specific debugging for the destructuring error
    if (error.message.includes('Cannot destructure property')) {
      console.warn(`The module at ${normalizedPath} doesn't export the expected properties. Check that all imports match their exports.`);
      // You could add code here to log the transpiled code for debugging
      // console.log("Transpiled code:", transpiledCode);
    }

    throw error;
  } finally {
    URL.revokeObjectURL(url); // Clean up the blob URL
  }
}

window.import = function (path) {
  const normalizedPath = normalizeModuleImportPath(path);
  const cachedImport = moduleImportCache.get(normalizedPath);
  if (cachedImport) {
    return cachedImport;
  }

  const importPromise = loadModuleImport(normalizedPath).catch((error) => {
    moduleImportCache.delete(normalizedPath);
    moduleSourceCache.delete(normalizedPath);
    modulePreparedCodeCache.delete(normalizedPath);
    throw error;
  });
  moduleImportCache.set(normalizedPath, importPromise);
  return importPromise;
};


// Calls convertImports on static imports
async function handleImports(code, pathTo, filename) {
  if (!code.includes("import")) {return code;}
  const importState = {
    importedLocals: new Set(),
  };

  return code.replace(
    STATIC_IMPORT_PATTERN,
    (statement, indentation, sideEffectQuote, sideEffectSpecifier, importClause, fromQuote, fromSpecifier) => {
      const specifier = sideEffectSpecifier || fromSpecifier;
      const imports = parseImportClause(importClause);
      if (imports.typeOnly) {
        return "";
      }

      const importTarget = getStaticImportTarget(specifier, pathTo, imports);
      if (!importTarget) {
        return statement;
      }

      return `${indentation}${transformStaticImportsToDynamic(
        importClause,
        imports,
        importTarget.moduleImportExpression,
        importTarget.modulePath,
        importState
      )}`;
    }
  );
}

function toPreact(code){
  if(window.Bundless.to == 'preact'){
    let prefix;
    prefix = `import { h, render } from 'https://esm.sh/preact@10.5.13/es2022/preact.mjs';\n`;
    prefix += `import { useState, useEffect, useContext, useRef, useMemo } from 'https://esm.sh/preact@10.5.13/es2022/hooks.mjs';\n`;
    code = code.replace(/React.createElement/g, "h");
    code = code.replace(/ReactDOM.render/g, "render");
    code = code.replace(/React.useState/g, "useState");
    code = code.replace(/React.useEffect/g, "useEffect");
    code = code.replace(/React.useContext/g, "useContext");
    code = code.replace(/React.useRef/g, "useRef");
    code = code.replace(/React.useMemo/g, "useMemo"); // useContext, useMemo
    code = code.replace(/React.Fragment/g, "");

    code = code.replace(
      STATIC_IMPORT_PATTERN,
      (statement, indentation, sideEffectQuote, sideEffectSpecifier, importClause, fromQuote, fromSpecifier) => {
        if (fromSpecifier && isPreactReactPackageImport(fromSpecifier)) {
          return "";
        }
        return statement;
      }
    );
    code = prefix + code;
  }
  return code;
}

export {handleBundlessPrefetchScriptTags, handleImports, handleScriptTag, hasBundlessPrefetchScriptTags, runWhenDocumentReady, startBundlessPrefetches, toPreact};
