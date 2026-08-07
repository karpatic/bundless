// transpile.js

// This transforms static import statements into dynamic import expressions
function transformStaticImportsToDynamic(importPath, importFileName, namedExports, defaultExport) {
  let dynamicImportCode = '';

  // Handle default export
  if (defaultExport) {
    dynamicImportCode += `const ${defaultExport} = await window.import('${importPath}${importFileName}').then(m => m.default); `;
  }

  // Handle named exports - FIXED to use window.import with full path including filename
  if (namedExports.length > 0) {
    dynamicImportCode += `const {${namedExports.join(", ")}} = await window.import('${importPath}${importFileName}'); `;
  }

  // Handle entire file
  if (namedExports.length == 0 && !defaultExport) {
    dynamicImportCode += `await window.import('${importPath}${importFileName}'); `;
  }

  return dynamicImportCode;
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

window.Bundless = {
  ...window.Bundless,
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


let handleImportLine = function (line, currentFilePath, fileName, importList) {
  line = line.replace(/\{/g, ' { ').replace(/\}/g, ' } '); // Brackets NEED spaces
  let importParts = line.trim().split(" ");
  // console.log('handleImportLine:', {line, currentFilePath, importParts});
  let importPath = importParts.at(-1).replaceAll(/['";]/g, "");

  // Gather class and variable names
  let namedExports = [];
  let done, inBrackets, defaultExport = false;
  let imported = importParts.map((part) => {
      part = part.trim().replaceAll(/['";]/g, "").replaceAll(",", "");
      if (done || ["import"].includes(part)) { return false; }  // Stop start and skip conditions
      if (["}", "from"].includes(part)) { done = true; return false; }
      if (part == "{") { inBrackets = true; return false; }
      if (importList.includes(part)) { return false; }
      else {
        importList.push(part);
        if (inBrackets) { namedExports.push(part); }            // named export
        else { defaultExport = line.includes(' from ') && part; } // default export
        return part;
      }
    }).filter(Boolean);
  if (imported.length == 0) return line;

  let alreadyLoaded = window[importParts[1]];
  if (alreadyLoaded) { return line; }

  const useImportMap = !line.includes(".");
  if (useImportMap) {  const url = isInImportMap(importPath);
    if (url) { return line.replace( new RegExp(importPath + "(?!.*" + importPath + ")"), url ) }
    else { console.log('Bundless: Import Error:', line); return line; }
  }

  let importFileName = importPath.split("/").slice(-1)[0];
  importPath = importPath.split("/").slice(0, -1).join("/")+"/";

  const isRelativePath = importPath.startsWith(".");
  if (isRelativePath) {
    currentFilePath = currentFilePath.replace(/\/$/, "");
    let newPath = currentFilePath.split("/");
    // console.log('getPath:', newPath);
    for (let part of importPath.split("/") ) {
        if (part === "..") { if (newPath.length > 0) {
            newPath.pop();
        } }
        else if (part !== ".") {
          newPath.push(part);
        }
    }

    // console.log('getPath:', {currentFilePath, importPath, newPath:newPath.join("/")});
    importPath = newPath.join("/");

  } else{ }

  if (!window.Bundless.cache) {
    importFileName += `?cachebust=${Date.now()}`;
  }

    const isModuleFile = /\.(mjs|js|ts)(\?|$)/.test(importFileName);
    if (isModuleFile) {
    let newLine = transformStaticImportsToDynamic(importPath, importFileName, namedExports, defaultExport);
    // console.log('handleImportLine: importPath:', {importPath, importFileName, newLine});
    return newLine;
  }

}

// Calls convertImports on static imports
async function handleImports(code, pathTo, filename) {
  if (!code.includes("import")) {return code;}
  // const commentedOut = line.trim().startsWith("//");
  // if (commentedOut) { transformedLines.push(line); return; }
  const importList = [];
  const transformedLines = code.split("\n").map(async (line) => line.trim().startsWith("import") ? handleImportLine(line, pathTo, filename, importList) : line);
  let finalCode = (await Promise.all(transformedLines)).join("\n");
  // console.log('handleImports:', finalCode);
  return finalCode
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

    code = code.replace(/import React.*from ['"].*['"];?\n?/g, "");
    code = prefix + code;
  }
  return code;
}

export {handleBundlessPrefetchScriptTags, handleImports, handleScriptTag, hasBundlessPrefetchScriptTags, startBundlessPrefetches, toPreact};
