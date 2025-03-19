// transpile.js

// On Start
async function processScripts(scriptTags) { 
  for (let scriptTag of scriptTags) {
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

    console.log('processScripts: transpileCode:', {pathTo, filename});
    const transpiledCode = await window.Bundless.transpileCode(jsxCode, pathTo, filename);
    insertScript(transpiledCode);
  }
} 

let dynamicImportList = false;
window.import = async function (path) {
  console.log("~~~~ window.import: ", path);
  dynamicImportList = [];
  let basePath = path.split("/").slice(0, -1).join("/");
  // console.log("~~~~ basePath: ", basePath);
  const response = await fetch(path);
  if (!response.ok) {
    console.error(`Failed to load ${path}: ${response.statusText}`);
    throw new Error(`Failed to load ${path}`);
  }
  const code = await response.text();
  // console.log("~~~~ code: ", code);
  const transpiledCode = await window.Bundless.transpileCode(code, basePath);
  const blob = new Blob([transpiledCode], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  // console.log("~~~~ blob URL: ", url);
  try {
    const module = await import(url);
    return module;
  } catch (error) {
    console.error(`Failed to import module from ${url}: ${error.message}`);
    throw error;
  } finally {
    URL.revokeObjectURL(url); // Clean up the blob URL
  }
  dynamicImportList = false;
};

const importList = []; 
function insertScript(transpiledCode) {
  // console.log('insertScript', {transpiledCode})
  const script = document.createElement("script");
  script.type = "module";
  script.textContent = transpiledCode; 
  document.body.appendChild(script);
}

async function handleImports(code, pathTo, filename) {
  // console.log('handleImports:', filename);
  const lines = code.split("\n");
  const transformedLines = [];

  for (let line of lines) {
    let flag = line.trim().startsWith("import") || line.includes("import(")
    if ( flag ) { 
      const commentedOut = line.trim().startsWith("//");
      if (commentedOut) {
        transformedLines.push(line);
        continue;
      }
      let importParts = line.trim().split(" ");
      let importPath = importParts.at(-1).replaceAll(/['";]/g, "");
      let moduleName = importPath.split("/").slice(-1)[0]; 

      let done = false;
      let inBrackets = false;
      let defaultExport = false;
      let namedExports = [];
      let imported = importParts
        .map((part) => {
          part = part.trim().replaceAll(/['";]/g, "").replaceAll(",", "");
          if (done || ["import"].includes(part)) {
            return false;
          }
          if (["}", "from"].includes(part)) {
            done = true;
            return false;
          }
          if (part == "{") {
            inBrackets = true;
            return false;
          }
          let list = dynamicImportList ? dynamicImportList : importList;
          if (list.includes(part)) {
            // console.log(`Transpiler: Already Imported: ${part}`);
            return false;
          }
          else {
            // console.log('Transpiler: import part:', part);
            list.push(part);
            if (inBrackets) {
              namedExports.push(part);
            } else {
              defaultExport = part;
            }
            return part;
          }
        })
        .filter(Boolean);

      // continue if nothing was added
      // console.log('Transpiler: Import?:', {importParts, imported});
      if (imported.length == 0) continue;

      // recreate the import line
      // -> import React, {useEffect, useState} from 'react';
      // -> import React from 'react';
      // -> import {useEffect, useState} from 'react';
      let defaultAndNamed =
        defaultExport && namedExports.length > 0
          ? `${defaultExport}, {${namedExports.join(", ")}}`
          : "";
      // console.log('Transpiler: Import:', {defaultExport, namedExports, defaultAndNamed});
      if (line.includes("import(")) {
        transformedLines.push(line);
        continue;
      }
      if (defaultAndNamed) { 
        line = `import ${defaultAndNamed} from '${importPath}'`;
      } else if (defaultExport && namedExports.length == 0) {
        line = `import ${defaultExport} from '${importPath}'`;
      } else if (namedExports.length > 0) {
        line = `import {${namedExports.join(", ")}} from '${importPath}'`;
      } else {
        console.log("Bundless: ERROR: CHECK THIS OUT:", line);
        continue;
      }

      // If the import doesn't have a file extension (e.g., import React from 'react')
      const hasNoExtension = !line.includes("."); 
      if (hasNoExtension) {
        // Check if the module is already loaded in the window object
        let alreadyLoaded = window[importParts[1]];
        if (alreadyLoaded) {
          console.log(`Transpiler: AlreadyLoaded: Window.${importParts[1]}`);
          transformedLines.push(line);
          continue;
        }
        // Check if the module is defined in the import map
        const url = isInImportMap(importPath);
        if (url) {
          // If found in the import map, replace the module name with the URL
          // console.log(`Transpiler: ImportMap: ${importPath} -> ${url}`);
          const newLine = line.replace(
        new RegExp(importPath + "(?!.*" + importPath + ")"),
        url
          );
          transformedLines.push(newLine);
          continue;
        } else {
          console.log("Transpiler: ERROR2: CHECK THIS OUT:", line);
          continue;
        }
      }

      let formatPath = (path) => {
        // update path to handle ../ and ./
        let parts = path.split("/");
        let newPath = [];
        for (let part of parts) {
          if (part == "..") {
            newPath.pop();
          } else if (part != ".") {
            newPath.push(part);
          }
        }
        return newPath.join("/");
      };

      // Get the full path for relative imports
      const isRelativePath = importPath.startsWith(".");
      let newBasePath = pathTo;
      let filename = importPath.split("/").slice(-1)[0];
      if (isRelativePath) {
        const relBasePath = `${pathTo}/${importPath
          .split("/")
          .slice(0, -1)
          .join("/")}`;
        importPath = `${relBasePath}/${importPath.split("/").slice(-1)}`;
        newBasePath = formatPath(relBasePath);
      }
      // console.log(
      //   `%cTranspiler: Handling : ${importPath}`,
      //   "background: #bada55; color: #222"
      // );

      // check if .js
      const isJS = line.includes(".js");
      if (isJS) {
        const response = await fetch(importPath);
        if (!response.ok) throw new Error(`Failed to load ${importPath}`);
        const jsCode = await response.text();
        const isJSX = line.includes(".jsx");
        if (isJSX) {
          // console.log("Transpiling JSX:", line);
          const jsxText = await handleImports(jsCode, newBasePath, filename);
          transformedLines.push(jsxText);
        } else {
          // console.log("Transpiling JS:", line);
          const jsxText = await handleImports(jsCode, newBasePath, filename);
          transformedLines.push(jsxText);
        }
      }
    } else {
      transformedLines.push(line);
    }
  }
  // console.log(pathTo, transformedLines.join("\n"));

  return transformedLines.join("\n");
}

function isInImportMap(moduleName) {
  const scriptTag = document.querySelector('script[type="importmap"]');
  if (!scriptTag) return false;

  try {
    const importMap = JSON.parse(scriptTag.textContent);
    return importMap.imports && importMap.imports[moduleName];
  } catch (error) {
    console.error("Error parsing import map:", error);
    return false;
  }
}

function toPreact(code){
  if(window.Bundless.to === 'preact'){
    let prefix;
    prefix = `import { h, render } from 'https://esm.sh/preact@10.5.13/es2022/preact.mjs';\n`;
    prefix += `import { useState, useEffect, useRef, useMemo } from 'https://esm.sh/preact@10.5.13/es2022/hooks.mjs';\n`; 
    code = code.replace(/React.createElement/g, "h");  
    code = code.replace(/ReactDOM.render/g, "render"); 
    code = code.replace(/React.useState/g, "useState"); 
    code = code.replace(/React.useEffect/g, "useEffect");
    code = code.replace(/React.useRef/g, "useRef");
    code = code.replace(/React.useMemo/g, "useMemo");
    code = code.replace(/React.Fragment/g, "");
    
    code = code.replace(/import React.*from ['"].*['"];?\n?/g, "");
    code = prefix + code;
  } 
  return code;
}

export {handleImports, processScripts, toPreact};